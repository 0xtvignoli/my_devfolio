import { NextRequest, NextResponse } from 'next/server';
import { validateContactSubmission } from '@/lib/contact-validation';
import { isContactFormConfigured } from '@/lib/contact-config';
import { createRateLimiter } from '@/lib/rate-limit';
import { CONTACT_EMAIL } from '@/lib/seo/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Relays the contact form to a real inbox. The address never reaches the client:
 * it lives in CONTACT_EMAIL server-side, which is the whole point of having a
 * form rather than a mailto.
 *
 * No SDK — the provider's REST API is one POST, and a dependency for that is a
 * supply-chain surface for nothing. Swapping provider means editing sendEmail().
 */

// A public form is a spam target. Deliberately tighter than /api/ask: nobody
// legitimately sends three messages in ten minutes.
const rateLimited = createRateLimiter(3, 10 * 60_000);

/** Cloudflare sets this to the real client IP; behind two proxies the XFF chain
    is a list that both of them append to, so prefer the single-value header. */
function clientIp(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** Optional second gate: only enforced once a Turnstile secret is configured. */
async function turnstilePassed(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== 'string' || !token) return false;

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const data = await response.json();
    return data.success === true;
  } catch {
    // Verification unreachable: fail closed. A form that silently stops
    // verifying is worse than a form that is briefly unavailable.
    return false;
  }
}

async function sendEmail(name: string, email: string, message: string): Promise<boolean> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL,
      to: [CONTACT_EMAIL],
      // Reply goes straight to the visitor, so the inbox behaves like a normal thread.
      reply_to: email,
      subject: `Portfolio contact — ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });

  if (!response.ok) {
    console.error('contact send failed:', response.status, await response.text().catch(() => ''));
    return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  // Validation before the config check, so the contract is testable on a deploy
  // with no provider key.
  const validation = validateContactSubmission(body);
  if (!validation.ok) {
    // A bot that filled the honeypot is told everything went fine; it has no
    // reason to learn which signal caught it.
    if (validation.field === 'company') return NextResponse.json({ ok: true });
    return NextResponse.json({ error: 'invalid', field: validation.field }, { status: 400 });
  }

  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  if (!(await turnstilePassed((body as Record<string, unknown>).turnstileToken, ip))) {
    return NextResponse.json({ error: 'challenge_failed' }, { status: 403 });
  }

  if (!isContactFormConfigured()) {
    // The UI hides the form in this state; anyone reaching here called the API
    // directly, so say plainly that it is unconfigured rather than pretend.
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  const { name, email, message } = validation.value;
  const sent = await sendEmail(name, email, message);
  return sent
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: 'send_failed' }, { status: 502 });
}

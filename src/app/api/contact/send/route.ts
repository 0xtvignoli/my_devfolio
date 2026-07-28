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

type ChallengeResult = { passed: boolean; errors: string[] };

/**
 * Optional second gate: only enforced once a Turnstile secret is configured.
 *
 * Returns Cloudflare's own error-codes rather than a bare boolean. They are the
 * difference between the three ways this fails and they look identical from
 * outside: `missing-input-response` (the widget produced no token),
 * `invalid-input-secret` (wrong secret), `invalid-input-response` (token does not
 * belong to this secret — a mismatched sitekey/secret pair),
 * `timeout-or-duplicate` (token reused or expired).
 */
async function verifyChallenge(token: unknown, ip: string): Promise<ChallengeResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { passed: true, errors: [] };
  if (typeof token !== 'string' || !token) {
    return { passed: false, errors: ['missing-input-response'] };
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const data = await response.json();
    const errors: string[] = Array.isArray(data['error-codes']) ? data['error-codes'] : [];
    if (data.success !== true) console.error('turnstile rejected:', errors);
    return { passed: data.success === true, errors };
  } catch (err) {
    // Verification unreachable: fail closed. A form that silently stops verifying
    // is worse than a form that is briefly unavailable.
    console.error('turnstile verification threw:', err);
    return { passed: false, errors: ['verification-unreachable'] };
  }
}

type SendOutcome = { sent: true } | { sent: false; providerStatus: number | null };

/**
 * Domain part of CONTACT_FROM_EMAIL. Reported on failure because the single most
 * common cause of a provider 403 is a `from` on a domain the provider hasn't
 * verified — and without this you cannot tell that apart from a bad key without
 * server log access. A domain is public DNS, so this leaks nothing.
 */
function fromDomain(): string | null {
  return process.env.CONTACT_FROM_EMAIL?.split('@')[1] ?? null;
}

async function sendEmail(name: string, email: string, message: string): Promise<SendOutcome> {
  try {
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

    const body = await response.text().catch(() => '');
    if (!response.ok) {
      console.error('contact send rejected:', response.status, body);
      return { sent: false, providerStatus: response.status };
    }
    console.info('contact send accepted:', body.slice(0, 200));
    return { sent: true };
  } catch (err) {
    // The mail call is the most likely thing here to fail transiently, and it was
    // the only external call left unguarded — an unhandled rejection turns into a
    // 500 at the origin, which Cloudflare then serves as a bodiless 502.
    console.error('contact send threw:', err);
    return { sent: false, providerStatus: null };
  }
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

  const challenge = await verifyChallenge((body as Record<string, unknown>).turnstileToken, ip);
  if (!challenge.passed) {
    // 403 keeps its body through Cloudflare (only 5xx bodies get replaced), so the
    // codes reach whoever is debugging this.
    return NextResponse.json({ error: 'challenge_failed', codes: challenge.errors }, { status: 403 });
  }

  // NOTE on status codes. Everything below answers 200 with a flag rather than a
  // 5xx, because Cloudflare replaces origin 5xx bodies with its own bodiless
  // "error code: 502" page — so a carefully worded JSON error never reached the
  // browser. 4xx bodies pass through untouched, which is why the client-error
  // cases above keep their real status.
  if (!isContactFormConfigured()) {
    return NextResponse.json({ ok: false, reason: 'not_configured' });
  }

  const { name, email, message } = validation.value;
  const outcome = await sendEmail(name, email, message);
  if (outcome.sent) return NextResponse.json({ ok: true });

  // providerStatus is the mail provider's HTTP status: 401 bad key, 403 domain not
  // verified or account restricted, 422 bad from/to. A bare status code is not
  // sensitive, and it is the difference between diagnosing this and guessing.
  return NextResponse.json({
    ok: false,
    reason: 'send_failed',
    providerStatus: outcome.providerStatus,
    fromDomain: fromDomain(),
  });
}

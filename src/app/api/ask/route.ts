import { NextRequest, NextResponse } from 'next/server';
import { answerPortfolioQuestion } from '@/ai/portfolio-assistant';
import { createRateLimiter } from '@/lib/rate-limit';

// The model runs server-side (needs the Google GenAI key), so this must not be static.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_QUESTION_LEN = 500;

// Per-instance backstop, 8 requests/minute per IP. The rule that actually caps
// spend on this endpoint is applied at the edge — see
// scripts/cloudflare-apply-security.sh.
const rateLimited = createRateLimiter(8, 60_000);

export async function POST(req: NextRequest) {
  // Cloudflare sets cf-connecting-ip to the real client IP. Prefer it: with both
  // Cloudflare and Vercel in the chain, x-forwarded-for is a list that each of
  // them appends to, so parsing position is guesswork.
  const ip =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json(
      { answer: 'Rate limit reached — give the assistant a moment and try again.' },
      { status: 429 }
    );
  }

  let question: unknown;
  try {
    ({ question } = await req.json());
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  if (typeof question !== 'string' || !question.trim()) {
    return NextResponse.json({ error: 'question (non-empty string) required' }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_LEN) {
    return NextResponse.json({ error: `question too long (max ${MAX_QUESTION_LEN} chars)` }, { status: 400 });
  }

  try {
    const answer = await answerPortfolioQuestion(question);
    return NextResponse.json({ answer });
  } catch (err) {
    console.error('ask route error:', err);
    // Still a 200 with a printable line, because the lab terminal renders
    // `answer` verbatim. `degraded` lets the marketing widget show its own
    // localized copy instead of this English fallback — without it, a dead model
    // put developer-facing text on the landing page.
    return NextResponse.json(
      {
        answer: 'Assistant error — the model call failed. Try again in a moment.',
        degraded: true,
      },
      { status: 200 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { answerPortfolioQuestion } from '@/ai/portfolio-assistant';

// The model runs server-side (needs the Google GenAI key), so this must not be static.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_QUESTION_LEN = 500;

// ponytail: per-instance sliding window — good enough to blunt casual abuse of a
// public LLM endpoint. Move to Upstash/KV if this ever runs hot across instances.
const RATE_LIMIT = 8; // requests
const RATE_WINDOW_MS = 60_000; // per minute per IP
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  const ip =
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
    // Surface a terminal-friendly line rather than a raw 500 the UI can't render.
    return NextResponse.json(
      { answer: 'Assistant error — the model call failed. Try again in a moment.' },
      { status: 200 }
    );
  }
}

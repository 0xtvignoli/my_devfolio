import { canaryPair } from '@/lib/canary-keys';

/**
 * Lab phase 3, channel "robots.txt": /api/internal/backup/ is listed as
 * Disallow, and this is what a bot that reads it as a map finds there. A decoy
 * key from Vercel env, or a plain 404 when none is set.
 */
export const dynamic = 'force-static';

export function GET() {
  const key = canaryPair('ROBOTS');
  if (!key) return new Response('Not found', { status: 404 });
  return new Response(`[default]\naws_access_key_id = ${key.access}\naws_secret_access_key = ${key.secret}\nregion = eu-south-1\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  });
}

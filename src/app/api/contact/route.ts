import { CONTACT_EMAIL } from '@/lib/seo/constants';

/**
 * The contact address, for the few client-side bits that genuinely need it (the
 * copy button, the assistant's email fallback). Keeping it out of props means it
 * never lands in a page's RSC payload — a scraper has to fetch this endpoint
 * rather than grep the HTML.
 *
 * ponytail: a speed bump, not a secret. Anything running JS still gets it —
 * exactly like Cloudflare's email obfuscation, which this complements rather
 * than replaces.
 */
export const dynamic = 'force-static';

export function GET() {
  return Response.json(
    { email: CONTACT_EMAIL },
    { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } }
  );
}

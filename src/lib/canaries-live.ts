import { CANARIES, foldHits, type Canary, type CanaryHit } from '@/data/canaries';

// canarytokens.org's API mount (frontend/app.py ROOT_API_ENDPOINT), same URL as
// "Download incident list JSON" on a token's manage page.
const API = 'https://canarytokens.org/d3aece8093b71007b5ccfedad91ebb11/download';

/**
 * The recorded canaries plus whatever each token's live history adds.
 * CANARY_EXPORTS="docker=<token>:<auth>,decoy-env=<token>:<auth>,…" lives in
 * Vercel env only: token + auth open the manage page, never commit them.
 * Without it, or when canarytokens fails, the recorded entry stands.
 * [SEC] The raw export (it holds IPs) is never cached: only foldHits' output
 * reaches the page.
 * no-store, not next.revalidate: a fetch cached as long as the page is always
 * stale when the page regenerates, so the page would show the previous fetch.
 * The page's own revalidate still caps calls to one per window (force-static).
 */
export async function liveCanaries(): Promise<Canary[]> {
  const creds = new Map(
    (process.env.CANARY_EXPORTS ?? '').split(',').map((p) => {
      const [id, cred = ''] = p.trim().split('=');
      return [id, cred] as const;
    }),
  );
  return Promise.all(
    CANARIES.map(async (c) => {
      const [token, auth] = creds.get(c.id)?.split(':') ?? [];
      if (!token || !auth) return c;
      try {
        const url = `${API}?fmt=incidentlist_json&token=${encodeURIComponent(token)}&auth=${encodeURIComponent(auth)}`;
        const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
        if (!res.ok) return c;
        const { hits } = (await res.json()) as { hits?: CanaryHit[] };
        return Array.isArray(hits) && hits.length ? foldHits(c, hits) : c;
      } catch {
        return c;
      }
    }),
  );
}

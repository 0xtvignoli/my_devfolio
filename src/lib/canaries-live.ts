import { CANARIES, foldHits, hitFacts, type Canary, type CanaryHit } from '@/data/canaries';
import { readSummary, saveSummary, syncCanary } from '@/lib/canary-store';

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
export async function liveCanaries({ sync = false } = {}): Promise<Canary[]> {
  // Pages only read the summary the sync left; only the sync route writes.
  const summary = sync ? {} : await readSummary();
  const kept: Partial<Record<Canary['id'], NonNullable<Awaited<ReturnType<typeof syncCanary>>>>> = {};
  const creds = new Map(
    (process.env.CANARY_EXPORTS ?? '').split(',').map((p) => {
      const [id, cred = ''] = p.trim().split('=');
      return [id, cred] as const;
    }),
  );
  const out = await Promise.all(
    CANARIES.map(async (c) => {
      const [token, auth] = creds.get(c.id)?.split(':') ?? [];
      if (!token || !auth) return summary[c.id] ? foldHits(c, [], summary[c.id]) : c;
      let hits: CanaryHit[] = [];
      try {
        const url = `${API}?fmt=incidentlist_json&token=${encodeURIComponent(token)}&auth=${encodeURIComponent(auth)}`;
        const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
        const body = res.ok ? ((await res.json()) as { hits?: unknown }) : {};
        if (Array.isArray(body.hits)) hits = body.hits as CanaryHit[];
      } catch {
        // canarytokens down: what the store kept still counts
      }
      // The export only holds the last 50 hits: the store keeps the ones that rolled off.
      const store = sync ? await syncCanary(c.id, hitFacts(hits)) : (summary[c.id] ?? null);
      if (sync && store) kept[c.id] = store;
      return hits.length || store ? foldHits(c, hits, store) : c;
    }),
  );
  if (sync && Object.keys(kept).length) await saveSummary(kept);
  return out;
}

import { CANARY_CALLS, CANARY_CHANNELS, type CanaryCall, type CanaryChannelId, type CanaryStore, type hitFacts } from '@/data/canaries';

/**
 * canarytokens.org keeps only a key's last 50 hits (MAX_HISTORY in its settings.py), so
 * the page alone can't count past 50. Every sync adds what it sees to Upstash Redis, as
 * sets: a hit seen by two syncs counts once, and two syncs at the same time can't double
 * count. Upstash's REST API, so no client dependency.
 * Budget (Upstash Free, ~500k commands a month): the sync writes every 5 minutes (~35 commands)
 * and leaves one summary key; pages read only that key, one GET per regeneration (~50k a month at most).
 * [SEC] Only hit times and CloudTrail call names go in (hitFacts): never IP, geo or user agent.
 * KV_* are the names the Vercel Marketplace integration sets; UPSTASH_* the ones of a plain Upstash database.
 */
const URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

async function pipeline(cmds: (string | number)[][]): Promise<unknown[] | null> {
  if (!URL || !TOKEN) return null;
  try {
    const res = await fetch(`${URL}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify(cmds),
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const out = (await res.json()) as { result?: unknown; error?: string }[];
    return Array.isArray(out) && out.length === cmds.length && out.every((r) => !r.error) ? out.map((r) => r.result) : null;
  } catch {
    return null;
  }
}

/** Adds this export's facts and returns everything kept so far; null without a store or when it fails. */
export async function syncCanary(id: CanaryChannelId, facts: ReturnType<typeof hitFacts>): Promise<CanaryStore | null> {
  const key = (k: string) => `canary:${id}:${k}`;
  const writes: (string | number)[][] = [];
  if (facts.uses.length) writes.push(['SADD', key('uses'), ...facts.uses]);
  if (facts.calls.length) writes.push(['SADD', key('calls'), ...facts.calls]);
  // NX: the earliest one seen wins; later exports only hold later hits.
  if (facts.first) writes.push(['SET', key('first'), facts.first, 'NX']);
  if (facts.quarantined) writes.push(['SET', key('quarantined'), facts.quarantined, 'NX']);
  const out = await pipeline([...writes, ['SCARD', key('uses')], ['SMEMBERS', key('calls')], ['GET', key('first')], ['GET', key('quarantined')]]);
  if (!out) return null;
  const [uses, calls, first, quarantined] = out.slice(writes.length);
  const stamp = (v: unknown) => (typeof v === 'string' && STAMP.test(v) ? v : null);
  return {
    uses: typeof uses === 'number' && Number.isInteger(uses) && uses >= 0 ? uses : 0,
    calls: Array.isArray(calls) ? CANARY_CALLS.filter((c: CanaryCall) => calls.includes(c)) : [],
    first: stamp(first),
    quarantined: stamp(quarantined),
  };
}

/** One sync per 4 minutes whoever asks: the sync URL is public, and neither canarytokens.org nor the Redis budget should pay for that. */
export async function takeSyncTurn(): Promise<boolean> {
  const out = await pipeline([['SET', 'canary:sync-lock', '1', 'NX', 'EX', 240]]);
  return out?.[0] === 'OK';
}

/** Written by the sync, read by the pages. */
export async function saveSummary(summary: Partial<Record<CanaryChannelId, CanaryStore>>): Promise<void> {
  await pipeline([['SET', 'canary:summary', JSON.stringify(summary)]]);
}

/**
 * The pages' only read: one GET. no-store, like the other live fetches: a cache as long as the
 * page's own revalidate would always be one window behind. Re-validated field by field like any other input, though only the sync writes it.
 */
export async function readSummary(): Promise<Partial<Record<CanaryChannelId, CanaryStore>>> {
  if (!URL || !TOKEN) return {};
  try {
    const res = await fetch(`${URL}/get/canary:summary`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    const { result } = (await res.json()) as { result?: unknown };
    const raw = typeof result === 'string' ? (JSON.parse(result) as Record<string, unknown>) : {};
    const out: Partial<Record<CanaryChannelId, CanaryStore>> = {};
    for (const id of CANARY_CHANNELS) {
      const v = raw[id] as Partial<CanaryStore> | undefined;
      if (!v || typeof v !== 'object') continue;
      out[id] = {
        uses: typeof v.uses === 'number' && Number.isInteger(v.uses) && v.uses >= 0 ? v.uses : 0,
        calls: Array.isArray(v.calls) ? CANARY_CALLS.filter((c) => v.calls!.includes(c)) : [],
        first: typeof v.first === 'string' && STAMP.test(v.first) ? v.first : null,
        quarantined: typeof v.quarantined === 'string' && STAMP.test(v.quarantined) ? v.quarantined : null,
      };
    }
    return out;
  } catch {
    return {};
  }
}

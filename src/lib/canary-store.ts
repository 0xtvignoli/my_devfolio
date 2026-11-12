import { CANARY_CALLS, CANARY_CHANNELS, type CanaryCall, type CanaryChannelId, type CanaryStore, type hitFacts } from '@/data/canaries';

/**
 * canarytokens.org keeps only a key's last 50 hits (MAX_HISTORY in its settings.py), so
 * the page alone can't count past 50. Every sync adds what it sees to Upstash Redis, as
 * set members: a hit seen by two syncs counts once, and two syncs at the same time can't double
 * count. Upstash's REST API, so no client dependency.
 * Budget (Upstash Free, ~500k commands a month): the sync runs every 5 minutes (~50 commands, a few
 * more when there are new hits) and leaves one summary key; pages read only that key, one GET per
 * regeneration (~50k a month at most).
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

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_HISTORY = 50;
const scoreOf = (use: string) => Number(use.split('|')[0]);
const dayOf = (sec: number) => new Date(sec * 1000).toISOString().slice(0, 10);
const nat = (v: unknown) => (typeof v === 'number' && Number.isInteger(v) && v >= 0 ? v : 0);

function readGaps(v: unknown): number {
  if (!Array.isArray(v)) return 0;
  const i = v.indexOf('gaps');
  return i % 2 === 0 ? nat(Number(v[i + 1])) : 0;
}

/** Upstash returns HGETALL as [field, value, …]; only day → count pairs get through. */
function readDaily(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!Array.isArray(v)) return out;
  for (let i = 0; i + 1 < v.length; i += 2) {
    const n = Number(v[i + 1]);
    if (typeof v[i] === 'string' && DAY.test(v[i]) && Number.isInteger(n) && n >= 0) out[v[i]] = n;
  }
  return out;
}

/**
 * Adds this export's facts and returns everything kept so far; null without a store or when it fails.
 * Uses live in a sorted set scored by hit time: same members as the old plain set, so the same
 * dedupe, and ZCOUNT gives the exact count of any UTC day. Only the days this export touched are
 * recounted into the daily hash, so the history costs a couple of commands a sync, not one per day.
 */
export async function syncCanary(id: CanaryChannelId, facts: ReturnType<typeof hitFacts>): Promise<CanaryStore | null> {
  const key = (k: string) => `canary:${id}:${k}`;
  const uses = facts.uses.filter((u) => Number.isFinite(scoreOf(u)));
  const writes: (string | number)[][] = [];
  if (uses.length) writes.push(['ZADD', key('times'), 'NX', ...uses.flatMap((u) => [scoreOf(u), u])]);
  if (facts.calls.length) writes.push(['SADD', key('calls'), ...facts.calls]);
  // NX: the earliest one seen wins; later exports only hold later hits.
  if (facts.first) writes.push(['SET', key('first'), facts.first, 'NX']);
  if (facts.quarantined) writes.push(['SET', key('quarantined'), facts.quarantined, 'NX']);
  // The newest hit kept before this export, read ahead of the writes.
  const out = await pipeline([
    ['ZRANGE', key('times'), -1, -1, 'WITHSCORES'],
    ...writes,
    ['ZCARD', key('times')],
    ['SMEMBERS', key('calls')],
    ['GET', key('first')],
    ['GET', key('quarantined')],
    // Day → count, plus a "gaps" field: one key, one read.
    ['HGETALL', key('daily')],
  ]);
  if (!out) return null;
  const [newest, ...rest] = out;
  const added = uses.length ? nat(rest[0]) : 0;
  const [total, calls, first, quarantined, dailyRaw] = rest.slice(writes.length);
  let count = nat(total);
  const daily = readDaily(dailyRaw);
  let gaps = readGaps(dailyRaw);
  const touched = new Set(added ? uses.map((u) => dayOf(scoreOf(u))) : []);

  // A full export that starts after the newest hit already kept: more than 50 calls came
  // between two syncs, and the ones in between were never seen. Counted, so the page can say so.
  const last = Array.isArray(newest) ? Number(newest[1]) : NaN;
  const gap = uses.length >= MAX_HISTORY && Number.isFinite(last) && Math.min(...uses.map(scoreOf)) > last;

  // One-off: hits kept as a plain set before the daily counts existed move into the sorted set.
  // Only while the daily hash is empty, so a key nobody has used yet pays one SMEMBERS a sync.
  // ponytail: dead once every canary:*:uses key is gone; drop this branch after 2026-12-31.
  const moves: (string | number)[][] = [];
  let legacy = false;
  if (!Object.keys(daily).length) {
    const old = await pipeline([['SMEMBERS', key('uses')]]);
    legacy = Array.isArray(old?.[0]) && old[0].length > 0;
    const members = Array.isArray(old?.[0]) ? (old[0] as unknown[]).filter((m): m is string => typeof m === 'string' && Number.isFinite(scoreOf(m))) : [];
    if (members.length) moves.push(['ZADD', key('times'), 'NX', ...members.flatMap((m) => [scoreOf(m), m])]);
    for (const m of members) touched.add(dayOf(scoreOf(m)));
  }

  if (touched.size || gap || moves.length) {
    const days = [...touched].sort();
    const start = (d: string) => Date.parse(`${d}T00:00:00Z`) / 1000;
    const counted = await pipeline([...moves, ...days.map((d) => ['ZCOUNT', key('times'), start(d), `(${start(d) + 86400}`]), ['ZCARD', key('times')]]);
    if (!counted) return null;
    const n = counted.slice(moves.length);
    days.forEach((d, i) => (daily[d] = nat(n[i])));
    count = nat(n.at(-1));
    const save: (string | number)[][] = [];
    if (days.length) save.push(['HSET', key('daily'), ...days.flatMap((d) => [d, daily[d]])]);
    if (gap) save.push(['HINCRBY', key('daily'), 'gaps', 1]);
    // The old set goes only once its hits are counted in the daily hash.
    if (legacy) save.push(['DEL', key('uses')]);
    if (save.length && !(await pipeline(save))) return null;
    if (gap) gaps += 1;
  }

  const stamp = (v: unknown) => (typeof v === 'string' && STAMP.test(v) ? v : null);
  return {
    uses: count,
    calls: Array.isArray(calls) ? CANARY_CALLS.filter((c: CanaryCall) => calls.includes(c)) : [],
    first: stamp(first),
    quarantined: stamp(quarantined),
    daily,
    gaps,
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
        daily: v.daily && typeof v.daily === 'object' ? readDaily(Object.entries(v.daily).flat()) : {},
        gaps: nat(v.gaps),
      };
    }
    return out;
  } catch {
    return {};
  }
}

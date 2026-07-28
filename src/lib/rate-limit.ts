/**
 * Sliding-window rate limiter, in memory.
 *
 * ponytail: SECOND layer only. This counts per serverless instance, so a burst
 * spread across instances slips through — the edge rule applied by
 * scripts/cloudflare-apply-security.sh is what actually caps the paid LLM
 * endpoint. Swap in Upstash/Vercel KV only if you need one shared counter.
 */

/** Bound on tracked keys: one entry per IP would otherwise grow forever. */
const MAX_TRACKED_KEYS = 5_000;

export type RateLimiter = (key: string) => boolean;

/** Returns a `limited(key)` predicate: true once `limit` hits land inside `windowMs`. */
export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const hits = new Map<string, number[]>();

  return function limited(key: string): boolean {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);

    // Evict keys whose window has fully expired. Only scans once the map is
    // big, so the common path stays O(1). If every key is still fresh the map
    // keeps growing — that means real concurrent traffic, not a leak.
    if (hits.size > MAX_TRACKED_KEYS) {
      for (const [k, times] of hits) {
        if (times.every((t) => now - t >= windowMs)) hits.delete(k);
      }
    }

    return recent.length > limit;
  };
}

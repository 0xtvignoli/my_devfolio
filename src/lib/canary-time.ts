import type { Canary } from '@/data/canaries';

const WEEK_MIN = 7 * 24 * 60;

/** Log scale, 1 min → 1 week, as a share of the track. */
export function position(ms: number): number {
  const min = Math.max(1, ms / 60_000);
  return Math.min(100, Math.max(2, (Math.log(min) / Math.log(WEEK_MIN)) * 100));
}

/** Time to first use, or time waited so far; null if not planted. */
export function wait(c: Canary, now: number): number | null {
  if (!c.plantedAt) return null;
  return (c.firstUseAt ? Date.parse(c.firstUseAt) : now) - Date.parse(c.plantedAt);
}

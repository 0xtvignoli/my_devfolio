/**
 * When each Lab phase 3 decoy port was opened to the internet (ISO UTC, the time
 * the NSG rule was created), null while closed. The stopwatch on its page runs
 * from `at` to the first contact the aggregator reports after `checkedUntil`:
 * the minutes we spent testing the port ourselves don't count as a visit.
 */
export type DecoyOpening = { at: string; checkedUntil?: string } | null;

export const DECOY_OPENED: Record<'ai' | 'redis', DecoyOpening> = {
  // 8/11 16:29 the service started but the NSG rule was missing: the port was really
  // reachable only from 9/11 08:22:41, followed by our own curl from Cloud Shell.
  ai: { at: '2026-11-09T08:22:41Z', checkedUntil: '2026-11-09T08:25:00Z' },
  redis: null,
};

/**
 * Lab L2a, one port a week. Only ids in PORTS (lib/decoys) have a service behind
 * them yet; the others are shown as coming next, name and port only.
 */
export const PORT_DECOYS = [
  { id: 'redis', name: 'Redis', port: 6379 },
  { id: 'docker', name: 'Docker API', port: 2375 },
  { id: 'elasticsearch', name: 'Elasticsearch', port: 9200 },
  { id: 'kubelet', name: 'kubelet', port: 10250 },
] as const;

/** First contact after our own checks, or null if nobody has come yet. */
export function firstContact(opening: DecoyOpening, firstTimes: string[] | undefined): string | null {
  if (!opening) return null;
  const after = opening.checkedUntil ?? opening.at;
  return firstTimes?.find((t) => t > after) ?? null;
}

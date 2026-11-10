import type { Port } from '@/lib/decoys';

/**
 * When each Lab phase 3 decoy port was opened to the internet (ISO UTC, the time
 * the NSG rule was created), null while closed. The stopwatch on its page runs
 * from `at` to the first contact the aggregator reports after `checkedUntil`:
 * the minutes we spent testing the port ourselves don't count as a visit.
 */
export type DecoyOpening = { at: string; checkedUntil?: string } | null;

export const DECOY_OPENED: Record<'ai' | Port, DecoyOpening> = {
  // 8/11 16:29 the service started but the NSG rule was missing: the port was really
  // reachable only from 9/11 08:22:41, followed by our own curl from Cloud Shell.
  ai: { at: '2026-11-09T08:22:41Z', checkedUntil: '2026-11-09T08:25:00Z' },
  // NSG rule from 9/11 12:14:09, but the service only answered after setup.sh finished.
  // No checkedUntil: our TCP check (ECHO lab-check) is dropped by the aggregator itself.
  redis: { at: '2026-11-09T12:28:56Z' },
  // NSG rule from 10/11 09:01:23 (the service was already up). No checkedUntil: our check
  // carries X-Lab-Check, and the aggregator drops that whole visit.
  docker: { at: '2026-11-10T09:01:23Z' },
  // NSG rule from 10/11 11:28:10 (the service was already up). Our check carries X-Lab-Check.
  elasticsearch: { at: '2026-11-10T11:28:10Z' },
  // NSG rule from 10/11 21:35:41 (the service was already up). Our check carries X-Lab-Check.
  kubelet: { at: '2026-11-10T21:35:41Z' },
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

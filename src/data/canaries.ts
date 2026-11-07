/**
 * Lab phase 3, board L1a: one decoy AWS key (canarytokens.org) per channel.
 * Edited by hand when a key is planted or an alert arrives. Only times and the
 * kind of call go here: never a key, an IP or anything from the alert body.
 */
export const CANARY_CHANNELS = ['decoy-env', 'html-comment', 'robots', 'docker', 'github'] as const;
export type CanaryChannelId = (typeof CANARY_CHANNELS)[number];
/** AWS API calls from the alert, reduced to these labels (GetCallerIdentity → identity, …). */
export type CanaryCall = 'identity' | 'list-buckets' | 'ec2' | 'iam' | 'other';

export type Canary = {
  id: CanaryChannelId;
  /** ISO UTC; null until planted. */
  plantedAt: string | null;
  /** ISO UTC of the first alert; null while nobody has used it. */
  firstUseAt: string | null;
  calls: CanaryCall[];
  /** The channel refused the key (e.g. GitHub push protection): that is the result. */
  blocked?: boolean;
};

export const CANARIES: Canary[] = [
  { id: 'decoy-env', plantedAt: '2026-11-06T18:33:00Z', firstUseAt: null, calls: [] },
  { id: 'html-comment', plantedAt: null, firstUseAt: null, calls: [] },
  { id: 'robots', plantedAt: null, firstUseAt: null, calls: [] },
  { id: 'docker', plantedAt: null, firstUseAt: null, calls: [] },
  { id: 'github', plantedAt: null, firstUseAt: null, calls: [] },
];

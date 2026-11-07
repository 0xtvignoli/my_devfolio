/**
 * Lab phase 3, board L1a: one decoy AWS key (canarytokens.org) per channel.
 * Edited by hand when a key is planted or an alert arrives. Only times and the
 * kind of call go here: never a key, an IP or anything from the alert body.
 */
export const CANARY_CHANNELS = ['decoy-env', 'html-comment', 'robots', 'docker', 'github'] as const;
export type CanaryChannelId = (typeof CANARY_CHANNELS)[number];
/** AWS API calls from the alert, reduced to what the caller was after, in display order. */
export const CANARY_CALLS = ['identity', 'secrets', 'ai', 'email', 'data', 'compute', 'network', 'iam', 'other'] as const;
export type CanaryCall = (typeof CANARY_CALLS)[number];

const CALL_PATTERNS: [RegExp, CanaryCall][] = [
  [/^GetCallerIdentity$/, 'identity'],
  [/Secret|Parameter/, 'secrets'],
  [/^(Converse|InvokeModel|ListFoundationModels|GetFoundationModel)/, 'ai'],
  [/SendQuota|SendEmail|SendRawEmail|EmailIdentities|ListIdentities/, 'email'],
  [/DBInstance|DBCluster|Tables?$|Bucket/, 'data'],
  [/Instances$|Functions|Clusters$|Applications$|Stacks$/, 'compute'],
  [/Vpcs|SecurityGroups|LoadBalancers|Subnets/, 'network'],
  [/Users|Roles|Policies|AccessKeys/, 'iam'],
];

/** CloudTrail eventName → label (DescribeDBInstances → data, Converse → ai, …). */
export function callOf(eventName: string): CanaryCall {
  return CALL_PATTERNS.find(([re]) => re.test(eventName))?.[1] ?? 'other';
}

export type Canary = {
  id: CanaryChannelId;
  /** ISO UTC; null until planted. */
  plantedAt: string | null;
  /** ISO UTC of the first alert; null while nobody has used it. */
  firstUseAt: string | null;
  calls: CanaryCall[];
  /** Calls recorded on the key so far. */
  hits?: number;
  /** ISO UTC when AWS itself attached its quarantine policy (key reported by GitHub secret scanning). */
  quarantinedAt?: string;
  /** The channel refused the key (e.g. GitHub push protection): that is the result. */
  blocked?: boolean;
};

export const CANARIES: Canary[] = [
  { id: 'decoy-env', plantedAt: '2026-11-06T18:33:00Z', firstUseAt: '2026-11-07T05:20:02Z', calls: ['ai', 'email'], hits: 50 },
  { id: 'html-comment', plantedAt: '2026-11-07T17:40:00Z', firstUseAt: null, calls: [] },
  { id: 'robots', plantedAt: '2026-11-07T17:40:00Z', firstUseAt: null, calls: [] },
  { id: 'docker', plantedAt: '2026-11-07T17:46:00Z', firstUseAt: '2026-11-07T17:48:00Z', calls: ['identity', 'secrets', 'data', 'compute', 'network', 'other'], hits: 55 },
  { id: 'github', plantedAt: '2026-11-07T18:24:00Z', firstUseAt: null, calls: [], quarantinedAt: '2026-11-07T18:26:43Z' },
];

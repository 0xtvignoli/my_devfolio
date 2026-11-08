/**
 * Lab phase 3, board L1a: one decoy AWS key (canarytokens.org) per channel.
 * The baseline: the page adds live history on top (lib/canaries-live). Only times and the
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
  /** ISO UTC of the latest alert seen. */
  lastUseAt?: string;
  calls: CanaryCall[];
  /** Calls recorded on the key so far. */
  hits?: number;
  /** ISO UTC when AWS itself attached its quarantine policy (key reported by GitHub secret scanning). */
  quarantinedAt?: string;
  /** The channel refused the key (e.g. GitHub push protection): that is the result. */
  blocked?: boolean;
};

export const CANARIES: Canary[] = [
  { id: 'decoy-env', plantedAt: '2026-11-06T18:33:00Z', firstUseAt: '2026-11-07T05:20:02Z', calls: ['ai', 'email'], hits: 50, lastUseAt: '2026-11-07T05:20:36Z' },
  { id: 'html-comment', plantedAt: '2026-11-07T17:40:00Z', firstUseAt: null, calls: [] },
  { id: 'robots', plantedAt: '2026-11-07T17:40:00Z', firstUseAt: null, calls: [] },
  { id: 'docker', plantedAt: '2026-11-07T17:46:00Z', firstUseAt: '2026-11-07T17:48:00Z', calls: ['identity', 'secrets', 'data', 'compute', 'network', 'other'], hits: 55, lastUseAt: '2026-11-07T17:56:50Z' },
  { id: 'github', plantedAt: '2026-11-08T09:30:56Z', firstUseAt: '2026-11-08T09:33:00Z', calls: ['ai'], hits: 50 },
];

/** One hit in a canarytokens.org history export (the fields we read; it has more). */
export type CanaryHit = {
  time_of_hit: number;
  useragent?: string;
  additional_info?: { aws_key_log_data?: { eventName?: string[] } } | null;
};

const iso = (s: number) => new Date(s * 1000).toISOString().replace(/\.\d+Z$/, 'Z');

/**
 * Folds a history export into a recorded entry.
 * [SEC] Reads only time_of_hit, the CloudTrail eventName and whether the user
 * agent is "AWS Internal": the caller's IP, geo and user agent never leave here.
 * AWS attaching its quarantine policy is not a use: it goes to quarantinedAt.
 * An export holds the last 50 hits, so counts never go down and an earlier
 * first use is kept.
 */
export function foldHits(base: Canary, hits: CanaryHit[]): Canary {
  const events = (h: CanaryHit) => h.additional_info?.aws_key_log_data?.eventName ?? [];
  const unique = [...new Map(hits.map((h) => [`${h.time_of_hit}|${events(h).join(',')}`, h])).values()];
  const internal = (h: CanaryHit) => h.useragent === 'AWS Internal';
  const uses = unique.filter((h) => !internal(h)).map((h) => h.time_of_hit);
  const quarantine = unique.filter(internal).map((h) => h.time_of_hit);
  const earliest = (a: string | null | undefined, b: number[]) => {
    const x = b.length ? iso(Math.min(...b)) : null;
    return a && (!x || a < x) ? a : x;
  };
  const found = new Set([...base.calls, ...unique.filter((h) => !internal(h)).flatMap((h) => events(h).map(callOf))]);
  const count = Math.max(base.hits ?? 0, uses.length);
  const quarantinedAt = earliest(base.quarantinedAt, quarantine);
  const latest = uses.length ? iso(Math.max(...uses)) : null;
  const lastUseAt = base.lastUseAt && (!latest || base.lastUseAt > latest) ? base.lastUseAt : latest;
  return {
    ...base,
    firstUseAt: earliest(base.firstUseAt, uses),
    calls: CANARY_CALLS.filter((c) => found.has(c)),
    ...(count ? { hits: count } : {}),
    ...(lastUseAt ? { lastUseAt } : {}),
    ...(quarantinedAt ? { quarantinedAt } : {}),
  };
}

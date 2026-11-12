/**
 * Lab phase 3, board L1a: one decoy AWS key (canarytokens.org) per channel.
 * The baseline: the page adds live history on top (lib/canaries-live). Only times and the
 * kind of call go here: never a key, an IP or anything from the alert body.
 */
export const CANARY_CHANNELS = ['decoy-env', 'html-comment', 'robots', 'docker', 'github'] as const;
export type CanaryChannelId = (typeof CANARY_CHANNELS)[number];
/** AWS API calls from the alert, reduced to what the caller was after, in display order. */
export const CANARY_CALLS = ['identity', 'secrets', 'ai', 'email', 'data', 'compute', 'network', 'iam', 'account', 'other'] as const;
export type CanaryCall = (typeof CANARY_CALLS)[number];

const CALL_PATTERNS: [RegExp, CanaryCall][] = [
  [/^GetCallerIdentity$/, 'identity'],
  [/Secret|Parameter/, 'secrets'],
  [/^(Converse|InvokeModel|ListFoundationModels|GetFoundationModel)/, 'ai'],
  [/SendQuota|SendEmail|SendRawEmail|EmailIdentities|ListIdentities|VerifiedEmail/, 'email'],
  [/DBInstance|DBCluster|Tables?$|Bucket/, 'data'],
  [/Instances$|Functions|Clusters$|Applications$|Stacks$/, 'compute'],
  [/Vpcs|SecurityGroups|LoadBalancers|Subnets|HostedZones/, 'network'],
  [/Users?$|Roles?$|Polic(y|ies)$|AccessKeys?$/, 'iam'],
  [/Budgets|Cost|Contact|Organization|Trails|AccountSummary/, 'account'],
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
  /** Live only: the calls in the current history (last 50 hits), oldest first. Never in the baseline. */
  timeline?: { at: number; name: string }[];
  calls: CanaryCall[];
  /** Calls recorded on the key so far. */
  hits?: number;
  /** Live only: hits per UTC day and the syncs that missed some (CanaryStore). */
  daily?: Record<string, number>;
  gaps?: number;
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

/** What lib/canary-store keeps across syncs: canarytokens.org forgets everything past a key's last 50 hits. */
export type CanaryStore = {
  uses: number;
  calls: CanaryCall[];
  first: string | null;
  quarantined: string | null;
  /** Hits per UTC day ('2026-11-12' → 41), from every sync since the store started. */
  daily: Record<string, number>;
  /** Times more than 50 hits came between two syncs: the ones in between were never seen. */
  gaps: number;
};

const events = (h: CanaryHit) => h.additional_info?.aws_key_log_data?.eventName ?? [];
const internal = (h: CanaryHit) => h.useragent === 'AWS Internal';
const unique = (hits: CanaryHit[]) => [...new Map(hits.map((h) => [`${h.time_of_hit}|${events(h).join(',')}`, h])).values()];

/**
 * The facts of an export worth keeping, for lib/canary-store. A use is "time|call,call":
 * the same hit seen in two syncs is the same string, so a set counts it once.
 * [SEC] Same as foldHits: times and CloudTrail call names only.
 */
export function hitFacts(hits: CanaryHit[]): { uses: string[]; calls: CanaryCall[]; first: string | null; quarantined: string | null } {
  const all = unique(hits);
  const uses = all.filter((h) => !internal(h));
  const q = all.filter(internal).map((h) => h.time_of_hit);
  return {
    uses: uses.map((h) => `${h.time_of_hit}|${events(h).filter((e) => /^[A-Za-z0-9]{1,64}$/.test(e)).join(',')}`),
    calls: [...new Set(uses.flatMap((h) => events(h).map(callOf)))],
    first: uses.length ? iso(Math.min(...uses.map((h) => h.time_of_hit))) : null,
    quarantined: q.length ? iso(Math.min(...q)) : null,
  };
}

/**
 * Folds a history export into a recorded entry.
 * [SEC] Reads only time_of_hit, the CloudTrail eventName and whether the user
 * agent is "AWS Internal": the caller's IP, geo and user agent never leave here.
 * AWS attaching its quarantine policy is not a use: it goes to quarantinedAt.
 * An export holds the last 50 hits, so counts never go down and an earlier
 * first use is kept; `store` adds what earlier syncs saw (lib/canary-store).
 */
export function foldHits(base: Canary, hits: CanaryHit[], store?: CanaryStore | null): Canary {
  const all = unique(hits);
  const uses = all.filter((h) => !internal(h)).map((h) => h.time_of_hit);
  const quarantine = all.filter(internal).map((h) => h.time_of_hit);
  const earliest = (a: string | null | undefined, b: number[]) => {
    const x = b.length ? iso(Math.min(...b)) : null;
    return a && (!x || a < x) ? a : x;
  };
  // eventName comes from CloudTrail, not the caller; still, only API-shaped names get through.
  const timeline = all
    .filter((h) => !internal(h))
    .flatMap((h) => events(h).filter((e) => /^[A-Za-z0-9]{1,64}$/.test(e)).map((name) => ({ at: h.time_of_hit, name })))
    .sort((a, b) => a.at - b.at);
  const found = new Set([...base.calls, ...(store?.calls ?? []), ...all.filter((h) => !internal(h)).flatMap((h) => events(h).map(callOf))]);
  const count = Math.max(base.hits ?? 0, uses.length, store?.uses ?? 0);
  const min = (a: string | null | undefined, b: string | null | undefined) => (a && b ? (a < b ? a : b) : (a ?? b ?? null));
  const quarantinedAt = min(earliest(base.quarantinedAt, quarantine), store?.quarantined);
  const latest = uses.length ? iso(Math.max(...uses)) : null;
  const lastUseAt = base.lastUseAt && (!latest || base.lastUseAt > latest) ? base.lastUseAt : latest;
  return {
    ...base,
    firstUseAt: min(earliest(base.firstUseAt, uses), store?.first),
    calls: CANARY_CALLS.filter((c) => found.has(c)),
    ...(count ? { hits: count } : {}),
    ...(lastUseAt ? { lastUseAt } : {}),
    ...(timeline.length ? { timeline } : {}),
    ...(store && Object.keys(store.daily).length ? { daily: store.daily } : {}),
    ...(store?.gaps ? { gaps: store.gaps } : {}),
    ...(quarantinedAt ? { quarantinedAt } : {}),
  };
}

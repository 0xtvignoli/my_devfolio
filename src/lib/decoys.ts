import { CATEGORIES, type Category } from '@/lib/observatory/classify';

/**
 * decoys.json comes from the decoy VM (Lab phase 2). That machine is built to be
 * attacked, so the file is untrusted input: parseDecoys rebuilds it field by field
 * from numbers, ISO dates and the fixed vocabularies below, and rejects anything else.
 */

// ponytail: same vocabularies as homelab decoys/aggregate.py; change both together.
export const USERNAMES = ['root', 'admin', 'ubuntu', 'user', 'test', 'oracle', 'postgres', 'pi', 'git', 'guest', 'support', 'ftp', 'mysql', 'deploy', 'other'] as const;
export const COMMANDS = ['uname', 'cat', 'cd', 'ls', 'wget', 'curl', 'chmod', 'echo', 'ps', 'nproc', 'free', 'whoami', 'id', 'w', 'crontab', 'history', 'passwd', 'rm', 'sh', 'bash', 'tftp', 'busybox', 'export', 'lscpu', 'top', 'ifconfig', 'other'] as const;
// Lab L2c: the Observatory's categories (the VM runs a copy of classify.ts). A superset of the old list,
// so files from before the change still parse.
export const HTTP_CATEGORIES = CATEGORIES;
// Lab L2b, the fake Ollama: route names, public model families, request size, key shape.
export const AI_CALLS = ['list', 'generate', 'pull', 'manage', 'info', 'other'] as const;
export const AI_MODELS = ['llama3', 'llama2', 'deepseek-r1', 'deepseek', 'qwen3', 'qwen2.5', 'qwen', 'mistral', 'mixtral', 'gemma3', 'gemma', 'phi4', 'phi3', 'gpt-oss', 'codellama', 'llava', 'nomic-embed-text', 'other'] as const;
export const AI_SIZES = ['small', 'medium', 'large'] as const;
export const AI_KEYS = ['openai', 'anthropic', 'other'] as const;
// Lab L2a, one service opened per week: command names from each service's yaml.
export const PORTS = ['redis', 'docker', 'elasticsearch', 'kubelet'] as const;
export type Port = (typeof PORTS)[number];
export const PORT_CALLS = {
  redis: ['ping', 'auth', 'info', 'recon', 'config', 'write', 'replicate', 'module', 'lua', 'other'],
  docker: ['ping', 'version', 'info', 'list', 'create', 'pull', 'start', 'exec', 'other'],
  elasticsearch: ['info', 'health', 'list', 'search', 'script', 'write', 'delete', 'other'],
  kubelet: ['healthz', 'pods', 'run', 'exec', 'logs', 'metrics', 'config', 'other'],
} as const satisfies Record<Port, readonly string[]>;
export type PortCall<P extends Port> = (typeof PORT_CALLS)[P][number];
export const PASSWORD_KINDS = ['sameAsUser', 'vendorDefault', 'keyboardWalk', 'digitsOnly', 'other'] as const;
/** Attempted passwords that are also in a public 100k list: first 16 hex of SHA-256, with a count. */
export type PasswordHash = { h: string; n: number };

type Counts<K extends string> = Partial<Record<K, number>>;

export type Decoys = {
  version: 1;
  generatedAt: string;
  from: string;
  to: string;
  ssh: {
    loginAttempts: number;
    distinctPasswords: number;
    sessions: number;
    payloadSessions: number;
    usernames: Counts<(typeof USERNAMES)[number]>;
    commands: Counts<(typeof COMMANDS)[number]>;
    /** Optional: files from before Lab phase 3 lack both. */
    passwordKinds?: Counts<(typeof PASSWORD_KINDS)[number]>;
    passwordHashes?: PasswordHash[];
  };
  http: {
    requests: number;
    envFetches: number;
    categories: Counts<(typeof HTTP_CATEGORIES)[number]>;
    /** Per-category counts aligned with `daily`. Optional: files from before Lab L2c lack it. */
    categoryDaily?: { category: Category; counts: number[] }[];
  };
  /** Optional: files from before Lab L2b lack it. */
  ai?: {
    requests: number;
    /** The first contacts ever (up to 5), kept past the 14-day window: the stopwatch. */
    firstTimes?: string[];
    calls: Counts<(typeof AI_CALLS)[number]>;
    models: Counts<(typeof AI_MODELS)[number]>;
    sizes: Counts<(typeof AI_SIZES)[number]>;
    keys: Counts<(typeof AI_KEYS)[number]>;
  };
  /** Optional: files from before Lab L2a lack it; a port appears once someone (not us) connected. */
  ports?: { [P in Port]?: PortStats<P> };
  daily: { date: string; ssh: number; http: number; ai?: number }[];
};

export type PortStats<P extends Port = Port> = {
  /** Visits in the 14-day window: a TCP connection, or one source address in one UTC day for HTTP. */
  connections: number;
  calls: Counts<PortCall<P>>;
  /** The first command of each connection. */
  firstMoves: Counts<PortCall<P>>;
  /** The first contacts ever (up to 5), kept past the window: the stopwatch. */
  firstTimes: string[];
  /** Visits per day, aligned with the top-level `daily`. Optional: files from before the port pages lack it. */
  daily?: number[];
  /** Up to 3 move sequences (repeats folded, first 6 moves), each seen at least twice. Optional, as daily. */
  sequences?: { moves: PortCall<P>[]; n: number }[];
};

const MAX = 1e9;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const HASH = /^[0-9a-f]{16}$/;
const MAX_HASHES = 5000;

class Invalid extends Error {}

function obj(v: unknown): Record<string, unknown> {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new Invalid();
  return v as Record<string, unknown>;
}

function count(v: unknown): number {
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > MAX) throw new Invalid();
  return v;
}

function str(v: unknown, re: RegExp): string {
  if (typeof v !== 'string' || !re.test(v)) throw new Invalid();
  return v;
}

function counts<K extends string>(v: unknown, vocab: readonly K[]): Counts<K> {
  const out: Counts<K> = {};
  for (const [k, n] of Object.entries(obj(v))) {
    if (!(vocab as readonly string[]).includes(k)) throw new Invalid();
    out[k as K] = count(n);
  }
  return out;
}

function categoryDaily(v: unknown, days: number): { category: Category; counts: number[] }[] {
  if (!Array.isArray(v) || v.length > HTTP_CATEGORIES.length) throw new Invalid();
  return v.map((item) => {
    const o = obj(item);
    if (!(HTTP_CATEGORIES as readonly unknown[]).includes(o.category) || !Array.isArray(o.counts) || o.counts.length !== days) throw new Invalid();
    return { category: o.category as Category, counts: o.counts.map(count) };
  });
}

function stamps(v: unknown): string[] {
  if (!Array.isArray(v) || v.length > 5) throw new Invalid();
  return v.map((x) => str(x, STAMP));
}

function ai(o: Record<string, unknown>): NonNullable<Decoys['ai']> {
  return {
    requests: count(o.requests),
    ...(o.firstTimes === undefined ? {} : { firstTimes: stamps(o.firstTimes) }),
    calls: counts(o.calls, AI_CALLS),
    models: counts(o.models, AI_MODELS),
    sizes: counts(o.sizes, AI_SIZES),
    keys: counts(o.keys, AI_KEYS),
  };
}

function dailyCounts(v: unknown, days: number): number[] {
  if (!Array.isArray(v) || v.length !== days) throw new Invalid();
  return v.map(count);
}

function sequences(v: unknown, vocab: readonly string[]): { moves: string[]; n: number }[] {
  if (!Array.isArray(v) || v.length > 3) throw new Invalid();
  return v.map((item) => {
    const o = obj(item);
    if (!Array.isArray(o.moves) || o.moves.length < 1 || o.moves.length > 6) throw new Invalid();
    if (!o.moves.every((m) => vocab.includes(m as string))) throw new Invalid();
    return { moves: o.moves as string[], n: count(o.n) };
  });
}

function ports(v: unknown, days: number): NonNullable<Decoys['ports']> {
  const out: NonNullable<Decoys['ports']> = {};
  for (const [k, item] of Object.entries(obj(v))) {
    if (!(PORTS as readonly string[]).includes(k)) throw new Invalid();
    const o = obj(item);
    const vocab: readonly string[] = PORT_CALLS[k as Port];
    // Each port's moves were checked against its own vocabulary above.
    (out as Record<string, unknown>)[k] = {
      connections: count(o.connections),
      calls: counts(o.calls, vocab),
      firstMoves: counts(o.firstMoves, vocab),
      firstTimes: stamps(o.firstTimes),
      ...(o.daily === undefined ? {} : { daily: dailyCounts(o.daily, days) }),
      ...(o.sequences === undefined ? {} : { sequences: sequences(o.sequences, vocab) }),
    };
  }
  return out;
}

function hashes(v: unknown): PasswordHash[] {
  if (!Array.isArray(v) || v.length > MAX_HASHES) throw new Invalid();
  return v.map((item) => {
    const o = obj(item);
    return { h: str(o.h, HASH), n: count(o.n) };
  });
}

/** A clean copy of the file, or null when anything in it is out of shape. */
export function parseDecoys(raw: unknown): Decoys | null {
  try {
    const d = obj(raw);
    if (d.version !== 1) return null;
    const ssh = obj(d.ssh);
    const http = obj(d.http);
    if (!Array.isArray(d.daily) || d.daily.length > 31) return null;
    return {
      version: 1,
      generatedAt: str(d.generatedAt, STAMP),
      from: str(d.from, DATE),
      to: str(d.to, DATE),
      ssh: {
        loginAttempts: count(ssh.loginAttempts),
        distinctPasswords: count(ssh.distinctPasswords),
        sessions: count(ssh.sessions),
        payloadSessions: count(ssh.payloadSessions),
        usernames: counts(ssh.usernames, USERNAMES),
        commands: counts(ssh.commands, COMMANDS),
        ...(ssh.passwordKinds === undefined ? {} : { passwordKinds: counts(ssh.passwordKinds, PASSWORD_KINDS) }),
        ...(ssh.passwordHashes === undefined ? {} : { passwordHashes: hashes(ssh.passwordHashes) }),
      },
      http: {
        requests: count(http.requests),
        envFetches: count(http.envFetches),
        categories: counts(http.categories, HTTP_CATEGORIES),
        ...(http.categoryDaily === undefined ? {} : { categoryDaily: categoryDaily(http.categoryDaily, d.daily.length) }),
      },
      ...(d.ai === undefined ? {} : { ai: ai(obj(d.ai)) }),
      ...(d.ports === undefined ? {} : { ports: ports(d.ports, Array.isArray(d.daily) ? d.daily.length : 0) }),
      daily: d.daily.map((day) => {
        const o = obj(day);
        return { date: str(o.date, DATE), ssh: count(o.ssh), http: count(o.http), ...(o.ai === undefined ? {} : { ai: count(o.ai) }) };
      }),
    };
  } catch (e) {
    if (e instanceof Invalid) return null;
    throw e;
  }
}

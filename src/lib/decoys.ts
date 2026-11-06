/**
 * decoys.json comes from the decoy VM (Lab phase 2). That machine is built to be
 * attacked, so the file is untrusted input: parseDecoys rebuilds it field by field
 * from numbers, ISO dates and the fixed vocabularies below, and rejects anything else.
 */

// ponytail: same vocabularies as homelab decoys/aggregate.py; change both together.
export const USERNAMES = ['root', 'admin', 'ubuntu', 'user', 'test', 'oracle', 'postgres', 'pi', 'git', 'guest', 'support', 'ftp', 'mysql', 'deploy', 'other'] as const;
export const COMMANDS = ['uname', 'cat', 'cd', 'ls', 'wget', 'curl', 'chmod', 'echo', 'ps', 'nproc', 'free', 'whoami', 'id', 'w', 'crontab', 'history', 'passwd', 'rm', 'sh', 'bash', 'tftp', 'busybox', 'export', 'lscpu', 'top', 'ifconfig', 'other'] as const;
export const HTTP_CATEGORIES = ['traversal', 'secrets', 'cms', 'admin', 'other'] as const;

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
  };
  http: { requests: number; envFetches: number; categories: Counts<(typeof HTTP_CATEGORIES)[number]> };
  daily: { date: string; ssh: number; http: number }[];
};

const MAX = 1e9;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

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
      },
      http: {
        requests: count(http.requests),
        envFetches: count(http.envFetches),
        categories: counts(http.categories, HTTP_CATEGORIES),
      },
      daily: d.daily.map((day) => {
        const o = obj(day);
        return { date: str(o.date, DATE), ssh: count(o.ssh), http: count(o.http) };
      }),
    };
  } catch (e) {
    if (e instanceof Invalid) return null;
    throw e;
  }
}

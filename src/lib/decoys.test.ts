import { expect, test } from 'bun:test';
import { parseDecoys } from './decoys';

const valid = {
  version: 1,
  generatedAt: '2026-11-06T09:41:52Z',
  from: '2026-10-24',
  to: '2026-11-06',
  ssh: {
    loginAttempts: 2,
    sessions: 2,
    payloadSessions: 1,
    usernames: { root: 1, admin: 1 },
    commands: { cd: 1, wget: 1 },
    distinctPasswords: 1,
  },
  http: {
    requests: 4,
    envFetches: 2,
    categories: { secrets: 2, cms: 1, traversal: 1 },
  },
  daily: [{ date: '2026-11-06', ssh: 2, http: 4 }],
};

const withSsh = (patch: object) => ({
  ...valid,
  ssh: { ...valid.ssh, ...patch },
});

test('accepts the aggregator output', () => {
  expect(parseDecoys(valid)).toEqual(valid as never);
});

test('drops fields it does not know', () => {
  const parsed = parseDecoys({ ...valid, note: '<script>' });
  expect(JSON.stringify(parsed).includes('script')).toBe(false);
});

const rejected: [string, unknown][] = [
  ['not an object', '[]'],
  ['another version', { ...valid, version: 2 }],
  [
    'a label outside the vocabulary',
    withSsh({ usernames: { '<img src=x>': 1 } }),
  ],
  ['text where a count goes', withSsh({ sessions: '9 <b>' })],
  ['a negative count', withSsh({ sessions: -1 })],
  ['a fractional count', withSsh({ sessions: 1.5 })],
  ['a free-text date', { ...valid, to: 'yesterday' }],
  [
    'too many days',
    { ...valid, daily: Array.from({ length: 40 }, () => valid.daily[0]) },
  ],
];
for (const [name, input] of rejected) {
  test(`rejects ${name}`, () => {
    expect(parseDecoys(input)).toBeNull();
  });
}

test('keeps password hashes and kinds when well formed', () => {
  const d = parseDecoys(withSsh({ passwordKinds: { vendorDefault: 3, other: 1 }, passwordHashes: [{ h: '0123456789abcdef', n: 3 }] }));
  expect(d?.ssh.passwordHashes).toEqual([{ h: '0123456789abcdef', n: 3 }]);
  expect(d?.ssh.passwordKinds).toEqual({ vendorDefault: 3, other: 1 });
});

test('rejects a password entry that is not a short hex hash', () => {
  expect(parseDecoys(withSsh({ passwordHashes: [{ h: 'hunter2', n: 1 }] }))).toBeNull();
  expect(parseDecoys(withSsh({ passwordHashes: [{ h: '0123456789ABCDEF', n: 1 }] }))).toBeNull();
  expect(parseDecoys(withSsh({ passwordKinds: { '<b>': 1 } }))).toBeNull();
});

test('files without the password fields still parse', () => {
  expect(parseDecoys(valid)?.ssh.passwordHashes).toBeUndefined();
});

const withHttp = (patch: object) => ({ ...valid, http: { ...valid.http, ...patch } });

test('keeps per-day categories when aligned with daily (Lab L2c)', () => {
  const d = parseDecoys(withHttp({ categories: { 'app-exploit': 1 }, categoryDaily: [{ category: 'app-exploit', counts: [1] }] }));
  expect(d?.http.categoryDaily).toEqual([{ category: 'app-exploit', counts: [1] }]);
});

test('rejects per-day categories out of vocabulary or out of step with daily', () => {
  expect(parseDecoys(withHttp({ categoryDaily: [{ category: '<b>', counts: [1] }] }))).toBeNull();
  expect(parseDecoys(withHttp({ categoryDaily: [{ category: 'secrets', counts: [1, 2] }] }))).toBeNull();
  expect(parseDecoys(withHttp({ categoryDaily: [{ category: 'secrets', counts: [-1] }] }))).toBeNull();
});

const ai = { requests: 5, firstTimes: ['2026-11-08T16:00:48Z'], calls: { list: 2, generate: 3 }, models: { 'deepseek-r1': 2 }, sizes: { small: 3 }, keys: { openai: 1 } };

test('keeps the AI decoy section (Lab L2b)', () => {
  const d = parseDecoys({ ...valid, ai, daily: [{ date: '2026-11-06', ssh: 2, http: 4, ai: 5 }] });
  expect(d?.ai).toEqual(ai);
  expect(d?.daily[0].ai).toBe(5);
  expect(parseDecoys(valid)?.ai).toBeUndefined();
});

test('rejects an AI section with labels outside the vocabulary', () => {
  expect(parseDecoys({ ...valid, ai: { ...ai, models: { 'my-finetune': 1 } } })).toBeNull();
  expect(parseDecoys({ ...valid, ai: { ...ai, keys: { 'sk-proj-abc': 1 } } })).toBeNull();
  expect(parseDecoys({ ...valid, ai: { ...ai, firstTimes: ['<b>'] } })).toBeNull();
  expect(parseDecoys({ ...valid, ai: { ...ai, firstTimes: Array(6).fill('2026-11-08T16:00:48Z') } })).toBeNull();
});

const redis = { connections: 3, calls: { info: 2, config: 1 }, firstMoves: { info: 2 }, firstTimes: ['2026-11-16T09:00:00Z'] };

test('keeps the port decoys section (Lab L2a)', () => {
  expect(parseDecoys({ ...valid, ports: { redis } })?.ports).toEqual({ redis });
  expect(parseDecoys({ ...valid, ports: {} })?.ports).toEqual({});
  expect(parseDecoys(valid)?.ports).toBeUndefined();
});

test('rejects ports or commands outside the vocabulary', () => {
  expect(parseDecoys({ ...valid, ports: { mongodb: redis } })).toBeNull();
  expect(parseDecoys({ ...valid, ports: { redis: { ...redis, calls: { 'CONFIG SET dir /tmp': 1 } } } })).toBeNull();
  expect(parseDecoys({ ...valid, ports: { redis: { ...redis, firstTimes: ['<b>'] } } })).toBeNull();
  expect(parseDecoys({ ...valid, ports: { redis: { ...redis, connections: -1 } } })).toBeNull();
  // Each port has its own vocabulary: a Redis move on Docker is out of shape.
  const docker = { connections: 2, calls: { version: 1, create: 1 }, firstMoves: { version: 1 }, firstTimes: [] };
  expect(parseDecoys({ ...valid, ports: { docker } })?.ports).toEqual({ docker });
  expect(parseDecoys({ ...valid, ports: { docker: { ...docker, calls: { replicate: 1 } } } })).toBeNull();
  expect(parseDecoys({ ...valid, ports: { redis: { ...redis, calls: { exec: 1 } } } })).toBeNull();
});

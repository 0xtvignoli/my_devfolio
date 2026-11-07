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

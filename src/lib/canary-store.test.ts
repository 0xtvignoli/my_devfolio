import { afterEach, expect, test } from 'bun:test';

process.env.KV_REST_API_URL = 'https://store.test';
process.env.KV_REST_API_TOKEN = 't';
const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

/** A fake Upstash: answers each pipeline with the next canned reply and keeps what was sent. */
function fakeStore(replies: unknown[][]) {
  const sent: unknown[][][] = [];
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    sent.push(JSON.parse(String(init.body)));
    return Response.json((replies.shift() ?? []).map((result) => ({ result })));
  }) as typeof fetch;
  return sent;
}

const T1 = Date.parse('2026-11-11T23:59:59Z') / 1000 + 0.25;
const T2 = Date.parse('2026-11-12T08:00:00Z') / 1000 + 0.5;

test('new hits go in scored by time; only the days they touch are recounted', async () => {
  const sent = fakeStore([
    // ZRANGE, ZADD, SADD, SET, ZCARD, SMEMBERS, GET, GET, HGETALL
    [[`${T1 - 60}|X`, String(T1 - 60)], 2, 1, 'OK', 412, ['ai', 'evil'], '2026-11-07T05:20:02Z', '<b>', ['2026-11-10', '7', 'evil', '1']],
    [40, 3, 413], // ZCOUNT 11 nov, ZCOUNT 12 nov, ZCARD
    [2], // HSET
  ]);
  const { syncCanary } = await import('./canary-store');
  const out = await syncCanary('github', { uses: [`${T1}|Converse`, `${T2}|Converse`], calls: ['ai'], first: '2026-11-07T05:20:02Z', quarantined: null });
  expect(sent[0][1]).toEqual(['ZADD', 'canary:github:times', 'NX', T1, `${T1}|Converse`, T2, `${T2}|Converse`]);
  expect(sent[1][0]).toEqual(['ZCOUNT', 'canary:github:times', Date.parse('2026-11-11T00:00:00Z') / 1000, `(${Date.parse('2026-11-12T00:00:00Z') / 1000}`]);
  expect(sent[2]).toEqual([['HSET', 'canary:github:daily', '2026-11-11', 40, '2026-11-12', 3]]);
  expect(out).toEqual({
    uses: 413,
    calls: ['ai'],
    first: '2026-11-07T05:20:02Z',
    quarantined: null,
    daily: { '2026-11-10': 7, '2026-11-11': 40, '2026-11-12': 3 },
    gaps: 0,
  });
});

test('nothing new: one pipeline, no recount', async () => {
  const sent = fakeStore([[[`${T2}|X`, String(T2)], 0, 1, [], null, null, ['2026-11-12', '3']]]);
  const { syncCanary } = await import('./canary-store');
  const out = await syncCanary('docker', { uses: [`${T2}|X`], calls: [], first: null, quarantined: null });
  expect(sent).toHaveLength(1);
  expect(out?.daily).toEqual({ '2026-11-12': 3 });
});

test('a full export newer than everything kept is counted as a gap', async () => {
  const uses = Array.from({ length: 50 }, (_, i) => `${T2 + i}|ListUsers`);
  const sent = fakeStore([[[`x`, String(T1)], 50, 100, [], null, null, ['2026-11-12', '50', 'gaps', '2']], [100, 150], [0, 3]]);
  const { syncCanary } = await import('./canary-store');
  const out = await syncCanary('html-comment', { uses, calls: [], first: null, quarantined: null });
  expect(sent[2]).toEqual([['HSET', 'canary:html-comment:daily', '2026-11-12', 100], ['HINCRBY', 'canary:html-comment:daily', 'gaps', 1]]);
  expect(out?.gaps).toBe(3);
});

test('the old plain set moves into the sorted set once, then goes', async () => {
  const sent = fakeStore([
    [[], 0, [], null, null, []],
    [[`${T1}|A`, `${T2}|B`, 'junk']],
    [2, 1, 1, 2],
    [2, 1],
  ]);
  const { syncCanary } = await import('./canary-store');
  const out = await syncCanary('robots', { uses: [], calls: [], first: null, quarantined: null });
  expect(sent[2][0]).toEqual(['ZADD', 'canary:robots:times', 'NX', T1, `${T1}|A`, T2, `${T2}|B`]);
  expect(sent[3]).toEqual([['HSET', 'canary:robots:daily', '2026-11-11', 1, '2026-11-12', 1], ['DEL', 'canary:robots:uses']]);
  expect(out).toMatchObject({ uses: 2, daily: { '2026-11-11': 1, '2026-11-12': 1 } });
});

test('a failing store is null, so the page falls back to the export alone', async () => {
  globalThis.fetch = (async () => new Response('nope', { status: 500 })) as unknown as typeof fetch;
  const { syncCanary, takeSyncTurn } = await import('./canary-store');
  expect(await syncCanary('docker', { uses: [], calls: [], first: null, quarantined: null })).toBeNull();
  expect(await takeSyncTurn()).toBe(false);
});

test('readSummary keeps only known canaries, calls, stamps and days', async () => {
  const summary = {
    github: { uses: 412, calls: ['ai', 'evil'], first: '2026-11-08T09:33:00Z', quarantined: 'x', daily: { '2026-11-08': 12, '<script>': 1, '2026-11-09': -3 }, gaps: 2 },
    mongodb: { uses: 1 },
  };
  globalThis.fetch = (async () => Response.json({ result: JSON.stringify(summary) })) as unknown as typeof fetch;
  const { readSummary } = await import('./canary-store');
  expect(await readSummary()).toEqual({
    github: { uses: 412, calls: ['ai'], first: '2026-11-08T09:33:00Z', quarantined: null, daily: { '2026-11-08': 12 }, gaps: 2 },
  });
});

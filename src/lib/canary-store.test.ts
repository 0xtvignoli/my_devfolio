import { afterEach, expect, test } from 'bun:test';

process.env.KV_REST_API_URL = 'https://store.test';
process.env.KV_REST_API_TOKEN = 't';
const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

test('syncCanary adds the facts as sets and reads back only well-formed values', async () => {
  let sent: unknown;
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    sent = JSON.parse(String(init.body));
    return Response.json([{ result: 2 }, { result: 1 }, { result: 'OK' }, { result: 412 }, { result: ['ai', 'evil'] }, { result: '2026-11-07T05:20:02Z' }, { result: '<b>' }]);
  }) as typeof fetch;
  const { syncCanary } = await import('./canary-store');
  const out = await syncCanary('github', { uses: ['1|Converse', '2|Converse'], calls: ['ai'], first: '2026-11-07T05:20:02Z', quarantined: null });
  expect((sent as unknown[][])[0]).toEqual(['SADD', 'canary:github:uses', '1|Converse', '2|Converse']);
  expect(out).toEqual({ uses: 412, calls: ['ai'], first: '2026-11-07T05:20:02Z', quarantined: null });
});

test('a failing store is null, so the page falls back to the export alone', async () => {
  globalThis.fetch = (async () => new Response('nope', { status: 500 })) as unknown as typeof fetch;
  const { syncCanary, takeSyncTurn } = await import('./canary-store');
  expect(await syncCanary('docker', { uses: [], calls: [], first: null, quarantined: null })).toBeNull();
  expect(await takeSyncTurn()).toBe(false);
});

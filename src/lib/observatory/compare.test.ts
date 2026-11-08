import { describe, expect, test } from 'bun:test';
import { compare } from './compare';
import type { Decoys } from '@/lib/decoys';
import type { Observatory } from './types';

const site = {
  daily: [
    { date: '2026-11-05', requests: 100, hostile: 10 },
    { date: '2026-11-06', requests: 100, hostile: 20 },
    { date: '2026-11-07', requests: 100, hostile: 30 },
  ],
  categoryDaily: [{ category: 'secrets', counts: [5, 6, 7] }],
} as unknown as Observatory;

const decoy = (categoryDaily?: Decoys['http']['categoryDaily']) =>
  ({
    // 11-05 not running yet, 11-08 is today (not in the site window).
    daily: [
      { date: '2026-11-05', ssh: 0, http: 0 },
      { date: '2026-11-06', ssh: 40, http: 9 },
      { date: '2026-11-07', ssh: 60, http: 11 },
      { date: '2026-11-08', ssh: 99, http: 99 },
    ],
    http: { categoryDaily },
  }) as unknown as Decoys;

describe('compare', () => {
  test('sums only the days both sides cover', () => {
    const out = compare(site, decoy([{ category: 'secrets', counts: [0, 2, 3, 50] }, { category: 'cms', counts: [0, 4, 4, 50] }]))!;
    expect([out.from, out.to, out.days]).toEqual(['2026-11-06', '2026-11-07', 2]);
    expect(out.rows.find((r) => r.category === 'secrets')).toEqual({ category: 'secrets', site: 13, decoy: 5 });
    expect(out.rows.find((r) => r.category === 'cms')).toEqual({ category: 'cms', site: 0, decoy: 8 });
    expect(out.ssh).toBe(100);
  });

  test('null until the decoy publishes categories by day', () => {
    expect(compare(site, decoy())).toBeNull();
    expect(compare(site, null)).toBeNull();
  });
});

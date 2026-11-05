import { expect, test } from 'bun:test';
import { biggestMover, computeTrends } from './trends';
import type { Observatory } from './types';

const dates = Array.from({ length: 14 }, (_, i) => `2026-10-${String(23 + i).padStart(2, '0')}`);
const data = (categoryDaily: Observatory['categoryDaily']): Observatory => ({
  generatedAt: '2026-11-05T05:00:00Z',
  from: dates[0],
  to: dates[13],
  totals: { requests: 0, hostile: 0, stopped: 0, maze: 0 },
  daily: dates.map((date) => ({ date, requests: 0, hostile: 0 })),
  categoryDaily,
  categories: [],
  targets: [],
  countries: [],
  clients: [],
  defenses: [],
});

test('compares the last 7 complete days with the 6 before, on daily averages, dropping today', () => {
  // 6 days at 10/day, 7 days at 20/day, today (partial) at 999.
  const counts = [...Array(6).fill(10), ...Array(7).fill(20), 999];
  const [t] = computeTrends(data([{ category: 'secrets', counts }]));
  expect(t.series).toHaveLength(13);
  expect(t.total).toBe(200);
  expect(t.change).toBeCloseTo(1); // doubled
});

test('finds the peak day of the last week and its share', () => {
  const counts = [...Array(6).fill(1), 1, 1, 1, 1, 30, 1, 1, 0];
  const [t] = computeTrends(data([{ category: 'traversal', counts }]));
  expect(t.peak.date).toBe(dates[10]);
  expect(t.peak.share).toBeCloseTo(30 / 36);
});

test('no change below the volume floor or without a base', () => {
  const tiny = [...Array(13).fill(1), 0];
  const fresh = [...Array(6).fill(0), ...Array(7).fill(50), 0];
  const [a, b] = computeTrends(data([{ category: 'admin', counts: tiny }, { category: 'cms', counts: fresh }]));
  expect(a.change).toBeNull();
  expect(b.change).toBeNull();
});

test('biggestMover ignores "other" and ranks drops and rises alike', () => {
  const t = computeTrends(
    data([
      { category: 'other', counts: [...Array(6).fill(10), ...Array(7).fill(100), 0] },
      { category: 'secrets', counts: [...Array(6).fill(40), ...Array(7).fill(10), 0] },
      { category: 'cms', counts: [...Array(6).fill(10), ...Array(7).fill(15), 0] },
    ]),
  );
  expect(biggestMover(t)?.category).toBe('secrets');
  expect(computeTrends(data(undefined))).toEqual([]);
});

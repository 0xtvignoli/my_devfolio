import { expect, test } from 'bun:test';
import { periodStart, periods } from './canary-periods';

const daily = { '2026-11-07': 55, '2026-11-08': 12, '2026-11-10': 31, '2026-11-11': 70, '2027-01-04': 5 };

test('weeks start on Monday', () => {
  expect(periodStart('2026-11-08', 'week')).toBe('2026-11-02'); // a Sunday
  expect(periodStart('2026-11-09', 'week')).toBe('2026-11-09');
});

test('every period from planting to today, empty ones included, totals kept', () => {
  const weeks = periods(daily, 'week', '2026-11-07', '2026-11-25');
  expect(weeks).toEqual([
    { start: '2026-11-02', n: 67 },
    { start: '2026-11-09', n: 101 },
    { start: '2026-11-16', n: 0 },
    { start: '2026-11-23', n: 0 },
  ]);
  expect(periods(daily, 'month', '2026-11-07', '2027-01-10')).toEqual([
    { start: '2026-11-01', n: 168 },
    { start: '2026-12-01', n: 0 },
    { start: '2027-01-01', n: 5 },
  ]);
  expect(periods(daily, 'year', '2026-11-07', '2027-01-10').map((p) => p.n)).toEqual([168, 5]);
});

test('weeks keep only the latest half year', () => {
  expect(periods({}, 'week', '2026-01-01', '2026-12-31')).toHaveLength(26);
});

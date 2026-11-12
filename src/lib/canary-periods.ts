export type PeriodUnit = 'week' | 'month' | 'year';
export type Period = { start: string; n: number };

/** How many periods each view keeps: half a year of weeks, two years of months, every year. */
const KEEP: Record<PeriodUnit, number> = { week: 26, month: 24, year: Infinity };

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** First day of the period holding `day` (UTC; weeks start on Monday). */
export function periodStart(day: string, unit: PeriodUnit): string {
  if (unit === 'year') return `${day.slice(0, 4)}-01-01`;
  if (unit === 'month') return `${day.slice(0, 7)}-01`;
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return iso(d);
}

function next(start: string, unit: PeriodUnit): string {
  const d = new Date(`${start}T00:00:00Z`);
  if (unit === 'week') d.setUTCDate(d.getUTCDate() + 7);
  else if (unit === 'month') d.setUTCMonth(d.getUTCMonth() + 1);
  else d.setUTCFullYear(d.getUTCFullYear() + 1);
  return iso(d);
}

/**
 * Daily counts summed into weeks, months or years, from the period of `from` to the one of `to`.
 * Empty periods stay: a quiet week is part of the record. Only the latest KEEP[unit] are returned.
 */
export function periods(daily: Record<string, number>, unit: PeriodUnit, from: string, to: string): Period[] {
  const sums = new Map<string, number>();
  for (const [day, n] of Object.entries(daily)) {
    const s = periodStart(day, unit);
    sums.set(s, (sums.get(s) ?? 0) + n);
  }
  const out: Period[] = [];
  const last = periodStart(to, unit);
  for (let s = periodStart(from, unit); s <= last; s = next(s, unit)) out.push({ start: s, n: sums.get(s) ?? 0 });
  return out.slice(-KEEP[unit]);
}

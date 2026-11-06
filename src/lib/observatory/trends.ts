import type { Category } from './classify';
import type { Observatory } from './types';

export interface Trend {
  category: Category;
  /** Complete days only, oldest first. */
  series: number[];
  total: number;
  /** Change of the daily average, last 7 complete days vs the days before; null when there's no base. */
  change: number | null;
  /** Busiest day of the last 7, with its share of that week. */
  peak: { date: string; share: number };
}

/** Below this many requests in the window a percentage is noise, not a trend. */
const MIN_VOLUME = 20;

/**
 * Week-over-week per category. The window holds 13 complete days (Cloudflare
 * Free keeps 14; older files also carry the build day so far), so "last week" is the 7 most recent
 * complete days and "the week before" the 6 preceding them — compared on daily
 * averages so the shorter base doesn't read as a drop.
 */
export function computeTrends(data: Observatory): Trend[] {
  if (!data.categoryDaily) return [];
  // A day equal to the build day is partial, so left out. Windows that end at
  // midnight (the build since Nov 2026) have none.
  const buildDay = data.generatedAt.slice(0, 10);
  const cut = data.daily.at(-1)?.date === buildDay ? data.daily.length - 1 : data.daily.length;
  const dates = data.daily.slice(0, cut).map((d) => d.date);

  return data.categoryDaily.map(({ category, counts }) => {
    const series = counts.slice(0, cut);
    const recent = series.slice(-7);
    const before = series.slice(0, -7);
    const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
    const base = avg(before);
    const total = series.reduce((a, b) => a + b, 0);
    const change = base > 0 && total >= MIN_VOLUME ? avg(recent) / base - 1 : null;
    const weekTotal = recent.reduce((a, b) => a + b, 0);
    const peakIndex = recent.indexOf(Math.max(...recent));
    return {
      category,
      series,
      total,
      change,
      peak: { date: dates[dates.length - 7 + peakIndex] ?? '', share: weekTotal ? recent[peakIndex] / weekTotal : 0 },
    };
  });
}

/** The biggest mover in either direction, ignoring the catch-all "other". */
export function biggestMover(trends: Trend[]): Trend | undefined {
  return trends
    .filter((t) => t.category !== 'other' && t.change !== null)
    .sort((a, b) => Math.abs(Math.log1p(b.change!)) - Math.abs(Math.log1p(a.change!)))[0];
}

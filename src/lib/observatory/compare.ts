import type { Decoys } from '@/lib/decoys';
import type { Category } from '@/lib/observatory/classify';
import type { Observatory } from '@/lib/observatory/types';

/** "other" stays out: on the site it is mostly broken links, on the decoy mostly GET /. */
export const COMPARE_CATEGORIES = ['secrets', 'cms', 'admin', 'traversal', 'app-exploit'] as const satisfies readonly Category[];

export type Comparison = {
  from: string;
  to: string;
  days: number;
  rows: { category: (typeof COMPARE_CATEGORIES)[number]; site: number; decoy: number }[];
  /** SSH sessions on the decoy; the site has no SSH port at all. */
  ssh: number;
};

type Series = { category: string; counts: number[] }[] | undefined;

/**
 * Lab L2c: the site (behind Cloudflare) and the decoy VPS (nothing in front) on
 * the same UTC days, in the same categories. Days are the ones both files cover
 * and the decoy was already running; null until the decoy publishes categoryDaily.
 */
export function compare(site: Observatory, decoy: Decoys | null): Comparison | null {
  const decoyDaily = decoy?.http.categoryDaily;
  if (!decoy || !decoyDaily) return null;
  const running = new Set(decoy.daily.filter((d) => d.ssh + d.http > 0).map((d) => d.date));
  const days = site.daily.map((d) => d.date).filter((date) => running.has(date));
  if (!days.length) return null;
  const shared = new Set(days);
  const sum = (series: Series, category: string, axis: string[]) => {
    const counts = series?.find((x) => x.category === category)?.counts ?? [];
    return axis.reduce((total, date, i) => (shared.has(date) ? total + (counts[i] ?? 0) : total), 0);
  };
  const siteAxis = site.daily.map((d) => d.date);
  const decoyAxis = decoy.daily.map((d) => d.date);
  return {
    from: days[0],
    to: days.at(-1)!,
    days: days.length,
    rows: COMPARE_CATEGORIES.map((category) => ({
      category,
      site: sum(site.categoryDaily, category, siteAxis),
      decoy: sum(decoyDaily, category, decoyAxis),
    })),
    ssh: decoy.daily.reduce((total, d) => (shared.has(d.date) ? total + d.ssh : total), 0),
  };
}

import { formatDate } from '@/lib/format-date';
import type { Locale, Translations } from '@/lib/types';

interface DailyChartProps {
  daily: { date: string; requests: number; hostile: number }[];
  locale: Locale;
  labels: Translations['lab'];
}

const H = 220;
const BAR_GAP = 2;

/**
 * One series (hostile requests per day) as server-rendered SVG: no chart
 * library, no client JS. Each bar carries a native tooltip and the full figures
 * are in a table for screen readers; the axis shows only first, middle, last.
 */
export function DailyChart({ daily, locale, labels }: DailyChartProps) {
  const requestsLabel = labels.requestsLabel;
  const hostileLabel = labels.stats.hostile;
  const nf = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB');
  const max = Math.max(...daily.map((d) => d.hostile), 1);
  const peak = daily.reduce((a, b) => (b.hostile > a.hostile ? b : a), daily[0]);
  const w = 100 / daily.length;
  const ticks = [0, Math.floor(daily.length / 2), daily.length - 1];

  return (
    <figure>
      <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="block h-[220px] w-full" aria-hidden>
        <line x1="0" x2="100" y1={H - 0.5} y2={H - 0.5} className="stroke-border" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {daily.map((d, i) => {
          const h = Math.max((d.hostile / max) * (H - 24), d.hostile ? 2 : 0);
          return (
            <g key={d.date} className="group">
              {/* Full-height hit target, wider than the bar. */}
              <rect x={i * w} y="0" width={w} height={H} fill="transparent">
                <title>{`${formatDate(d.date, locale)}: ${nf.format(d.hostile)} ${hostileLabel} / ${nf.format(d.requests)} ${requestsLabel}`}</title>
              </rect>
              <rect
                x={i * w + BAR_GAP / 10}
                y={H - h}
                width={w - BAR_GAP / 5}
                height={h}
                className="pointer-events-none fill-link transition-opacity group-hover:opacity-70"
              />
            </g>
          );
        })}
      </svg>
      <div aria-hidden className="relative mt-2 h-5 font-mono text-[12px] text-muted-foreground">
        {ticks.map((i) => (
          <span
            key={i}
            className="absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0 last:-translate-x-full"
            style={{ left: `${i === daily.length - 1 ? 100 : i * w + w / 2}%` }}
          >
            {formatDate(daily[i].date, locale).slice(0, 6)}
          </span>
        ))}
      </div>
      <figcaption className="mt-4 text-sm text-muted-foreground">
        {labels.peak}: {formatDate(peak.date, locale)}, {nf.format(peak.hostile)} {hostileLabel}.
      </figcaption>
      <table className="sr-only">
        <thead>
          <tr><th>{labels.dateLabel}</th><th>{hostileLabel}</th><th>{requestsLabel}</th></tr>
        </thead>
        <tbody>
          {daily.map((d) => (
            <tr key={d.date}><td>{d.date}</td><td>{d.hostile}</td><td>{d.requests}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

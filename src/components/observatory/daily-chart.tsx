'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/types';

interface DailyChartProps {
  daily: { date: string; requests: number; hostile: number }[];
  locale: Locale;
  labels: { requests: string; hostile: string; peak: string; date: string };
  /** One category's counts, same days: drawn over the total, which turns grey. */
  part?: { label: string; counts: number[] };
}

const H = 220;
const BAR_GAP = 2;

/**
 * One series (hostile requests per day) as SVG, no chart library. A readout
 * above the bars starts on the peak day; tapping or hovering a bar shows that
 * day instead, since a phone has no hover. The full figures are in a table for
 * screen readers; the axis shows only first, middle, last.
 */
export function DailyChart({ daily, locale, labels, part }: DailyChartProps) {
  const nf = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB');
  const max = Math.max(...daily.map((d) => d.hostile), 1);
  const peakIndex = daily.reduce((best, d, i) => (d.hostile > daily[best].hostile ? i : best), 0);
  const [selected, setSelected] = useState(peakIndex);
  const day = daily[selected];
  const w = 100 / daily.length;
  const ticks = [0, Math.floor(daily.length / 2), daily.length - 1];

  return (
    <figure>
      <p aria-hidden className="mb-3 flex flex-wrap justify-between gap-x-4 bg-muted px-3.5 py-2.5 text-sm">
        <span>
          {selected === peakIndex && <span className="text-muted-foreground">{labels.peak}: </span>}
          <span className="font-medium">{formatDate(day.date, locale)}</span> ·{' '}
          {part ? `${nf.format(part.counts[selected] ?? 0)} ${part.label}` : `${nf.format(day.hostile)} ${labels.hostile}`}
        </span>
        <span className="text-muted-foreground">
          {part ? `${nf.format(day.hostile)} ${labels.hostile}` : `${nf.format(day.requests)} ${labels.requests}`}
        </span>
      </p>
      <svg
        viewBox={`0 0 100 ${H}`}
        preserveAspectRatio="none"
        className="block h-[180px] w-full touch-pan-y sm:h-[220px]"
        aria-hidden
        onPointerLeave={(e) => e.pointerType === 'mouse' && setSelected(peakIndex)}
      >
        <line x1="0" x2="100" y1={H - 0.5} y2={H - 0.5} className="stroke-border" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {daily.map((d, i) => {
          const h = Math.max((d.hostile / max) * (H - 24), d.hostile ? 2 : 0);
          const p = part?.counts[i] ?? 0;
          const ph = Math.max((p / max) * (H - 24), p ? 2 : 0);
          return (
            <g key={d.date}>
              {/* Full-height hit target, wider than the bar. */}
              <rect
                x={i * w}
                y="0"
                width={w}
                height={H}
                fill="transparent"
                onPointerEnter={() => setSelected(i)}
                onPointerDown={() => setSelected(i)}
              />
              <rect
                x={i * w + BAR_GAP / 10}
                y={H - h}
                width={w - BAR_GAP / 5}
                height={h}
                className={cn('pointer-events-none', part ? 'fill-muted' : i === selected ? 'fill-foreground' : 'fill-link')}
              />
              {part && (
                <rect
                  x={i * w + BAR_GAP / 10}
                  y={H - ph}
                  width={w - BAR_GAP / 5}
                  height={ph}
                  className={cn('pointer-events-none', i === selected ? 'fill-foreground' : 'fill-link')}
                />
              )}
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
      <table className="sr-only">
        <caption>
          {labels.peak}: {formatDate(daily[peakIndex].date, locale)}, {nf.format(daily[peakIndex].hostile)} {labels.hostile}.
        </caption>
        <thead>
          <tr><th>{labels.date}</th><th>{labels.hostile}</th><th>{labels.requests}</th></tr>
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

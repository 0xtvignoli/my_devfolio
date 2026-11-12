'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export type HistoryView = {
  unit: 'week' | 'month' | 'year';
  /** "questa settimana" */
  label: string;
  /** The current period's count, formatted. */
  current: string;
  /** Oldest first; labels and counts already formatted on the server. */
  bars: { label: string; n: number; text: string }[];
};

/** Above this many columns the counts move into the tooltip and only three dates stay on the axis. */
const ROOMY = 8;

export function CanaryHistory({ views, chartLabels }: { views: HistoryView[]; chartLabels: Record<HistoryView['unit'], string> }) {
  const [unit, setUnit] = useState(views[0].unit);
  const view = views.find((v) => v.unit === unit) ?? views[0];
  const max = Math.max(1, ...view.bars.map((b) => b.n));
  const roomy = view.bars.length <= ROOMY;

  return (
    <div className="mt-7">
      <div className="grid grid-cols-3 border-y border-y-border border-t-foreground">
        {views.map((v) => (
          <button
            key={v.unit}
            type="button"
            aria-pressed={v.unit === unit}
            onClick={() => setUnit(v.unit)}
            className={cn(
              'flex min-h-11 flex-col items-start py-4 pr-3 text-left',
              v.unit === unit ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="font-serif text-[26px] leading-tight sm:text-[32px]">{v.current}</span>
            <span className={cn('mt-1 text-sm', v.unit === unit && 'underline underline-offset-[6px]')}>{v.label}</span>
          </button>
        ))}
      </div>

      <ol aria-label={chartLabels[view.unit]} className="mt-8 flex h-44 items-end gap-[3px] border-b border-foreground sm:gap-1.5">
        {view.bars.map((b) => (
          <li key={b.label} title={`${b.label}: ${b.text}`} className="flex h-full min-w-0 max-w-16 flex-1 flex-col justify-end">
            <span className="sr-only">
              {b.label}: {b.text}
            </span>
            {roomy && (
              <span aria-hidden className="pb-1 text-center font-mono text-[12px] text-muted-foreground">
                {b.text}
              </span>
            )}
            <span aria-hidden className="block bg-link" style={{ height: `${(b.n / max) * 82}%`, minHeight: b.n ? 2 : 0 }} />
          </li>
        ))}
      </ol>
      {roomy ? (
        <div aria-hidden className="mt-1.5 flex gap-[3px] font-mono text-[12px] text-muted-foreground sm:gap-1.5">
          {view.bars.map((b) => (
            <span key={b.label} className="min-w-0 max-w-16 flex-1 truncate text-center">
              {b.label}
            </span>
          ))}
        </div>
      ) : (
        <div aria-hidden className="mt-1.5 flex justify-between font-mono text-[12px] text-muted-foreground">
          <span>{view.bars[0].label}</span>
          <span>{view.bars[Math.floor((view.bars.length - 1) / 2)].label}</span>
          <span>{view.bars.at(-1)!.label}</span>
        </div>
      )}
    </div>
  );
}

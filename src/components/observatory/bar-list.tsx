import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/types';

interface BarListProps {
  items: { label: string; count: number; mono?: boolean }[];
  locale: Locale;
}

/**
 * Ranked magnitudes as a list: label and value in text, a thin bar for the
 * shape. One series, one colour, so no legend; the numbers are the table.
 */
export function BarList({ items, locale }: BarListProps) {
  const nf = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB');
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ol className="space-y-3.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-4 text-[15px]">
            <span className={cn('min-w-0 truncate', item.mono && 'font-mono text-[13px]')}>{item.label}</span>
            <span className="font-mono text-[13px] tabular-nums text-muted-foreground">{nf.format(item.count)}</span>
          </div>
          <div aria-hidden className="mt-1.5 h-1.5 bg-muted">
            <div className="h-full bg-link" style={{ width: `${Math.max((item.count / max) * 100, 1)}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

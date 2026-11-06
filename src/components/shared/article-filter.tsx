'use client';

import { Fragment, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type FilterableArticle = {
  slug: string;
  tags: string[];
  /** Server-rendered row, handed over as a prop so filtering costs no extra bundle. */
  row: ReactNode;
};

type ArticleFilterProps = {
  items: FilterableArticle[];
  label: string;
  allLabel: string;
  /** Contains `{count}`. A string, not a formatter — functions can't cross the RSC boundary. */
  countTemplate: string;
};

export function ArticleFilter({ items, label, allLabel, countTemplate }: ArticleFilterProps) {
  const [active, setActive] = useState<string | null>(null);
  // Most used first, so the useful tags are the ones visible before the row scrolls.
  const counts = new Map<string, number>();
  for (const tag of items.flatMap((item) => item.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  const tags = [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)! || a.localeCompare(b));
  const shown = active ? items.filter((item) => item.tags.includes(active)) : items;

  // Phones: chips in one row that scrolls sideways. From sm: today's text links.
  const option = (value: string | null, text: string, count: number) => (
    <button
      key={text}
      type="button"
      aria-pressed={active === value}
      onClick={() => setActive(value)}
      className={cn(
        'min-h-11 shrink-0 snap-start rounded-full border px-4 text-[14px] sm:rounded-none sm:border-0 sm:px-0 sm:text-[15px]',
        active === value
          ? 'border-foreground bg-foreground text-background sm:bg-transparent sm:text-foreground sm:underline sm:underline-offset-[6px]'
          : 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      {text}{' '}
      <span className="ml-0.5 font-mono text-[11px] opacity-70">{count}</span>
    </button>
  );

  return (
    <>
      <div
        role="group"
        aria-label={label}
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-x-5 sm:gap-y-0 sm:overflow-visible sm:px-0"
      >
        {option(null, allLabel, items.length)}
        {tags.map((tag) => option(tag, tag, counts.get(tag)!))}
      </div>
      <p aria-live="polite" className="mt-6 border-b border-foreground pb-3 font-mono text-[13px] text-muted-foreground">
        {countTemplate.replace('{count}', String(shown.length))}
      </p>
      {/* Each row is already an <li>. */}
      <ol>{shown.map((item) => <Fragment key={item.slug}>{item.row}</Fragment>)}</ol>
    </>
  );
}

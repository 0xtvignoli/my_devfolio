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
  const tags = [...new Set(items.flatMap((item) => item.tags))].sort((a, b) => a.localeCompare(b));
  const shown = active ? items.filter((item) => item.tags.includes(active)) : items;

  const option = (value: string | null, text: string) => (
    <button
      key={text}
      type="button"
      aria-pressed={active === value}
      onClick={() => setActive(value)}
      className={cn(
        'min-h-11 px-0 text-[15px]',
        active === value ? 'text-foreground underline underline-offset-[6px]' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {text}
    </button>
  );

  return (
    <>
      <div role="group" aria-label={label} className="flex flex-wrap gap-x-5">
        {option(null, allLabel)}
        {tags.map((tag) => option(tag, tag))}
      </div>
      <p aria-live="polite" className="mt-6 border-b border-foreground pb-3 font-mono text-[13px] text-muted-foreground">
        {countTemplate.replace('{count}', String(shown.length))}
      </p>
      {/* Each row is already an <li>. */}
      <ol>{shown.map((item) => <Fragment key={item.slug}>{item.row}</Fragment>)}</ol>
    </>
  );
}

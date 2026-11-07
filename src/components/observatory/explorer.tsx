'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { DailyChart } from '@/components/observatory/daily-chart';
import { BarList } from '@/components/observatory/bar-list';
import { Trends } from '@/components/observatory/trends';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/observatory/classify';
import type { Observatory } from '@/lib/observatory/types';
import type { Trend } from '@/lib/observatory/trends';
import type { Locale, Translations } from '@/lib/types';

const EVENT = 'lab:filter';
const subscribe = (cb: () => void) => {
  window.addEventListener('popstate', cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener('popstate', cb);
    window.removeEventListener(EVENT, cb);
  };
};
// The filter lives in the URL (?cat=secrets), read without useSearchParams so
// /lab stays a static page; the server render is always "all".
const readCat = () => new URLSearchParams(window.location.search).get('cat');

function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="border-t border-foreground pt-5 font-serif text-[30px] font-medium tracking-[-0.01em]">
      {children}
    </h2>
  );
}

/**
 * Daily chart, trends, "what they look for" and "where from", driven by one
 * category filter; a trend row is a filter too. "What stopped them" stays
 * global: Cloudflare gives defences without a path.
 */
export function ObservatoryExplorer({
  data,
  locale,
  t,
  section,
  trends,
}: {
  data: Observatory;
  locale: Locale;
  t: Translations['lab'];
  section: string;
  trends: Trend[];
}) {
  const raw = useSyncExternalStore(subscribe, readCat, () => null);
  const split = data.byCategory?.find((c) => c.category === raw);
  const daily = data.categoryDaily?.find((c) => c.category === raw);
  const cat = split || daily ? (raw as Category) : null;

  const select = (next: Category | null) => {
    const url = new URL(window.location.href);
    if (next) url.searchParams.set('cat', next);
    else url.searchParams.delete('cat');
    window.history.replaceState(null, '', url);
    window.dispatchEvent(new Event(EVENT));
  };

  const countryName = new Intl.DisplayNames([locale], { type: 'region' });
  const country = (code: string) => (code === 'T1' ? 'Tor' : (countryName.of(code) ?? code));
  const label = (c: Category) => t.categories[c];
  const share = cat ? data.categories.find((c) => c.category === cat)?.count ?? 0 : 0;
  const nf = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB');
  const chips = data.categories.map((c) => c.category).filter((c) => c !== 'other');

  const chip = (value: Category | null, text: string) => (
    <button
      key={text}
      type="button"
      aria-pressed={cat === value}
      onClick={() => select(value)}
      className={cn(
        'min-h-11 shrink-0 rounded-full border px-4 text-[14px]',
        cat === value ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      {text}
    </button>
  );

  return (
    <>
      <section aria-labelledby="daily-heading" className={section}>
        <H2 id="daily-heading">{t.dailyTitle}</H2>
        <p className="mb-6 mt-3 max-w-[640px] text-muted-foreground">{t.dailyCaption}</p>
        <div role="group" aria-label={t.filterLabel} className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          {chip(null, t.filterAll)}
          {chips.map((c) => chip(c, label(c)))}
        </div>
        <p aria-live="polite" className="mb-4 font-mono text-[13px] text-muted-foreground">
          {cat ? t.filterSummary.replace('{part}', nf.format(share)).replace('{total}', nf.format(data.totals.hostile)) : ' '}
        </p>
        <DailyChart
          daily={data.daily}
          locale={locale}
          labels={{ requests: t.requestsLabel, hostile: t.stats.hostile, peak: t.peak, date: t.dateLabel }}
          part={cat && daily ? { label: label(cat), counts: daily.counts } : undefined}
        />
      </section>

      {trends.length > 0 && (
        <section aria-labelledby="trends-heading" className={section}>
          <H2 id="trends-heading">{t.trendsTitle}</H2>
          <p className="mb-8 mt-3 max-w-[640px] text-muted-foreground">{t.trendsIntro}</p>
          <Trends
            trends={trends}
            locale={locale}
            t={t}
            selected={cat}
            filterable={chips}
            onSelect={(c) => select(c === cat ? null : c)}
          />
        </section>
      )}

      <section aria-labelledby="looking-heading" className={section}>
        <H2 id="looking-heading">{t.lookingForTitle}</H2>
        <p className="mb-10 mt-3 max-w-[640px] text-muted-foreground">{t.lookingForIntro}</p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] gap-x-16 gap-y-14">
          <BarList
            items={data.categories.map((c) => ({ label: label(c.category), count: c.count }))}
            locale={locale}
            showAll={t.showAll}
            active={cat ? label(cat) : undefined}
          />
          <div>
            <h3 className="mb-4 font-medium">
              {t.targetsTitle}
              {split && <span className="text-muted-foreground"> · {label(split.category)}</span>}
            </h3>
            <BarList
              items={(split?.targets ?? data.targets).map((x) => ({ label: x.target, count: x.count, mono: true }))}
              locale={locale}
              showAll={t.showAll}
            />
          </div>
        </div>
      </section>

      <section id="where" aria-label={`${t.countriesTitle}, ${t.clientsTitle}, ${t.defensesTitle}`} className={section}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-x-14 gap-y-14 border-t border-foreground pt-6">
          <div>
            <h2 className="mb-4 font-serif text-2xl font-medium">{t.countriesTitle}</h2>
            <BarList items={(split?.countries ?? data.countries).map((c) => ({ label: country(c.code), count: c.count }))} locale={locale} showAll={t.showAll} />
          </div>
          <div>
            <h2 className="mb-4 font-serif text-2xl font-medium">{t.clientsTitle}</h2>
            <BarList items={(split?.clients ?? data.clients).map((c) => ({ label: c.label, count: c.count }))} locale={locale} showAll={t.showAll} />
          </div>
          <div>
            <h2 className="mb-4 font-serif text-2xl font-medium">{t.defensesTitle}</h2>
            <BarList items={data.defenses.map((d) => ({ label: d.layer, count: d.count }))} locale={locale} showAll={t.showAll} />
            {cat && <p className="mt-3 text-sm text-muted-foreground">{t.defensesAllNote}</p>}
          </div>
        </div>
      </section>
    </>
  );
}

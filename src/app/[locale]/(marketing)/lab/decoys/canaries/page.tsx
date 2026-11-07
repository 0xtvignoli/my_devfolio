import Link from 'next/link';
import { CANARIES, type Canary } from '@/data/canaries';
import { formatDuration } from '@/lib/duration';
import { formatDate } from '@/lib/format-date';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

type Props = { params: Promise<{ locale: string }> };

// The page is rebuilt every night, so "still waiting after…" is measured from the build.
const BUILT_AT = Date.now();
const WEEK_MIN = 7 * 24 * 60;

/** Log scale, 1 min → 1 week, as a share of the track. */
function position(ms: number): number {
  const min = Math.max(1, ms / 60_000);
  return Math.min(100, Math.max(2, (Math.log(min) / Math.log(WEEK_MIN)) * 100));
}

function wait(c: Canary): number | null {
  if (!c.plantedAt) return null;
  return (c.firstUseAt ? Date.parse(c.firstUseAt) : BUILT_AT) - Date.parse(c.plantedAt);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale);
  return createPageMetadata({ title: t.canaries.title, description: t.canaries.intro, path: '/lab/decoys/canaries', locale });
}

export default async function CanariesPage({ params }: Props) {
  const locale: Locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale);
  const c = t.canaries;
  const nf = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB');
  const planted = CANARIES.filter((x) => x.plantedAt);
  const used = planted.filter((x) => x.firstUseAt);
  const fastest = used.length ? Math.min(...used.map((x) => wait(x)!)) : null;

  const status = (x: Canary) =>
    x.blocked ? c.status.blocked : !x.plantedAt ? c.status.notPlanted : x.firstUseAt ? c.status.used : c.status.waiting;
  const after = (x: Canary) => {
    const ms = wait(x);
    if (x.blocked) return c.blockedAtPush;
    if (ms === null) return '—';
    return x.firstUseAt ? formatDuration(ms, locale) : c.noUseAfter.replace('{d}', formatDuration(ms, locale));
  };

  const stats = [
    { label: c.stats.planted, value: `${planted.length} / ${CANARIES.length}` },
    { label: c.stats.used, value: String(used.length) },
    { label: c.stats.fastest, value: fastest === null ? '—' : formatDuration(fastest, locale) },
  ];

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
      <p className="mb-6 text-sm font-medium uppercase tracking-[0.08em] text-link">{c.kicker}</p>
      <h1 className="max-w-[860px] font-serif text-[clamp(36px,5.5vw,64px)] font-normal leading-[1.05] tracking-[-0.025em]">{c.title}</h1>
      <p className="mt-6 max-w-[680px] text-[19px] text-muted-foreground">{c.intro}</p>

      <dl className="mt-12 grid grid-cols-3 gap-x-5 border-y border-y-border border-t-foreground py-6 sm:gap-x-10">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col">
            <dt className="order-2 mt-2 text-sm text-muted-foreground">{s.label}</dt>
            <dd className="order-1 font-serif text-[30px] leading-none sm:text-[44px]">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="channels-heading" className="mt-14">
        <h2 id="channels-heading" className="sr-only">{c.channelsTitle}</h2>
        <ol>
          {CANARIES.map((x) => (
            <li key={x.id} className="grid gap-x-6 gap-y-1 border-b border-border py-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_110px] sm:items-baseline">
              <span className="font-medium">{c.channels[x.id].name}</span>
              <span className="text-[15px] text-muted-foreground">{c.channels[x.id].seenBy}</span>
              <span className="font-serif text-[22px] leading-tight">{after(x)}</span>
              <span className="font-mono text-[13px] text-muted-foreground">{x.calls.length ? x.calls.map((k) => c.calls[k]).join(' · ') : '—'}
                {x.hits ? <span className="block">{c.callsCount.replace('{n}', nf.format(x.hits))}</span> : null}
                {x.quarantinedAt && x.plantedAt ? (
                  <span className="block">
                    {c.quarantined.replace('{d}', formatDuration(Date.parse(x.quarantinedAt) - Date.parse(x.plantedAt), locale))}
                  </span>
                ) : null}
              </span>
              <span className={cn('justify-self-start font-mono text-[11px] uppercase tracking-[0.06em] sm:justify-self-end', x.firstUseAt ? 'text-foreground' : 'text-muted-foreground')}>
                {status(x)}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {planted.length > 0 && (
        <section aria-labelledby="timeline-heading" className="mt-16">
          <h2 id="timeline-heading" className="border-t border-foreground pt-5 font-serif text-[26px] font-medium">{c.timelineTitle}</h2>
          <p className="mb-5 mt-2 text-sm text-muted-foreground">{c.timelineCaption}</p>
          <ul className="space-y-3">
            {planted.map((x) => {
              const ms = wait(x)!;
              return (
                <li key={x.id} className="grid grid-cols-[minmax(0,140px)_1fr] items-center gap-4 text-sm sm:grid-cols-[220px_1fr]">
                  <span className="truncate">{c.channels[x.id].short}</span>
                  <span className="relative h-2.5 bg-muted" aria-label={after(x)}>
                    <span
                      className={cn('absolute inset-y-0 left-0', x.firstUseAt ? 'bg-link' : 'border border-dashed border-muted-foreground bg-transparent')}
                      style={{ width: `${position(ms)}%` }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
          <div aria-hidden className="relative ml-[156px] mt-2 h-4 font-mono text-[11px] text-muted-foreground sm:ml-[236px]">
            {[
              [60_000, '1 min'],
              [3_600_000, '1 h'],
              [86_400_000, `1 ${c.dayUnit}`],
              [604_800_000, `1 ${c.weekUnit}`],
            ].map(([ms, label]) => (
              <span
                key={label}
                className="absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0 last:-translate-x-full"
                style={{ left: `${position(Number(ms))}%` }}
              >
                {label}
              </span>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="how-heading" className="mt-16 bg-muted p-6 sm:p-10">
        <h2 id="how-heading" className="font-serif text-[26px] font-medium">{c.howTitle}</h2>
        <ul className="mt-5 max-w-[760px] list-disc space-y-3 pl-5 text-muted-foreground">
          {c.how.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-6 font-mono text-[13px] text-muted-foreground">
          {c.updated} {formatDate(new Date(BUILT_AT).toISOString().slice(0, 10), locale)}
        </p>
      </section>

      <p className="mt-12">
        <Link className="text-link underline-offset-4 hover:underline" href={localizedPath(locale, '/lab')}>
          {c.back}
        </Link>
      </p>
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { CANARY_CALLS, CANARY_CHANNELS, callOf, type Canary, type CanaryChannelId } from '@/data/canaries';
import { CANARY_SNIPPETS } from '@/data/canary-snippets';
import { CanaryHistory, type HistoryView } from '@/components/shared/canary-history';
import { BurstReplay } from '@/components/shared/burst-replay';
import { periods, type PeriodUnit } from '@/lib/canary-periods';
import { liveCanaries } from '@/lib/canaries-live';
import { position, wait } from '@/lib/canary-time';
import { formatDuration } from '@/lib/duration';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

// Same 5-minute regeneration as the overview.
export const dynamic = 'force-static';
export const revalidate = 300;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; channel: string }> };

export function generateStaticParams() {
  return CANARY_CHANNELS.map((channel) => ({ channel }));
}

const isChannel = (x: string): x is CanaryChannelId => (CANARY_CHANNELS as readonly string[]).includes(x);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, channel } = await params;
  const locale = resolveLocaleParam(raw);
  if (!isChannel(channel)) return {};
  const c = getTranslations(locale).canaries;
  return createPageMetadata({
    title: `${c.channels[channel].name} · ${c.kicker}`,
    description: c.stories[channel].intro,
    path: `/lab/decoys/canaries/${channel}`,
    locale,
  });
}

function H2({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cn('border-t border-foreground pt-5 font-serif text-[30px] font-medium tracking-[-0.01em]', className)}>
      {children}
    </h2>
  );
}

/** 18 s · 35 min · 3 h 12 min: the span of a burst, finer than formatDuration below a few minutes. */
function span(seconds: number, locale: Locale): string {
  return seconds < 120 ? `${Math.max(1, Math.round(seconds))} s` : formatDuration(seconds * 1000, locale);
}

export default async function CanaryPage({ params }: Props) {
  const { locale: raw, channel } = await params;
  if (!isChannel(channel)) notFound();
  const locale: Locale = resolveLocaleParam(raw);
  const t = getTranslations(locale);
  const c = t.canaries;
  const d = c.detail;
  const story = c.stories[channel];
  const snippet = CANARY_SNIPPETS[channel];
  // eslint-disable-next-line react-hooks/purity -- server render, once per revalidation
  const now = Date.now();
  const canaries = await liveCanaries();
  const x = canaries.find((k) => k.id === channel)!;
  const nf = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB');
  const tag = locale === 'it' ? 'it-IT' : 'en-GB';
  const when = (iso: string | number) =>
    new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' }).format(new Date(iso));
  const clock = (sec: number) =>
    new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Rome' }).format(new Date(sec * 1000));
  const used = Boolean(x.firstUseAt);
  const ms = wait(x, now);
  const status = x.blocked ? c.status.blocked : !x.plantedAt ? c.status.notPlanted : used ? c.status.used : c.status.waiting;

  const headline = ms === null ? c.channels[channel].name : (used ? story.headline : d.waitingHeadline).replace('{d}', formatDuration(ms, locale));
  const fastest = Math.min(...canaries.filter((k) => k.firstUseAt).map((k) => wait(k, now)!));
  const fastestOf = canaries.find((k) => k.firstUseAt && wait(k, now) === fastest);

  const stats = used
    ? [
        { label: d.stats.planted, value: x.plantedAt ? when(x.plantedAt) : '—' },
        { label: d.stats.firstUse, value: formatDuration(ms!, locale) },
        { label: d.stats.calls, value: x.hits ? c.callsCount.replace('{n}', nf.format(x.hits)) : '—' },
        { label: d.stats.lastUse, value: x.lastUseAt ? d.ago.replace('{d}', formatDuration(now - Date.parse(x.lastUseAt), locale)) : '—' },
        { label: d.stats.kinds, value: String(x.calls.length) },
      ]
    : [
        { label: d.stats.planted, value: x.plantedAt ? when(x.plantedAt) : '—' },
        { label: d.stats.waiting, value: ms === null ? '—' : formatDuration(ms, locale) },
        { label: d.stats.fastest, value: fastestOf ? `${formatDuration(fastest, locale)} · ${c.channels[fastestOf.id].short}` : '—' },
      ];

  const steps = [
    x.plantedAt && { at: x.plantedAt, title: d.steps.planted, body: d.steps.plantedBody.replace('{where}', c.channels[channel].name), on: false },
    x.quarantinedAt && x.plantedAt && {
      at: x.quarantinedAt,
      title: d.steps.quarantined,
      body: d.steps.quarantinedBody.replace('{d}', formatDuration(Date.parse(x.quarantinedAt) - Date.parse(x.plantedAt), locale)),
      on: true,
    },
    x.firstUseAt && { at: x.firstUseAt, title: d.steps.firstUse, body: d.steps.firstUseBody.replace('{d}', formatDuration(ms!, locale)), on: true },
    x.lastUseAt && x.lastUseAt !== x.firstUseAt && {
      at: x.lastUseAt,
      title: d.steps.lastUse,
      body: d.steps.lastUseBody.replace('{d}', formatDuration(now - Date.parse(x.lastUseAt), locale)),
      on: true,
    },
  ]
    .filter((s): s is { at: string; title: string; body: string; on: boolean } => Boolean(s))
    .sort((a, b) => a.at.localeCompare(b.at));

  // Every call the store has counted, per week, month and year (UTC days, from planting to today).
  const today = new Date(now).toISOString().slice(0, 10);
  const daily = x.daily ?? {};
  const periodLabel: Record<PeriodUnit, Intl.DateTimeFormatOptions> = { week: { day: 'numeric', month: 'short' }, month: { month: 'short', year: 'numeric' }, year: { year: 'numeric' } };
  const history: HistoryView[] = Object.keys(daily).length
    ? (['week', 'month', 'year'] as const).map((unit) => {
        const ps = periods(daily, unit, (x.plantedAt ?? today).slice(0, 10), today);
        const fmt = new Intl.DateTimeFormat(tag, { ...periodLabel[unit], timeZone: 'UTC' });
        return {
          unit,
          label: d.periods[unit],
          current: nf.format(ps.at(-1)?.n ?? 0),
          bars: ps.map((p) => ({ label: fmt.format(new Date(`${p.start}T00:00:00Z`)), n: p.n, text: nf.format(p.n) })),
        };
      })
    : [];

  // canarytokens' last 50 hits: the table shows them all, the dot chart only the latest run
  // (calls under a minute apart), so its axis is real time and never restarts from zero.
  const recent = x.timeline ?? [];
  let from = recent.length - 1;
  while (from > 0 && recent[from].at - recent[from - 1].at < 60) from--;
  const timeline = recent.slice(Math.max(0, from));
  const t0 = timeline[0]?.at ?? 0;
  const dur = Math.max(1, (timeline.at(-1)?.at ?? 0) - t0);
  const hms = (sec: number) => new Intl.DateTimeFormat(tag, { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Rome' }).format(new Date(sec * 1000));
  // Calls of one kind in the same second share a dot, with the count beside it.
  const lanes = CANARY_CALLS.map((k) => {
    const bySecond = new Map<number, { at: number; names: string[] }>();
    for (const e of timeline.filter((e) => callOf(e.name) === k)) {
      const s = Math.floor(e.at);
      bySecond.set(s, { at: bySecond.get(s)?.at ?? e.at, names: [...(bySecond.get(s)?.names ?? []), e.name] });
    }
    return { k, n: timeline.filter((e) => callOf(e.name) === k).length, dots: [...bySecond.values()] };
  }).filter((l) => l.n);
  const rows = [...recent.reduce((m, e) => m.set(e.name, (m.get(e.name) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1]);

  const others = canaries.filter((k) => k.id !== channel);

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm font-medium uppercase tracking-[0.08em]">
        <Link className="text-link hover:underline" href={localizedPath(locale, '/lab')}>Lab</Link>
        <span aria-hidden className="text-muted-foreground">·</span>
        <Link className="text-link hover:underline" href={localizedPath(locale, '/lab/decoys/canaries')}>{d.breadcrumb}</Link>
        <span aria-hidden className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{c.channels[channel].short}</span>
      </nav>

      <p className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[12px] uppercase tracking-[0.06em]">
        <span className={cn('rounded-full border px-2.5 py-0.5', used ? 'border-foreground' : 'border-dashed border-muted-foreground text-muted-foreground')}>{status}</span>
        <span className="text-muted-foreground">{d.live}</span>
      </p>
      <h1 className="mt-5 max-w-[900px] font-serif text-[clamp(36px,5.5vw,64px)] font-normal leading-[1.05] tracking-[-0.025em]">{headline}</h1>
      <p className="mt-6 max-w-[680px] text-[19px] text-muted-foreground">{story.intro}</p>

      <dl className="mt-12 grid grid-cols-2 gap-x-6 border-y border-y-border border-t-foreground sm:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col py-5">
            <dt className="order-2 mt-1 text-sm text-muted-foreground">{s.label}</dt>
            <dd className="order-1 font-serif text-[26px] leading-tight sm:text-[32px]">{s.value}</dd>
          </div>
        ))}
      </dl>

      {steps.length > 0 && (
        <section aria-labelledby="timeline-heading" className="mt-16">
          <H2 id="timeline-heading">{d.timelineTitle}</H2>
          <ol className="mt-7">
            {steps.map((s) => (
              <li key={s.title} className="grid grid-cols-[88px_16px_minmax(0,1fr)] gap-x-4 sm:grid-cols-[120px_16px_minmax(0,1fr)]">
                <span className="pt-0.5 font-mono text-[13px] text-muted-foreground">{when(s.at)}</span>
                <span aria-hidden className="flex flex-col items-center">
                  <span className={cn('mt-[7px] size-[11px] rounded-full border-2 border-link', s.on ? 'bg-link' : 'bg-background')} />
                  <span className="min-h-6 w-px flex-1 bg-border" />
                </span>
                <div className="pb-7">
                  <p className="font-medium">{s.title}</p>
                  <p className="mt-1 max-w-[620px] text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {history.length > 0 && (
        <section aria-labelledby="history-heading" className="mt-12">
          <H2 id="history-heading">{d.historyTitle}</H2>
          <p className="mt-3 max-w-[680px] text-muted-foreground">{d.historyIntro}</p>
          <CanaryHistory views={history} chartLabels={d.historyChart} />
          <p className="mt-4 max-w-[680px] text-sm text-muted-foreground">
            {x.gaps ? d.historyGaps.replace('{n}', nf.format(x.gaps)) : d.historyNote}
          </p>
        </section>
      )}

      {timeline.length > 1 && (
        <section aria-labelledby="burst-heading" className="mt-12">
          <H2 id="burst-heading">{d.burstTitle.replace('{n}', nf.format(timeline.length)).replace('{d}', span(dur, locale))}</H2>
          <p className="mt-3 max-w-[680px] text-muted-foreground">{d.burstIntro}</p>
          <BurstReplay seconds={dur} total={timeline.length} t={d.replay}>
          <figure className="mt-8" aria-hidden>
            <div className="flex flex-col gap-1.5">
              {lanes.map((l) => (
                <div key={l.k} className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
                  <span className="text-right text-[13px] sm:text-sm">
                    {c.calls[l.k]} <span className="font-mono text-[12px] text-muted-foreground">×{l.n}</span>
                  </span>
                  <div className="relative h-7 border-b border-border">
                    {l.dots.map((e) => (
                      <span
                        key={e.at}
                        data-at={e.at - t0}
                        data-n={e.names.length}
                        title={`${[...new Set(e.names)].join(', ')} · ${hms(e.at)}`}
                        className="absolute top-[9px] -ml-[5px] flex items-center gap-1"
                        style={{ left: `${((e.at - t0) / dur) * 100}%` }}
                      >
                        <span className="size-2.5 rounded-full bg-link ring-2 ring-background" />
                        {e.names.length > 1 && <span className="font-mono text-[11px] leading-none text-muted-foreground">×{e.names.length}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="relative ml-[108px] mt-2 h-5 font-mono text-[12px] text-muted-foreground sm:ml-[166px]">
              <span className="absolute left-0">{hms(t0)}</span>
              <span className="absolute left-1/2 -translate-x-1/2">{hms(t0 + dur / 2)}</span>
              <span className="absolute right-0">{hms(t0 + dur)}</span>
            </div>
            <figcaption className="mt-3 text-sm text-muted-foreground">{d.burstCaption.replace('{t}', clock(t0))}</figcaption>
          </figure>
          </BurstReplay>
        </section>
      )}

      {rows.length > 0 && (
        <section aria-labelledby="calls-heading" className="mt-16">
          <H2 id="calls-heading">{d.callsTitle}</H2>
          <p className="mt-3 max-w-[680px] text-muted-foreground">{d.callsIntro}</p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-[15px]">
              <thead>
                <tr className="text-left text-[13px] text-muted-foreground">
                  <th scope="col" className="border-b border-foreground pb-2.5 pr-4 font-medium">{d.table.call}</th>
                  <th scope="col" className="border-b border-foreground pb-2.5 pr-4 font-medium">{d.table.what}</th>
                  <th scope="col" className="border-b border-foreground pb-2.5 pr-4 font-medium">{d.table.kind}</th>
                  <th scope="col" className="border-b border-foreground pb-2.5 text-right font-medium">{d.table.count}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([name, n]) => (
                  <tr key={name}>
                    <td className="border-b border-border py-2.5 pr-4 font-mono text-[13px]">{name}</td>
                    <td className="border-b border-border py-2.5 pr-4">{c.api[name] ?? '—'}</td>
                    <td className="border-b border-border py-2.5 pr-4 text-muted-foreground">{c.calls[callOf(name)]}</td>
                    <td className="border-b border-border py-2.5 text-right font-mono text-[13px]">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!used && x.plantedAt && (
        <section aria-labelledby="race-heading" className="mt-16">
          <H2 id="race-heading">{d.raceTitle}</H2>
          <p className="mt-3 max-w-[680px] text-muted-foreground">{d.raceIntro}</p>
          <ul className="mt-7 flex flex-col gap-2.5">
            {canaries.filter((k) => k.plantedAt).map((k) => {
              const w = wait(k, now)!;
              return (
                <li key={k.id} className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[150px_minmax(0,1fr)_130px] sm:gap-4">
                  <span className={cn('text-right text-sm', k.id === channel && 'font-semibold')}>{c.channels[k.id].short}</span>
                  <span className="relative h-3">
                    <span
                      className={cn('absolute inset-y-0 left-0', k.firstUseAt ? 'bg-link' : 'border border-dashed border-muted-foreground')}
                      style={{ width: `${position(w)}%` }}
                    />
                  </span>
                  <span className="col-start-2 font-mono text-[13px] text-muted-foreground sm:col-start-auto">
                    {k.firstUseAt ? formatDuration(w, locale) : `${formatDuration(w, locale)}…`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="where-heading" className="mt-16 flex flex-wrap gap-10">
        <div className="min-w-0 flex-[1_1_420px]">
          <H2 id="where-heading">{d.whereTitle}</H2>
          <p className="mb-5 mt-3 text-muted-foreground">{story.whereNote}</p>
          <figure>
            <figcaption className="bg-muted px-5 pt-3 font-mono text-[12px] text-muted-foreground">{snippet.file}</figcaption>
            <pre className="overflow-x-auto bg-muted px-5 pb-5 pt-2 font-mono text-[13px] leading-[1.8]">
              {snippet.lines.map((line, i) => (
                <span key={i} className="block">
                  <span aria-hidden className="mr-4 inline-block w-4 text-right text-muted-foreground">{i + 1}</span>
                  <span className={cn(snippet.mark.includes(i) && 'bg-link/15')}>{line}</span>
                </span>
              ))}
            </pre>
          </figure>
        </div>
        <div className="min-w-0 flex-[1_1_420px]">
          <H2>{used ? d.fixesTitle : d.waitTitle}</H2>
          <ol className="mt-3">
            {(used ? story.fixes : [...story.wait, d.waitLast]).map((f, i) => (
              <li key={f.title} className={cn('border-b border-border py-3.5', !used && 'grid grid-cols-[32px_minmax(0,1fr)] gap-3')}>
                {!used && <span className="pt-0.5 font-mono text-[13px] text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>}
                <div>
                  <p className="font-medium">{f.title}</p>
                  <p className="mt-1 text-[15px] text-muted-foreground">{f.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="lesson-heading" className="mt-16 bg-muted p-6 sm:p-8">
        <h2 id="lesson-heading" className="font-serif text-[26px] font-medium">{used ? d.lessonTitle : d.waitBoxTitle}</h2>
        <p className="mt-3 max-w-[720px] font-serif text-[19px] leading-normal">{used ? story.lesson : `${story.lesson} ${d.waitBox}`}</p>
      </section>

      {!used && (
        <section aria-label={d.fixesTitle} className="mt-12">
          <H2>{d.fixesTitle}</H2>
          <ul className="mt-3 grid gap-x-10 sm:grid-cols-2">
            {story.fixes.map((f) => (
              <li key={f.title} className="border-b border-border py-3.5">
                <p className="font-medium">{f.title}</p>
                <p className="mt-1 text-[15px] text-muted-foreground">{f.body}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-labelledby="others-heading" className="mt-16">
        <H2 id="others-heading" className="text-2xl">{d.othersTitle}</H2>
        <ul className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-6">
          {others.map((k: Canary) => {
            const w = wait(k, now);
            return (
              <li key={k.id}>
                <Link href={localizedPath(locale, `/lab/decoys/canaries/${k.id}`)} className="group flex min-h-11 flex-col gap-1 border-b border-border py-4">
                  <span className="font-medium group-hover:underline">
                    {c.channels[k.id].short} <span aria-hidden className="text-link">→</span>
                  </span>
                  <span className="font-serif text-[22px]">
                    {w === null ? '—' : k.firstUseAt ? formatDuration(w, locale) : c.noUseAfter.replace('{d}', formatDuration(w, locale))}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                    {k.firstUseAt ? c.status.used : c.status.waiting}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="mt-12 text-sm text-muted-foreground">
        {d.updated.replace('{t}', when(now))} {d.privacy}
      </p>
    </div>
  );
}

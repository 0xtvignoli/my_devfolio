import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { DECOY_OPENED, PORT_DECOYS, firstContact } from '@/data/decoy-ports';
import { PORT_SNIPPETS } from '@/data/port-snippets';
import { position } from '@/lib/canary-time';
import { PORTS, PORT_CALLS, type Decoys, type Port } from '@/lib/decoys';
import { liveDecoys } from '@/lib/decoys-data';
import { formatDuration } from '@/lib/duration';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

// Same hourly regeneration as the ports overview: the VM aggregates at :05 UTC.
export const dynamic = 'force-static';
export const revalidate = 3600;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; port: string }> };

export function generateStaticParams() {
  return PORTS.map((port) => ({ port }));
}

const isPort = (x: string): x is Port => (PORTS as readonly string[]).includes(x);
const nameOf = (p: Port) => PORT_DECOYS.find((d) => d.id === p)!.name;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, port } = await params;
  const locale = resolveLocaleParam(raw);
  if (!isPort(port)) return {};
  const c = getTranslations(locale).portsDecoy;
  return createPageMetadata({
    title: `${nameOf(port)} · ${c.kicker}`,
    description: c.stories[port].intro,
    path: `/lab/decoys/ports/${port}`,
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

/** Time to first contact, or waited so far; null while the port is closed. */
function waited(opening: (typeof DECOY_OPENED)[keyof typeof DECOY_OPENED], firstTimes: string[] | undefined, now: number) {
  if (!opening) return null;
  const first = firstContact(opening, firstTimes);
  return {
    ms: (first ? Date.parse(first) : now) - Date.parse(opening.at),
    seen: Boolean(first),
    first,
  };
}

export default async function PortPage({ params }: Props) {
  const { locale: raw, port } = await params;
  if (!isPort(port)) notFound();
  const locale: Locale = resolveLocaleParam(raw);
  const c = getTranslations(locale).portsDecoy;
  const d = c.detail;
  const story = c.stories[port];
  const snippet = PORT_SNIPPETS[port];
  // eslint-disable-next-line react-hooks/purity -- server render, once per revalidation
  const now = Date.now();
  const decoys: Decoys | null = await liveDecoys();
  const stats = decoys?.ports?.[port];
  const tag = locale === 'it' ? 'it-IT' : 'en-GB';
  const nf = new Intl.NumberFormat(tag);
  const when = (iso: string | number) =>
    new Intl.DateTimeFormat(tag, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Rome',
    }).format(new Date(iso));
  const dayLabel = (date: string) =>
    new Intl.DateTimeFormat(tag, {
      day: 'numeric',
      month: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(date));

  const opening = DECOY_OPENED[port];
  const w = waited(opening, stats?.firstTimes, now);
  const seen = Boolean(w?.seen);
  const status = !w ? d.status.closed : seen ? d.status.seen : d.status.waiting;
  const headline = !w ? nameOf(port) : (seen ? d.seenHeadline : d.waitingHeadline).replace('{d}', formatDuration(w.ms, locale));

  // Labels per port: Redis's INFO and Docker's /info are different moves.
  const label = (k: string) => (c.calls[port] as Record<string, string>)[k] ?? k;
  // The real command where there is one; "other" has none, so it keeps its words.
  const cmd = (k: string) => {
    const x = (snippet.commands as Record<string, string>)[k];
    return !x || x === '—' ? label(k) : x;
  };
  const vocab: readonly string[] = PORT_CALLS[port];
  const calls = (stats?.calls ?? {}) as Record<string, number | undefined>;
  const moves = vocab.reduce((sum, k) => sum + (calls[k] ?? 0), 0);
  const topMove = Object.entries(stats?.firstMoves ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Every opened port plus the fake Ollama, on the same stopwatch.
  const race = [
    ...PORTS.map((p) => ({
      id: p as string,
      name: nameOf(p),
      w: waited(DECOY_OPENED[p], decoys?.ports?.[p]?.firstTimes, now),
    })),
    {
      id: 'ai',
      name: d.raceAi,
      w: waited(DECOY_OPENED.ai, decoys?.ai?.firstTimes, now),
    },
  ].filter(
    (
      r,
    ): r is {
      id: string;
      name: string;
      w: NonNullable<ReturnType<typeof waited>>;
    } => r.w !== null,
  );
  const fastest = race.filter((r) => r.w.seen).sort((a, b) => a.w.ms - b.w.ms)[0];

  const numbers = seen
    ? [
        { label: d.stats.opened, value: when(opening!.at) },
        { label: d.stats.first, value: formatDuration(w!.ms, locale) },
        { label: d.stats.visits, value: nf.format(stats?.connections ?? 0) },
        { label: d.stats.moves, value: nf.format(moves) },
        { label: d.stats.firstMove, value: topMove ? cmd(topMove) : '—' },
      ]
    : [
        { label: d.stats.opened, value: opening ? when(opening.at) : '—' },
        {
          label: d.stats.waiting,
          value: w ? formatDuration(w.ms, locale) : '—',
        },
        { label: d.stats.visits, value: '0' },
        {
          label: d.stats.fastest,
          value: fastest ? `${formatDuration(fastest.w.ms, locale)} · ${fastest.name}` : '—',
        },
      ];

  const keyCount = calls[snippet.key] ?? 0;
  const steps = seen
    ? [
        {
          time: when(opening!.at),
          title: d.steps.opened,
          body: d.steps.openedBody,
          on: false,
        },
        {
          time: when(w!.first!),
          title: d.steps.first,
          body: d.steps.firstBody.replace('{d}', formatDuration(w!.ms, locale)),
          on: true,
        },
        keyCount > 0 && {
          time: d.steps.since,
          title: d.steps.key.replace('{move}', cmd(snippet.key)).replace('{n}', nf.format(keyCount)),
          body: story.keyBody,
          on: true,
        },
        {
          time: d.steps.today,
          title: d.steps.todayTitle.replace('{v}', nf.format(stats?.connections ?? 0)).replace('{m}', nf.format(moves)),
          body: d.steps.todayBody,
          on: true,
        },
      ].filter((s): s is { time: string; title: string; body: string; on: boolean } => Boolean(s))
    : [];

  // Days before the opening are drawn dashed: the port was closed, not quiet.
  const openDay = opening?.at.slice(0, 10) ?? '9999';
  const daily =
    stats?.daily && decoys
      ? decoys.daily.map((day, i) => ({
          date: day.date,
          n: stats.daily![i] ?? 0,
          closed: day.date < openDay,
        }))
      : [];
  const dailyMax = Math.max(1, ...daily.map((x) => x.n));

  const rows = vocab
    .filter((k) => calls[k])
    .map((k) => ({ k, n: calls[k]! }))
    .sort((a, b) => b.n - a.n);
  const never = vocab.filter((k) => k !== 'other' && !calls[k]).map(cmd);

  const others = PORT_DECOYS.filter((p) => p.id !== port);

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm font-medium uppercase tracking-[0.08em]">
        <Link className="text-link hover:underline" href={localizedPath(locale, '/lab')}>
          Lab
        </Link>
        <span aria-hidden className="text-muted-foreground">
          ·
        </span>
        <Link className="text-link hover:underline" href={localizedPath(locale, '/lab/decoys/ports')}>
          {d.breadcrumb}
        </Link>
        <span aria-hidden className="text-muted-foreground">
          ·
        </span>
        <span className="text-muted-foreground">{nameOf(port)}</span>
      </nav>

      <p className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[12px] uppercase tracking-[0.06em]">
        <span className={cn('rounded-full border px-2.5 py-0.5', seen ? 'border-foreground' : 'border-dashed border-muted-foreground text-muted-foreground')}>
          {status}
        </span>
        <span className="text-muted-foreground">
          {nameOf(port)} :{PORT_DECOYS.find((p) => p.id === port)!.port} · {d.live}
        </span>
      </p>
      <h1 className="mt-5 max-w-[900px] font-serif text-[clamp(36px,5.5vw,64px)] font-normal leading-[1.05] tracking-[-0.025em]">{headline}</h1>
      <p className="mt-6 max-w-[680px] text-[19px] text-muted-foreground">{story.intro}</p>

      <dl className="mt-12 grid grid-cols-2 gap-x-6 border-y border-y-border border-t-foreground sm:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
        {numbers.map((s) => (
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
                <span className="pt-0.5 font-mono text-[13px] text-muted-foreground">{s.time}</span>
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

      {seen && daily.length > 0 && (
        <section aria-labelledby="daily-heading" className="mt-12">
          <H2 id="daily-heading">{d.dailyTitle}</H2>
          <p className="mt-3 max-w-[680px] text-muted-foreground">{d.dailyIntro}</p>
          <figure className="mt-8">
            <div aria-hidden className="grid h-44 grid-cols-[repeat(14,minmax(0,1fr))] items-end gap-0.5 border-b border-foreground">
              {daily.map((x) => (
                <div
                  key={x.date}
                  title={x.closed ? `${dayLabel(x.date)}: ${d.dailyClosed}` : d.dailyTip.replace('{d}', dayLabel(x.date)).replace('{n}', nf.format(x.n))}
                  className="flex h-full flex-col items-center justify-end"
                >
                  {!x.closed && <span className="mb-1 font-mono text-[11px] text-muted-foreground">{x.n || ''}</span>}
                  <span
                    className={cn('w-full max-w-10 rounded-t', x.closed ? 'h-full border border-b-0 border-dashed border-border' : 'bg-link')}
                    style={x.closed ? undefined : { height: `${(x.n / dailyMax) * 82}%` }}
                  />
                </div>
              ))}
            </div>
            <div
              aria-hidden
              className="mt-1.5 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-0.5 text-center font-mono text-[10px] text-muted-foreground sm:text-[11px]"
            >
              {/* On a phone 14 dates don't fit side by side: first and last only, still in their own columns. */}
              {daily.map((x, i) => (
                <span key={x.date} className={cn('whitespace-nowrap', i > 0 && i < daily.length - 1 && 'invisible sm:visible', i === 0 && 'max-sm:justify-self-start', i === daily.length - 1 && 'max-sm:justify-self-end')}>
                  {dayLabel(x.date)}
                </span>
              ))}
            </div>
            <ul className="sr-only">
              {daily.map((x) => (
                <li key={x.date}>
                  {x.closed ? `${dayLabel(x.date)}: ${d.dailyClosed}` : d.dailyTip.replace('{d}', dayLabel(x.date)).replace('{n}', nf.format(x.n))}
                </li>
              ))}
            </ul>
            <figcaption className="mt-3 text-sm text-muted-foreground">{d.dailyCaption}</figcaption>
          </figure>
        </section>
      )}

      {seen && stats?.sequences && stats.sequences.length > 0 && (
        <section aria-labelledby="script-heading" className="mt-16">
          <H2 id="script-heading">{d.scriptTitle}</H2>
          <p className="mt-3 max-w-[680px] text-muted-foreground">{d.scriptIntro}</p>
          <ol className="mt-6">
            {stats.sequences.map((s) => (
              <li key={s.moves.join('>')} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 border-b border-border py-4">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  {s.moves.map((m, i) => (
                    <span key={i} className="inline-flex items-center gap-2">
                      <span className={cn('rounded-full border border-border px-2.5 py-0.5 font-mono text-[13px]', m === snippet.key && 'bg-link/15')}>
                        {cmd(m)}
                      </span>
                      {i < s.moves.length - 1 && (
                        <span aria-hidden className="text-muted-foreground">
                          →
                        </span>
                      )}
                    </span>
                  ))}
                </span>
                <span className="font-serif text-[22px]">{d.scriptCount.replace('{n}', nf.format(s.n))}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {rows.length > 0 && (
        <section aria-labelledby="moves-heading" className="mt-16">
          <H2 id="moves-heading">{d.movesTitle}</H2>
          <p className="mt-3 max-w-[680px] text-muted-foreground">{d.movesIntro}</p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-[15px]">
              <thead>
                <tr className="text-left text-[13px] text-muted-foreground">
                  <th scope="col" className="border-b border-foreground pb-2.5 pr-4 font-medium">
                    {d.table.command}
                  </th>
                  <th scope="col" className="border-b border-foreground pb-2.5 pr-4 font-medium">
                    {d.table.what}
                  </th>
                  <th scope="col" className="border-b border-foreground pb-2.5 text-right font-medium">
                    {d.table.count}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ k, n }) => (
                  <tr key={k}>
                    <td className="whitespace-nowrap border-b border-border py-2.5 pr-4 font-mono text-[13px]">{cmd(k)}</td>
                    <td className="border-b border-border py-2.5 pr-4">{story.moves[k] ?? label(k)}</td>
                    <td className="border-b border-border py-2.5 text-right font-mono text-[13px]">{nf.format(n)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {never.length > 0 && <p className="mt-3 text-sm text-muted-foreground">{d.neverSeen.replace('{list}', never.join(' · '))}</p>}
        </section>
      )}

      {!seen && w && (
        <section aria-labelledby="race-heading" className="mt-16">
          <H2 id="race-heading">{d.raceTitle}</H2>
          <p className="mt-3 max-w-[680px] text-muted-foreground">{d.raceIntro}</p>
          <ul className="mt-7 flex flex-col gap-2.5">
            {race.map((r) => (
              <li key={r.id} className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[150px_minmax(0,1fr)_130px] sm:gap-4">
                <span className={cn('text-right text-sm', r.id === port && 'font-semibold')}>{r.name}</span>
                <span className="relative h-3">
                  <span
                    className={cn('absolute inset-y-0 left-0 rounded-r', r.w.seen ? 'bg-link' : 'border border-dashed border-muted-foreground')}
                    style={{ width: `${position(r.w.ms)}%` }}
                  />
                </span>
                <span className="col-start-2 font-mono text-[13px] text-muted-foreground sm:col-start-auto">
                  {r.w.seen ? formatDuration(r.w.ms, locale) : `${formatDuration(r.w.ms, locale)}…`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="answer-heading" className="mt-16 flex flex-wrap gap-10">
        <div className="min-w-0 flex-[1_1_420px]">
          <H2 id="answer-heading">{d.answerTitle}</H2>
          <p className="mb-5 mt-3 text-muted-foreground">{story.answerNote}</p>
          <figure>
            <figcaption className="bg-muted px-5 pt-3 font-mono text-[12px] text-muted-foreground">{snippet.file}</figcaption>
            <pre className="overflow-x-auto bg-muted px-5 pb-5 pt-2 font-mono text-[13px] leading-[1.8]">
              {snippet.lines.map((line, i) => (
                <span key={i} className={cn('block min-w-max', snippet.mark.includes(i) && 'bg-link/15')}>
                  {line}
                </span>
              ))}
            </pre>
          </figure>
        </div>
        <div className="min-w-0 flex-[1_1_420px]">
          <H2>{seen ? d.fixesTitle : d.waitTitle}</H2>
          <ol className="mt-3">
            {(seen ? story.fixes : [...story.wait, d.waitLast]).map((f, i) => (
              <li key={f.title} className={cn('border-b border-border py-3.5', !seen && 'grid grid-cols-[32px_minmax(0,1fr)] gap-3')}>
                {!seen && <span className="pt-0.5 font-mono text-[13px] text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>}
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
        <h2 id="lesson-heading" className="font-serif text-[26px] font-medium">
          {seen ? d.lessonTitle : d.waitBoxTitle}
        </h2>
        <p className="mt-3 max-w-[720px] font-serif text-[19px] leading-normal">{seen ? story.lesson : story.waitBox}</p>
      </section>

      {!seen && (
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
        <H2 id="others-heading" className="text-2xl">
          {d.othersTitle}
        </H2>
        <ul className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-6">
          {others.map((p) => {
            const o = race.find((r) => r.id === p.id);
            return (
              <li key={p.id}>
                <Link href={localizedPath(locale, `/lab/decoys/ports/${p.id}`)} className="group flex min-h-11 flex-col gap-1 border-b border-border py-4">
                  <span className="font-medium group-hover:underline">
                    {p.name}{' '}
                    <span aria-hidden className="text-link">
                      →
                    </span>
                  </span>
                  <span className="font-serif text-[22px]">{!o ? '—' : o.w.seen ? formatDuration(o.w.ms, locale) : c.waiting}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                    {!o ? d.status.closed : o.w.seen ? d.status.seen : d.status.waiting}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="mt-12 text-sm text-muted-foreground">
        {decoys ? `${d.updated.replace('{t}', when(decoys.generatedAt))} ` : ''}
        {d.privacy}
      </p>
    </div>
  );
}

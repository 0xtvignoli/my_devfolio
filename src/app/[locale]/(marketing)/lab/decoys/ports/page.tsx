import Link from 'next/link';
import { DECOY_OPENED, PORT_DECOYS, firstContact } from '@/data/decoy-ports';
import { position } from '@/lib/canary-time';
import { PORTS, PORT_CALLS, type Port, type PortStats } from '@/lib/decoys';
import { liveDecoys } from '@/lib/decoys-data';
import { formatDuration } from '@/lib/duration';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { LabNav } from '@/components/shared/lab-nav';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

// decoys.json is re-read from the VM's bucket at most every hour (lib/decoys-data).
export const dynamic = 'force-static';
export const revalidate = 3600; // the VM aggregates every hour (:05 UTC)

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale).portsDecoy;
  return createPageMetadata({ title: t.title, description: t.intro, path: '/lab/decoys/ports', locale });
}

const isPort = (id: string): id is Port => (PORTS as readonly string[]).includes(id);

export default async function PortsDecoyPage({ params }: Props) {
  const locale: Locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale);
  const c = t.portsDecoy;
  const nf = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB');
  const df = new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Rome' });
  const ports = (await liveDecoys())?.ports ?? {};

  const rows = PORT_DECOYS.map((p) => {
    const opened = isPort(p.id) ? DECOY_OPENED[p.id] : null;
    const stats: PortStats | undefined = isPort(p.id) ? ports[p.id] : undefined;
    const first = firstContact(opened, stats?.firstTimes);
    const after = opened && first ? Math.max(0, Date.parse(first) - Date.parse(opened.at)) : null;
    const move = Object.entries(stats?.firstMoves ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0];
    // Labels per port: Redis's INFO and Docker's /info are different moves.
    const label = (k: string) => (isPort(p.id) ? (c.calls[p.id] as Record<string, string>)[k] : undefined) ?? k;
    const vocab: readonly string[] = isPort(p.id) ? PORT_CALLS[p.id] : [];
    return { ...p, opened, stats, after, move, label, vocab };
  });

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
      <p className="mb-6 text-sm font-medium uppercase tracking-[0.08em] text-link">{c.kicker}</p>
      <h1 className="max-w-[860px] font-serif text-[clamp(36px,5.5vw,64px)] font-normal leading-[1.05] tracking-[-0.025em]">{c.title}</h1>
      <p className="mt-6 max-w-[680px] text-[19px] text-muted-foreground">{c.intro}</p>

      <ol className="mt-12 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((r) => (
          <li key={r.id} className="border-t border-foreground">
            <Link href={localizedPath(locale, `/lab/decoys/ports/${r.id}`)} className="group block pt-4">
              <p className="flex items-baseline justify-between gap-3">
                <span className="font-serif text-[24px] group-hover:underline">
                  {r.name} <span aria-hidden className="text-link">→</span>
                </span>
                <span className="font-mono text-[13px] text-muted-foreground">:{r.port}</span>
              </p>
              {isPort(r.id) && <p className="mt-1 text-[14px] text-muted-foreground">{c.teasers[r.id]}</p>}
              {!r.opened ? (
                <p className="mt-4 text-[15px] text-muted-foreground">{c.soon}</p>
              ) : (
                <>
                  <p className="mt-1 text-[13px] text-muted-foreground">{c.openedAt.replace('{t}', df.format(new Date(r.opened.at)))}</p>
                  <p className="mt-4 text-[13px] text-muted-foreground">{c.stats.first}</p>
                  <p className="font-serif text-[34px] leading-tight">{r.after === null ? c.waiting : formatDuration(r.after, locale)}</p>
                  {/* Same log scale as the canaries, 1 min → 1 week. */}
                  {r.after !== null && (
                    <span aria-hidden className="mt-2 block h-1.5 bg-muted">
                      <span className="block h-full bg-link" style={{ width: `${position(r.after)}%` }} />
                    </span>
                  )}
                  {r.move && (
                    <>
                      <p className="mt-4 text-[13px] text-muted-foreground">{c.stats.move}</p>
                      <p className="text-[15px]">{r.label(r.move)}</p>
                    </>
                  )}
                  {r.stats && (
                    <p className="mt-4 text-[13px] text-muted-foreground">
                      {c.stats.connections} · <span className="text-foreground">{nf.format(r.stats.connections)}</span>
                    </p>
                  )}
                </>
              )}
            </Link>
          </li>
        ))}
      </ol>

      <section className="mt-16 grid gap-x-14 gap-y-12 sm:grid-cols-2">
        <div>
          <h2 className="border-t border-foreground pt-5 font-serif text-[26px] font-medium">{c.behindTitle}</h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-muted-foreground">
            {c.behind.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <p className="mt-12 max-w-[760px] bg-muted p-5 text-sm text-muted-foreground">{c.note}</p>

      <LabNav current="ports" locale={locale} />
    </div>
  );
}

import { CANARIES, foldHits } from '@/data/canaries';
import { DECOY_OPENED, firstContact } from '@/data/decoy-ports';
import { ExposedSim, type ExposedItem } from '@/components/shared/exposed-sim';
import { LabNav } from '@/components/shared/lab-nav';
import { wait } from '@/lib/canary-time';
import { readSummary } from '@/lib/canary-store';
import { liveDecoys } from '@/lib/decoys-data';
import { AI_CALLS, PORTS } from '@/lib/decoys';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { createPageMetadata } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

// First contacts change rarely; the decoy side is re-read with the hourly aggregate.
export const dynamic = 'force-static';
export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

/** The default story: the two fastest kinds of leak and two services. */
const DEFAULT = ['github', 'port-redis', 'decoy-env', 'port-kubelet'];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale).exposed;
  return createPageMetadata({ title: t.title, description: t.intro, path: '/lab/exposed', locale });
}

export default async function ExposedPage({ params }: Props) {
  const locale: Locale = resolveLocaleParam((await params).locale);
  const all = getTranslations(locale);
  const t = all.exposed;
  // eslint-disable-next-line react-hooks/purity -- server render, once per revalidation
  const now = Date.now();
  const [summary, decoys] = await Promise.all([readSummary(), liveDecoys()]);
  const top = (counts: Partial<Record<string, number>> | undefined) => Object.entries(counts ?? {}).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0];

  // Keys: from planting to the first use, and the kinds of call made with them.
  const keys: ExposedItem[] = CANARIES.map((c) => foldHits(c, [], summary[c.id]))
    .filter((k) => k.plantedAt && !k.blocked)
    .map((k) => ({
      id: k.id,
      label: t.items[k.id].label,
      ms: k.firstUseAt ? wait(k, now) : null,
      waitedMs: wait(k, now)!,
      what: k.calls.slice(0, 4).map((x) => all.canaries.calls[x]).join(' · '),
      fix: t.items[k.id].fix,
    }));

  // Ports and Ollama: from the firewall rule to the first contact after our own checks.
  const opened = (id: 'ai' | (typeof PORTS)[number], firstTimes: string[] | undefined, what: string) => {
    const o = DECOY_OPENED[id];
    if (!o || !decoys) return null;
    const first = firstContact(o, firstTimes);
    return { ms: first ? Math.max(0, Date.parse(first) - Date.parse(o.at)) : null, waitedMs: now - Date.parse(o.at), what };
  };
  const services: ExposedItem[] = [
    ...PORTS.map((p) => {
      const stats = decoys?.ports?.[p];
      const move = top(stats?.firstMoves);
      const label = move ? (all.portsDecoy.calls[p] as Record<string, string>)[move] ?? move : '';
      const o = opened(p, stats?.firstTimes, label ? t.firstMove.replace('{move}', label) : '');
      return o && { id: `port-${p}`, label: t.items[`port-${p}`].label, fix: t.items[`port-${p}`].fix, ...o };
    }),
    (() => {
      const call = top(decoys?.ai?.calls) as (typeof AI_CALLS)[number] | undefined;
      const o = opened('ai', decoys?.ai?.firstTimes, call ? t.topCall.replace('{call}', all.aiDecoy.calls[call]) : '');
      return o && { id: 'ollama', label: t.items.ollama.label, fix: t.items.ollama.fix, ...o };
    })(),
  ].filter((x): x is ExposedItem => Boolean(x));

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
      <p className="mb-6 text-sm font-medium uppercase tracking-[0.08em] text-link">{t.kicker}</p>
      <h1 className="font-serif text-[clamp(40px,6vw,72px)] font-normal leading-[1.05] tracking-[-0.025em]">{t.title}</h1>
      <p className="mt-7 max-w-[680px] text-[19px] text-muted-foreground">{t.intro}</p>

      <ExposedSim items={[...keys, ...services]} initial={DEFAULT} locale={locale} t={t.sim} />

      <section aria-labelledby="exposed-source" className="mt-16 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 id="exposed-source" className="border-t border-foreground pt-5 font-serif text-[26px] font-medium">{t.sourceTitle}</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-muted-foreground">
            {t.source.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="border-t border-foreground pt-5 font-serif text-[26px] font-medium">{t.rulesTitle}</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-muted-foreground">
            {t.rules.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <LabNav current="exposed" locale={locale} />
    </div>
  );
}

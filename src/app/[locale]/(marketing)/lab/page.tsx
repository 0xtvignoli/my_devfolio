import Link from 'next/link';
import observatoryData from '@/data/observatory.json';
import { CANARIES, foldHits } from '@/data/canaries';
import { DECOY_OPENED, PORT_DECOYS, firstContact } from '@/data/decoy-ports';
import { LAB_EXPERIMENTS, type LabKey } from '@/data/lab';
import { JsonLd } from '@/components/seo/json-ld';
import { wait } from '@/lib/canary-time';
import { readSummary } from '@/lib/canary-store';
import { liveDecoys } from '@/lib/decoys-data';
import { PORTS } from '@/lib/decoys';
import { formatDuration } from '@/lib/duration';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { compare } from '@/lib/observatory/compare';
import type { Observatory } from '@/lib/observatory/types';
import { createPageMetadata } from '@/lib/seo/metadata';
import { buildBreadcrumbSchema } from '@/lib/seo/structured-data';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

// As fresh as its fastest row (the canary keys, every 5 minutes). It reads only the canary
// summary key and decoys.json, never the canarytokens exports.
export const dynamic = 'force-static';
export const revalidate = 300;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale).labIndex;
  return createPageMetadata({ title: t.title, description: t.intro, path: '/lab', locale });
}

/** How often each row's number can change: the cadence of the page it links to. */
const CADENCE: Record<LabKey, 'nightly' | 'fiveMin' | 'hourly' | 'quarterHour' | 'static'> = {
  observatory: 'nightly',
  canaries: 'fiveMin',
  ports: 'hourly',
  ai: 'hourly',
  compare: 'hourly',
  passwords: 'hourly',
  homelab: 'static',
  status: 'quarterHour',
};

export default async function LabIndexPage({ params }: Props) {
  const locale: Locale = resolveLocaleParam((await params).locale);
  const all = getTranslations(locale);
  const t = all.labIndex;
  const nf = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB');
  // eslint-disable-next-line react-hooks/purity -- server render, once per revalidation
  const now = Date.now();
  const observatory = observatoryData as Observatory;
  const [summary, decoys] = await Promise.all([readSummary(), liveDecoys()]);
  const dur = (ms: number) => formatDuration(ms, locale);

  // The fastest first use among the keys, as on the canaries page.
  const keys = CANARIES.map((c) => foldHits(c, [], summary[c.id]));
  const usedKeys = keys.filter((k) => k.firstUseAt).map((k) => ({ id: k.id, ms: wait(k, now)! }));
  const fastestKey = usedKeys.sort((a, b) => a.ms - b.ms)[0];

  // The fastest first contact among the open ports, as on the ports page.
  const portTimes = PORTS.flatMap((p) => {
    const opened = DECOY_OPENED[p];
    const first = firstContact(opened, decoys?.ports?.[p]?.firstTimes);
    return opened && first ? [{ p, ms: Math.max(0, Date.parse(first) - Date.parse(opened.at)) }] : [];
  }).sort((a, b) => a.ms - b.ms);
  const aiFirst = firstContact(DECOY_OPENED.ai, decoys?.ai?.firstTimes);
  const sideBySide = decoys ? compare(observatory, decoys) : null;
  const days = Math.round((Date.parse(observatory.to) - Date.parse(observatory.from)) / 86_400_000) + 1;

  const value: Partial<Record<LabKey, { value: string; unit: string }>> = {
    observatory: { value: nf.format(observatory.totals.hostile), unit: t.items.observatory.unit!.replace('{d}', String(days)) },
    ...(fastestKey && {
      canaries: { value: dur(fastestKey.ms), unit: t.items.canaries.unit!.replace('{where}', all.canaries.channels[fastestKey.id].short) },
    }),
    ...(portTimes[0] && {
      ports: { value: dur(portTimes[0].ms), unit: t.items.ports.unit!.replace('{where}', PORT_DECOYS.find((d) => d.id === portTimes[0].p)?.name ?? portTimes[0].p) },
    }),
    // Without decoys.json there is nothing to say: "waiting" would be a claim.
    ...(decoys && {
      ai: {
        value: aiFirst && DECOY_OPENED.ai ? dur(Math.max(0, Date.parse(aiFirst) - Date.parse(DECOY_OPENED.ai.at))) : t.waiting,
        unit: t.items.ai.unit!,
      },
    }),
    ...(sideBySide && {
      compare: { value: nf.format(sideBySide.ssh), unit: t.items.compare.unit!.replace('{d}', String(sideBySide.days)) },
    }),
    ...(decoys?.ssh.passwordHashes?.length && { passwords: { value: nf.format(decoys.ssh.passwordHashes.length), unit: t.items.passwords.unit! } }),
  };

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
      <JsonLd data={[buildBreadcrumbSchema([{ name: 'Home', path: localizedPath(locale) }, { name: t.title, path: localizedPath(locale, '/lab') }])]} />
      <p className="mb-6 text-sm font-medium uppercase tracking-[0.08em] text-link">{t.kicker}</p>
      <h1 className="font-serif text-[clamp(40px,6vw,72px)] font-normal leading-[1.05] tracking-[-0.025em]">{t.title}</h1>
      <p className="mt-7 max-w-[680px] text-[19px] text-muted-foreground">{t.intro}</p>

      <ol className="mt-12 border-t border-foreground">
        {LAB_EXPERIMENTS.map((e) => {
          const v = value[e.key];
          const item = t.items[e.key];
          const cadence = t.cadence[CADENCE[e.key]];
          return (
            <li key={e.key} className="border-b border-border">
              <Link
                href={localizedPath(locale, e.path)}
                className="group grid grid-cols-[minmax(0,1fr)_20px] gap-x-4 gap-y-2 py-5 sm:grid-cols-[120px_minmax(0,1.3fr)_minmax(0,1fr)_110px_20px] sm:items-baseline sm:gap-x-6"
              >
                <span className="col-span-2 font-mono text-[12px] uppercase tracking-[0.06em] text-muted-foreground sm:col-span-1">{t.groups[e.group]}</span>
                <span className="min-w-0">
                  <span className="block font-serif text-[22px] leading-tight group-hover:underline group-hover:underline-offset-4 sm:text-[24px]">{item.title}</span>
                  <span className="mt-1 block text-[15px] text-muted-foreground">{item.question}</span>
                </span>
                <span aria-hidden className="row-span-2 self-center text-link sm:order-last sm:row-span-1">→</span>
                <span className="min-w-0">
                  {v && (
                    <>
                      <span className="block font-serif text-[26px] leading-tight">{v.value}</span>
                      <span className="mt-0.5 block text-[13px] text-muted-foreground">{v.unit}</span>
                    </>
                  )}
                </span>
                <span className="font-mono text-[12px] text-link">{cadence && `● ${cadence}`}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

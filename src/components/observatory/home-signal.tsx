import Link from 'next/link';
import observatoryData from '@/data/observatory.json';
import { localizedPath } from '@/lib/i18n/paths';
import type { Observatory } from '@/lib/observatory/types';
import type { Locale, Translations } from '@/lib/types';

const data = observatoryData as Observatory;

/**
 * One line on the home page from the Observatory: yesterday's hostile
 * requests, the share stopped at the edge, the most wanted target. Static,
 * refreshed with the daily rebuild like /lab itself.
 */
export function HomeSignal({ locale, t }: { locale: Locale; t: Translations['home'] }) {
  // The last entry is today so far; yesterday is the last complete day.
  const yesterday = data.daily.at(-2) ?? data.daily.at(-1);
  if (!yesterday) return null;
  const nf = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB');
  const stopped = Math.min(100, Math.round((data.totals.stopped / Math.max(data.totals.hostile, 1)) * 100));
  const top = data.targets[0]?.target;

  return (
    <section aria-label={t.signalLabel} className="mx-auto max-w-[1120px] px-4 pb-20 sm:px-8">
      <Link
        href={localizedPath(locale, '/lab')}
        className="group flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3 border-y border-y-border border-t-foreground py-5"
      >
        <span className="flex items-center gap-2.5 font-mono text-[13px] text-muted-foreground">
          <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-link motion-reduce:animate-none" />
          {t.signalLabel}
        </span>
        <span className="flex flex-wrap items-baseline gap-x-12 gap-y-2">
          <span>
            <span className="font-serif text-[34px] leading-none">{nf.format(yesterday.hostile)}</span>{' '}
            <span className="text-[15px] text-muted-foreground">{t.signalHostile}</span>
          </span>
          <span>
            <span className="font-serif text-[34px] leading-none">{stopped}%</span>{' '}
            <span className="text-[15px] text-muted-foreground">{t.signalStopped}</span>
          </span>
          {top && (
            <span>
              <span className="font-mono text-xl">{top}</span>{' '}
              <span className="text-[15px] text-muted-foreground">{t.signalTop}</span>
            </span>
          )}
        </span>
        <span className="text-[15px] font-medium group-hover:underline group-hover:underline-offset-4">{t.signalCta}</span>
      </Link>
    </section>
  );
}

import Link from 'next/link';
import { LAB_EXPERIMENTS, type LabKey } from '@/data/lab';
import { getTranslations } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/types';

/** Bottom of every Lab experiment: previous, next, then the whole list, so no page is a dead end. */
export function LabNav({ current, locale, className }: { current: LabKey; locale: Locale; className?: string }) {
  const t = getTranslations(locale).labIndex;
  const i = LAB_EXPERIMENTS.findIndex((e) => e.key === current);
  const prev = i > 0 ? LAB_EXPERIMENTS[i - 1] : null;
  const next = i < LAB_EXPERIMENTS.length - 1 ? LAB_EXPERIMENTS[i + 1] : null;

  return (
    <nav aria-label={t.navLabel} className={cn('mt-20', className)}>
      <div className="grid border border-border sm:grid-cols-2">
        {prev ? (
          <Link href={localizedPath(locale, prev.path)} className="block p-4 hover:bg-muted sm:border-r sm:border-border">
            <span className="text-[13px] text-muted-foreground">← {t.prev}</span>
            <span className="mt-1 block font-medium">{t.items[prev.key].title}</span>
          </Link>
        ) : (
          <Link href={localizedPath(locale, '/lab')} className="block p-4 hover:bg-muted sm:border-r sm:border-border">
            <span className="text-[13px] text-muted-foreground">← {t.index}</span>
            <span className="mt-1 block font-medium">{t.title}</span>
          </Link>
        )}
        {next && (
          <Link href={localizedPath(locale, next.path)} className="block border-t border-border p-4 hover:bg-muted sm:border-t-0 sm:text-right">
            <span className="text-[13px] text-muted-foreground">{t.next} →</span>
            <span className="mt-1 block font-medium">{t.items[next.key].title}</span>
          </Link>
        )}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        <Link href={localizedPath(locale, '/lab')} className="text-link underline-offset-4 hover:underline">
          {t.all}
        </Link>
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {LAB_EXPERIMENTS.map((e) => (
          <li key={e.key}>
            {e.key === current ? (
              <span aria-current="page" className="text-foreground">{t.items[e.key].title}</span>
            ) : (
              <Link href={localizedPath(locale, e.path)} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                {t.items[e.key].title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

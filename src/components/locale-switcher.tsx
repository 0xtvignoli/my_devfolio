'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { switchLocaleInPath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/types';

const NAMES: Record<Locale, string> = { en: 'English', it: 'Italiano' };

/** "EN / IT" as plain links: the current one is ink, the other muted. */
export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/';
  return (
    <span className="inline-flex items-center text-[15px]">
      {SUPPORTED_LOCALES.map((l, i) => (
        <span key={l} className="inline-flex items-center">
          {i > 0 && <span aria-hidden className="px-1 text-muted-foreground">/</span>}
          {l === locale ? (
            <span aria-current="true" className="py-2.5 text-foreground">{l.toUpperCase()}</span>
          ) : (
            <Link
              href={switchLocaleInPath(pathname, l)}
              hrefLang={l}
              lang={l}
              aria-label={NAMES[l]}
              className="py-2.5 text-muted-foreground hover:text-foreground"
            >
              {l.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </span>
  );
}

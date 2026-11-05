import type { Locale } from '@/lib/types';

const FORMATS: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }),
  it: new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }),
};

/** "2026-07-08" → "08 Jul 2026" / "08 lug 2026". UTC so the build and the reader agree. */
export function formatDate(isoDate: string, locale: Locale): string {
  return FORMATS[locale].format(new Date(`${isoDate}T00:00:00Z`));
}

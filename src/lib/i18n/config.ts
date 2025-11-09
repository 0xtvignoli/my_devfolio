import type { Locale } from '@/lib/types';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'it'];
export const DEFAULT_LOCALE: Locale = 'en';

export const isSupportedLocale = (value: string | undefined | null): value is Locale =>
  Boolean(value && SUPPORTED_LOCALES.includes(value as Locale));

export const matchLocaleFromAcceptLanguage = (value: string | null): Locale | null => {
  if (!value) return null;
  const primary = value.split(',')[0]?.split('-')[0];
  return isSupportedLocale(primary) ? primary : null;
};

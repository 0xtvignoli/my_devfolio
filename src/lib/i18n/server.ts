import { headers } from 'next/headers';
import type { Locale, Translations } from '@/lib/types';
import { translations } from '@/data/locales';
import { DEFAULT_LOCALE, matchLocaleFromAcceptLanguage, isSupportedLocale, resolveLocaleParam } from './config';

export { resolveLocaleParam };

/** Resolve locale from proxy header (path-based i18n). Avoids cookies() for static rendering. */
export const resolveLocaleFromHeaders = async (): Promise<Locale> => {
  const headerStore = await headers();
  const fromPath = headerStore.get('x-locale');
  if (isSupportedLocale(fromPath)) {
    return fromPath;
  }
  const headerLocale = matchLocaleFromAcceptLanguage(headerStore.get('accept-language'));
  return headerLocale ?? DEFAULT_LOCALE;
};

/** @deprecated Prefer params.locale in pages or resolveLocaleFromHeaders in root layout. */
export const resolveLocale = resolveLocaleFromHeaders;

export const getTranslations = (locale: Locale): Translations => translations[locale];

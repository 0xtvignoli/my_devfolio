import { cookies, headers } from 'next/headers';
import type { Locale, Translations } from '@/lib/types';
import { translations } from '@/data/locales';
import { DEFAULT_LOCALE, matchLocaleFromAcceptLanguage, isSupportedLocale } from './config';

export const resolveLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value;
  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale;
  }

  const headerStore = await headers();
  const headerLocale = matchLocaleFromAcceptLanguage(headerStore.get('accept-language'));
  return headerLocale ?? DEFAULT_LOCALE;
};

export const getTranslations = (locale: Locale): Translations => translations[locale];

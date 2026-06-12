import type { Metadata } from 'next';
import type { Locale } from '@/lib/types';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { localizedPath, LOCALE_OPEN_GRAPH } from '@/lib/i18n/paths';
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from './constants';

type PageMetadataOptions = {
  title: string;
  description?: string;
  /** Path without locale prefix, e.g. '/portfolio' or '/' */
  path?: string;
  locale: Locale;
  type?: 'website' | 'article';
  publishedTime?: string;
  noIndex?: boolean;
};

function buildHreflangLanguages(pathWithoutLocale: string) {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((loc) => [loc, `${SITE_URL}${localizedPath(loc, pathWithoutLocale)}`])
  ) as Record<string, string>;
}

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  locale,
  type = 'website',
  publishedTime,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const canonicalPath = localizedPath(locale, path);
  const url = `${SITE_URL}${canonicalPath}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: buildHreflangLanguages(path),
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type,
      url,
      locale: LOCALE_OPEN_GRAPH[locale],
      alternateLocale: SUPPORTED_LOCALES.filter((l) => l !== locale).map((l) => LOCALE_OPEN_GRAPH[l]),
      siteName: SITE_NAME,
      title,
      description,
      ...(publishedTime && type === 'article' ? { publishedTime } : {}),
    },
  };
}

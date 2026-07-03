import type { Locale } from '@/lib/types';
import { isSupportedLocale, SUPPORTED_LOCALES } from './config';

export { SUPPORTED_LOCALES };

/** Build a locale-prefixed path, e.g. localizedPath('en', '/portfolio') → '/en/portfolio */
export function localizedPath(locale: Locale, path: string = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') return `/${locale}`;
  return `/${locale}${normalized}`;
}

/** Strip the locale prefix from a pathname, e.g. '/en/portfolio' → '/portfolio' */
export function stripLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && isSupportedLocale(segments[0])) {
    const rest = segments.slice(1).join('/');
    return rest ? `/${rest}` : '/';
  }
  return pathname || '/';
}

/** Read locale from the first path segment, if present. */
export function getLocaleFromPath(pathname: string): Locale | null {
  const first = pathname.split('/').filter(Boolean)[0];
  return isSupportedLocale(first) ? first : null;
}

/** Swap locale in a pathname while preserving the rest of the path. */
export function switchLocaleInPath(pathname: string, locale: Locale): string {
  return localizedPath(locale, stripLocaleFromPath(pathname));
}

export const LOCALE_OPEN_GRAPH: Record<Locale, string> = {
  en: 'en_US',
  it: 'it_IT',
};

import { MetadataRoute } from 'next';
import { getArticleSlugs, getArticle } from '@/data/content/articles';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { localizedPath } from '@/lib/i18n/paths';
import { SITE_URL } from '@/lib/seo/constants';

// /dashboard is deliberately absent: it renders entirely client-side, so a
// crawler indexes an empty shell. /live and /shell are noIndex experiments.
const STATIC_PATHS = ['', '/portfolio', '/lab', '/experience', '/articles', '/cv'] as const;

/** hreflang alternates including x-default (→ default locale) for a locale-agnostic path. */
function hreflangAlternates(pathWithoutLocale: string) {
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((loc) => [loc, `${SITE_URL}${localizedPath(loc, pathWithoutLocale)}`])
  ) as Record<string, string>;
  languages['x-default'] = `${SITE_URL}${localizedPath(DEFAULT_LOCALE, pathWithoutLocale)}`;
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // No lastModified on the static pages: `new Date()` moves on every build, which
  // tells crawlers the whole site changed daily. Absent beats wrong — the article
  // entries below carry a date that means something.
  const staticEntries: MetadataRoute.Sitemap = SUPPORTED_LOCALES.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: `${SITE_URL}${localizedPath(locale, path || '/')}`,
      changeFrequency: path === '/lab' ? ('daily' as const) : ('weekly' as const),
      priority: path === '' ? 1 : path === '/portfolio' || path === '/lab' ? 0.9 : 0.8,
      alternates: {
        languages: hreflangAlternates(path || '/'),
      },
    }))
  );

  const articleSlugs = getArticleSlugs();
  const articleEntries: MetadataRoute.Sitemap = articleSlugs.flatMap((slug) =>
    SUPPORTED_LOCALES.map((locale) => {
      const article = getArticle(slug, locale);
      return {
        url: `${SITE_URL}${localizedPath(locale, `/articles/${slug}`)}`,
        lastModified: article ? new Date(article.date) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: {
          languages: hreflangAlternates(`/articles/${slug}`),
        },
      };
    })
  );

  return [...staticEntries, ...articleEntries];
}

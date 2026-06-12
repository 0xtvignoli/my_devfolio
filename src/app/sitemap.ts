import { MetadataRoute } from 'next';
import { getArticleSlugs, getArticle } from '@/data/content/articles';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { localizedPath } from '@/lib/i18n/paths';
import { SITE_URL } from '@/lib/seo/constants';

const STATIC_PATHS = ['', '/portfolio', '/lab', '/experience', '/articles', '/dashboard'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = SUPPORTED_LOCALES.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: `${SITE_URL}${localizedPath(locale, path || '/')}`,
      lastModified: new Date(),
      changeFrequency: path === '/lab' || path === '/dashboard' ? ('daily' as const) : ('weekly' as const),
      priority: path === '' ? 1 : path === '/portfolio' || path === '/lab' ? 0.9 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          SUPPORTED_LOCALES.map((loc) => [
            loc,
            `${SITE_URL}${localizedPath(loc, path || '/')}`,
          ])
        ),
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
          languages: Object.fromEntries(
            SUPPORTED_LOCALES.map((loc) => [
              loc,
              `${SITE_URL}${localizedPath(loc, `/articles/${slug}`)}`,
            ])
          ),
        },
      };
    })
  );

  return [...staticEntries, ...articleEntries];
}

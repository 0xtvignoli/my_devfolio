import { MetadataRoute } from 'next';
import { getArticleSlugs, getArticle } from '@/data/content/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tvignoli.com';

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lab`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/experience`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  const articleSlugs = getArticleSlugs();
  const articleEntries: MetadataRoute.Sitemap = articleSlugs.map((slug) => {
    const article = getArticle(slug, 'en');
    return {
      url: `${baseUrl}/articles/${slug}`,
      lastModified: article ? new Date(article.date) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    };
  });

  return [...staticEntries, ...articleEntries];
}


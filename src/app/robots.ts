import { MetadataRoute } from 'next';
import { AI_SEARCH_CRAWLERS, AI_TRAINING_CRAWLERS } from '@/lib/security/ai-crawlers';
import { SITE_URL } from '@/lib/seo/constants';

export default function robots(): MetadataRoute.Robots {
  const trainingDisallow = ['/', '/api/', '/_next/'];

  return {
    rules: [
      // Default: allow crawlers except sensitive paths.
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // Block AI training/scraping bots (defense in depth with Cloudflare Block AI Bots).
      ...AI_TRAINING_CRAWLERS.map((userAgent) => ({
        userAgent,
        disallow: trainingDisallow,
      })),
      // Explicitly allow AI search/retrieval bots (Cloudflare best practice).
      ...AI_SEARCH_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: ['/api/', '/_next/'],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

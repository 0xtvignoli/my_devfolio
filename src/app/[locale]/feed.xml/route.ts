import { getArticles } from '@/data/content/articles';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { resolveLocaleParam } from '@/lib/i18n/server';
import { buildRssFeed } from '@/lib/seo/rss';

// One prerendered feed per locale, same as the article pages themselves.
export const dynamic = 'force-static';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocaleParam(localeParam);

  return new Response(buildRssFeed(getArticles(locale), locale), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

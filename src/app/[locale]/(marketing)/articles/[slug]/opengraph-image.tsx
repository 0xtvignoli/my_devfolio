import { getArticle } from '@/data/content/articles';
import { resolveLocaleParam } from '@/lib/i18n/server';
import { formatDate } from '@/lib/format-date';
import { OG_SIZE, renderCard } from '@/lib/og-card';

export const alt = 'Article — Thomas Vignoli';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocaleParam(localeParam);
  const article = getArticle(slug, locale);
  return renderCard({
    kicker: article ? article.tags.slice(0, 3).join(' · ') : 'Writing',
    title: article?.title ?? 'Thomas Vignoli',
    footer: article ? `Thomas Vignoli · ${formatDate(article.date, locale)}` : 'Thomas Vignoli',
  });
}

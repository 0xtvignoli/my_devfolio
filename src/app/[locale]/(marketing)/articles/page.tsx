import { ArticleRow } from '@/components/shared/article-row';
import { ArticleFilter } from '@/components/shared/article-filter';
import { getArticles } from '@/data/content/articles';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { buildBlogSchema, buildBreadcrumbSchema } from '@/lib/seo/structured-data';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

type ArticlesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ArticlesPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);
  return createPageMetadata({
    title: t.nav.articles,
    description: t.articles.pageSubtitle ?? t.hero.subtitle,
    path: '/articles',
    locale,
  });
}

export default async function ArticlesPage({ params }: ArticlesPageProps) {
  const { locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);
  const articles = getArticles(locale);

  return (
    <>
      <JsonLd
        data={[
          buildBlogSchema({
            path: localizedPath(locale, '/articles'),
            locale,
            name: t.nav.articles,
            description: t.articles.pageSubtitle,
            posts: articles.map((a) => ({
              title: a.title,
              description: a.description,
              path: localizedPath(locale, `/articles/${a.slug}`),
              datePublished: a.date,
            })),
          }),
          buildBreadcrumbSchema([
            { name: 'Home', path: localizedPath(locale) },
            { name: t.nav.articles, path: localizedPath(locale, '/articles') },
          ]),
        ]}
      />
      <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
        <h1 className="font-serif text-[clamp(40px,5vw,60px)] font-normal leading-[1.05] tracking-[-0.02em]">{t.nav.articles}</h1>
        <p className="mb-12 mt-5 max-w-[600px] text-[19px] text-muted-foreground">{t.articles.pageSubtitle}</p>
        <ArticleFilter
          label={t.articles.filterLabel}
          allLabel={t.articles.filterAll}
          countTemplate={t.articles.filterCount}
          items={articles.map((article) => ({
            slug: article.slug,
            tags: article.tags,
            row: <ArticleRow article={article} locale={locale} />,
          }))}
        />
      </div>
    </>
  );
}

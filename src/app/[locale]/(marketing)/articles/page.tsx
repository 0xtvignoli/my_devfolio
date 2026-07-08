import Link from 'next/link';
import { ArticleCard } from '@/components/shared/article-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui-mui';
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
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <section className="mb-12 border-b border-border pb-6" aria-labelledby="articles-heading">
          <h1 id="articles-heading" className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            <span aria-hidden className="text-muted-foreground mr-2">#</span>
            {t.nav.articles}
          </h1>
          {t.articles.pageSubtitle && (
            <p className="text-base text-muted-foreground mt-3 max-w-2xl">
              {t.articles.pageSubtitle}
            </p>
          )}
        </section>
        {articles.length === 0 ? (
          <EmptyState
            title={t.articles.emptyTitle ?? 'No articles yet'}
            description={t.articles.emptyDescription}
            action={
              <Button asChild variant="outline">
                <Link href={localizedPath(locale)}>
                  {locale === 'it' ? 'Torna alla home' : 'Back to home'}
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} locale={locale} translations={t} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

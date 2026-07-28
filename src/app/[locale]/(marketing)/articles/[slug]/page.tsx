import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Article as ArticleType, Locale } from '@/lib/types';
import { getArticle, getArticleSlugs, getRelatedArticles } from '@/data/content/articles';
import { CodeBlock } from '@/components/shared/code-block';
import { InlineText } from '@/components/shared/inline-text';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui-mui';
import { ArrowLeft } from 'lucide-react';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { createPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { buildArticleSchema, buildBreadcrumbSchema } from '@/lib/seo/structured-data';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

type ArticlePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return getArticleSlugs().flatMap((slug) =>
    SUPPORTED_LOCALES.map((locale) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug, locale: localeParam } = await params;
  const locale = resolveLocaleParam(localeParam);
  const article = getArticle(slug, locale);
  if (!article) return {};

  return createPageMetadata({
    title: article.title,
    description: article.description,
    path: `/articles/${slug}`,
    locale,
    type: 'article',
    publishedTime: article.date,
  });
}

const renderContent = (article: ArticleType) =>
  article.content.map((item, index) => {
    switch (item.type) {
      case 'heading': {
        const Tag = `h${item.level}` as keyof React.JSX.IntrinsicElements;
        return (
          <Tag key={index} className="font-headline font-bold text-2xl mt-8 mb-4">
            {item.content}
          </Tag>
        );
      }
      case 'paragraph':
        return (
          <p key={index} className="my-4 leading-relaxed">
            <InlineText text={item.content} />
          </p>
        );
      case 'list': {
        const Tag = item.ordered ? 'ol' : 'ul';
        return (
          <Tag key={index} className={cn('my-4 space-y-2 pl-6', item.ordered ? 'list-decimal' : 'list-disc')}>
            {item.items.map((entry, i) => (
              <li key={i} className="leading-relaxed">
                <InlineText text={entry} />
              </li>
            ))}
          </Tag>
        );
      }
      case 'code':
        return <CodeBlock key={index} language={item.language} code={item.code} />;
    }
  });

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug, locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);
  const article = getArticle(slug, locale);

  if (!article) {
    notFound();
  }

  const articlePath = localizedPath(locale, `/articles/${slug}`);
  const related = getRelatedArticles(slug, locale);

  return (
    <>
      <JsonLd
        data={[
          buildArticleSchema({
            title: article.title,
            description: article.description,
            path: articlePath,
            datePublished: article.date,
            locale,
          }),
          buildBreadcrumbSchema([
            { name: 'Home', path: localizedPath(locale) },
            { name: t.nav.articles, path: localizedPath(locale, '/articles') },
            { name: article.title, path: articlePath },
          ]),
        ]}
      />
      <article className="container max-w-3xl mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-8">
          <Link href={localizedPath(locale, '/articles')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.article.back}
          </Link>
        </Button>
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">{article.title}</h1>
        <div className="text-muted-foreground text-sm mb-8">
          <span>
            {t.article.author} {article.author}
          </span>
          <span className="mx-2">&middot;</span>
          <span>
            {t.article.published}{' '}
            {new Date(article.date).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">{renderContent(article)}</div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-border pt-8" aria-labelledby="related-heading">
            <h2 id="related-heading" className="font-headline text-xl font-bold mb-4 text-foreground">
              <span aria-hidden className="text-muted-foreground mr-2">##</span>
              {t.articles.related}
            </h2>
            <ul className="space-y-3 list-none p-0 m-0">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={localizedPath(locale, `/articles/${item.slug}`)}
                    className="text-foreground underline underline-offset-4 hover:opacity-70"
                  >
                    {item.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}

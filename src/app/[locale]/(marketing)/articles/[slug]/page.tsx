import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Article as ArticleType, Locale } from '@/lib/types';
import { getArticle, getArticleSlugs, getRelatedArticles } from '@/data/content/articles';
import { CodeBlock } from '@/components/shared/code-block';
import { InlineText } from '@/components/shared/inline-text';
import { cn } from '@/lib/utils';
import { headingIds } from '@/lib/heading-ids';
import { ArticleToc, ArticleTocDisclosure, ReadingProgress, type TocItem } from '@/components/shared/article-toc';
import { formatDate } from '@/lib/format-date';
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

/** ~220 words a minute, code blocks included: they are read too, just slower. */
function readingMinutes(article: ArticleType): number {
  const text = article.content
    .map((item) => (item.type === 'list' ? item.items.join(' ') : item.type === 'code' ? item.code : item.content))
    .join(' ');
  return Math.max(1, Math.round(text.split(/\s+/).length / 220));
}

/** Every heading gets a stable id; level-2 ones also feed the contents list. */
function outline(article: ArticleType) {
  const headings = article.content.flatMap((item, index) => (item.type === 'heading' ? [{ index, item }] : []));
  const ids = headingIds(headings.map((h) => h.item.content));
  const idByIndex = new Map(headings.map((h, i) => [h.index, ids[i]]));
  const toc: TocItem[] = headings
    .map((h, i) => ({ level: h.item.level, id: ids[i], text: h.item.content }))
    .filter((h) => h.level === 2)
    .map(({ id, text }) => ({ id, text }));
  return { idByIndex, toc };
}

const renderContent = (article: ArticleType, idByIndex: Map<number, string>, anchorLabel: string) =>
  article.content.map((item, index) => {
    switch (item.type) {
      case 'heading': {
        const Tag = `h${item.level}` as keyof React.JSX.IntrinsicElements;
        const id = idByIndex.get(index)!;
        return (
          <Tag
            key={index}
            id={id}
            className={cn(
              'group relative scroll-mt-8 font-sans font-semibold tracking-[-0.01em]',
              item.level === 2 ? 'mb-4 mt-12 text-[22px] leading-[1.3]' : 'mb-3 mt-9 text-lg leading-[1.35]',
            )}
          >
            {/* Sits in the left margin on wide screens; visible on hover and focus. */}
            <a
              href={`#${id}`}
              aria-label={`${anchorLabel}: ${item.content}`}
              className="absolute -left-7 top-0 hidden w-6 font-mono text-base text-link opacity-0 focus-visible:opacity-100 group-hover:opacity-100 sm:inline-block"
            >
              #
            </a>
            {item.content}
          </Tag>
        );
      }
      case 'paragraph':
        return (
          <p key={index} className="mb-7">
            <InlineText text={item.content} />
          </p>
        );
      case 'list': {
        const Tag = item.ordered ? 'ol' : 'ul';
        return (
          <Tag key={index} className={cn('mb-7 space-y-2 pl-6', item.ordered ? 'list-decimal' : 'list-disc')}>
            {item.items.map((entry, i) => (
              <li key={i} className="pl-1">
                <InlineText text={entry} />
              </li>
            ))}
          </Tag>
        );
      }
      case 'code':
        return <CodeBlock key={index} language={item.language} filename={item.filename} code={item.code} />;
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
  const { idByIndex, toc } = outline(article);
  // A short article needs no map.
  const showToc = toc.length >= 3;

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
      <ReadingProgress targetId="article-body" />
      <div className="mx-auto flex max-w-[1120px] justify-center gap-16 px-4 pb-24 pt-10 sm:px-8 sm:pt-[72px] lg:justify-between">
      <article className="min-w-0 max-w-[680px] flex-1">
        <Link
          href={localizedPath(locale, '/articles')}
          className="inline-block py-2.5 text-sm text-muted-foreground hover:text-foreground"
        >
          ← {t.nav.articles}
        </Link>
        <p className="mb-5 mt-4 text-sm font-medium uppercase tracking-[0.08em] text-link">{article.tags.join(' · ')}</p>
        <h1 className="font-serif text-[clamp(34px,5vw,54px)] font-normal leading-[1.08] tracking-[-0.02em]">
          {article.title}
        </h1>
        <p className="mt-6 font-serif text-xl italic leading-[1.45] text-muted-foreground sm:text-[22px]">
          {article.description}
        </p>
        <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-y border-border py-4 text-sm text-muted-foreground">
          <span>{article.author}</span>
          <time dateTime={article.date} className="font-mono text-[13px]">{formatDate(article.date, locale)}</time>
          <span>{readingMinutes(article)} {t.article.minRead}</span>
        </p>
        {showToc && (
          <div className="lg:hidden">
            <ArticleTocDisclosure items={toc} label={t.article.contents} />
          </div>
        )}

        <div id="article-body" className="mt-10 font-serif text-[19px] leading-[1.65] sm:text-[21px]">
          {renderContent(article, idByIndex, t.article.anchor)}
        </div>

        {related.length > 0 && (
          <nav aria-labelledby="related-heading" className="mt-[72px] border-t border-foreground pt-5">
            <h2 id="related-heading" className="mb-2 text-sm text-muted-foreground">{t.articles.related}</h2>
            <ul>
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={localizedPath(locale, `/articles/${item.slug}`)}
                    className="block py-2 font-serif text-2xl leading-[1.25] hover:underline hover:underline-offset-4 sm:text-[26px]"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </article>
      {showToc && (
        <aside className="hidden w-[240px] shrink-0 pt-[118px] lg:block">
          <ArticleToc items={toc} label={t.article.onThisPage} />
        </aside>
      )}
      </div>
    </>
  );
}

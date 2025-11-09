import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Article as ArticleType } from '@/lib/types';
import { getArticle, getArticleSlugs } from '@/data/content/articles';
import { CodeBlock } from '@/components/shared/code-block';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { resolveLocale, getTranslations } from '@/lib/i18n/server';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

const renderContent = (article: ArticleType) =>
  article.content.map((item, index) => {
    switch (item.type) {
      case 'heading': {
        const Tag = `h${item.level}` as keyof JSX.IntrinsicElements;
        return (
          <Tag key={index} className="font-headline font-bold text-2xl mt-8 mb-4">
            {item.content}
          </Tag>
        );
      }
      case 'paragraph':
        return (
          <p key={index} className="my-4 leading-relaxed">
            {item.content}
          </p>
        );
      case 'code':
        return <CodeBlock key={index} language={item.language} code={item.code} />;
      default:
        return null;
    }
  });

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const locale = await resolveLocale();
  const t = getTranslations(locale);
  const article = getArticle(slug, locale);

  if (!article) {
    notFound();
  }

  return (
    <article className="container max-w-3xl mx-auto px-4 py-12">
      <Button variant="ghost" asChild className="mb-8">
        <Link href="/articles">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.article.back}
        </Link>
      </Button>
      <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4">{article.title}</h1>
      <div className="text-muted-foreground text-sm mb-8">
        <span>
          {t.article.author} {article.author}
        </span>
        <span className="mx-2">&middot;</span>
        <span>
          {t.article.published}{" "}
          {new Date(article.date).toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">{renderContent(article)}</div>
    </article>
  );
}

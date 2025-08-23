'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import type { Article as ArticleType } from '@/lib/types';
import { getArticle } from '@/data/content/articles';
import { useLocale } from '@/hooks/use-locale';
import { CodeBlock } from '@/components/shared/code-block';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ArticlePage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { locale, t } = useLocale();
  const [article, setArticle] = useState<ArticleType | null | undefined>(null);

  useEffect(() => {
    if (slug) {
      const fetchedArticle = getArticle(slug, locale);
      setArticle(fetchedArticle);
    }
  }, [slug, locale]);

  if (article === null) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-5/6 mb-8" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (article === undefined) {
    notFound();
  }

  const renderContent = () => {
    return article.content.map((item, index) => {
      switch (item.type) {
        case 'heading':
          const Tag = `h${item.level}` as keyof JSX.IntrinsicElements;
          return <Tag key={index} className="font-headline font-bold text-2xl mt-8 mb-4">{item.content}</Tag>;
        case 'paragraph':
          return <p key={index} className="my-4 leading-relaxed">{item.content}</p>;
        case 'code':
          return <CodeBlock key={index} language={item.language} code={item.code} />;
        default:
          return null;
      }
    });
  };

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
        <span>{t.article.author} {article.author}</span>
        <span className="mx-2">&middot;</span>
        <span>{t.article.published} {new Date(article.date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {renderContent()}
      </div>
    </article>
  );
}

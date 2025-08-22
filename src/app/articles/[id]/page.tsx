import { articles } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';
import { person } from '@/lib/data';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = articles.find((p) => p.id === id);
  if (!article) {
    return { title: 'Article Not Found' };
  }
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: `${article.title} | ${person.name}`,
      description: article.summary,
    },
  };
}

export function generateStaticParams() {
  return articles.map((article) => ({
    id: article.id,
  }));
}

export default async function ArticleDetailsPage({ params }: Props) {
  const { id } = await params;
  const article = articles.find((p) => p.id === id);

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link
        href="/articles"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Articles
      </Link>

      <article
        className="prose prose-neutral dark:prose-invert max-w-none 
        prose-headings:font-headline prose-headings:text-primary
        prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-4
        prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6
        prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4
        prose-h4:text-xl prose-h4:font-semibold prose-h4:mt-6 prose-h4:mb-2
        prose-p:leading-7 prose-p:text-foreground
        prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2 prose-ul:text-foreground
        prose-li:marker:text-primary
        prose-pre:bg-secondary prose-pre:text-secondary-foreground prose-pre:p-4 prose-pre:rounded-lg prose-pre:shadow-sm prose-pre:overflow-x-auto
        prose-code:text-primary prose-code:font-mono prose-code:font-normal prose-code:before:content-[''] prose-code:after:content-['']
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:my-6 prose-blockquote:text-lg prose-blockquote:italic prose-blockquote:text-muted-foreground
        prose-a:text-primary hover:prose-a:underline prose-a:transition-colors
      "
      >
        <header className="space-y-4 not-prose">
          <h1 className="font-headline text-4xl font-bold text-primary">{article.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <time dateTime={article.date}>
              {new Date(article.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <div className="mt-8" dangerouslySetInnerHTML={{ __html: article.content }}></div>
      </article>
    </div>
  );
}

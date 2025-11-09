import Link from 'next/link';
import type { Article, Locale, Translations } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  locale: Locale;
  translations: Translations;
}

export function ArticleCard({ article, locale, translations }: ArticleCardProps) {
    return (
        <Link href={`/articles/${article.slug}`} className="block group">
            <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                <CardHeader>
                    <CardTitle className="font-headline">{article.title}</CardTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                      {translations.article.published} {new Date(article.date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </CardHeader>
                <CardContent className="flex-grow">
                    <CardDescription>{article.description}</CardDescription>
                </CardContent>
                <CardFooter>
                    <div className="text-sm font-medium text-primary flex items-center">
                        {translations.articles.viewAll}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}

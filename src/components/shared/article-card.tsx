import Link from 'next/link';
import type { Article, Locale, Translations } from '@/lib/types';
import { localizedPath } from '@/lib/i18n/paths';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui-mui';
import { ArrowRight } from 'lucide-react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface ArticleCardProps {
  article: Article;
  locale: Locale;
  translations: Translations;
}

export function ArticleCard({ article, locale, translations }: ArticleCardProps) {
  return (
    <Link href={localizedPath(locale, `/articles/${article.slug}`)} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <Card sx={{ height: '100%', transition: 'box-shadow 0.2s, transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
        <CardHeader
          title={<CardTitle>{article.title}</CardTitle>}
          subheader={
            <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>
              {translations.article.published} {new Date(article.date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          }
        />
        <CardContent sx={{ pt: 0 }}>
          <CardDescription>{article.description}</CardDescription>
        </CardContent>
        <CardFooter sx={{ pt: 0 }}>
          <Typography variant="body2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 500 }}>
            {translations.articles.viewAll}
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Typography>
        </CardFooter>
      </Card>
    </Link>
  );
}

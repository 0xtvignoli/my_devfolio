import Link from 'next/link';
import Image from 'next/image';
import type { Article, Locale, Translations } from '@/lib/types';
import { localizedPath } from '@/lib/i18n/paths';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui-mui';
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
      <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', transition: 'border-color 0.2s ease' }}>
        {article.imageUrl && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              minHeight: 150,
              bgcolor: 'action.hover',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Image
              src={article.imageUrl}
              alt={article.imageHint ?? article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
              unoptimized
              style={{ objectFit: 'cover' }}
            />
          </Box>
        )}
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
          {article.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
              {article.tags.map((tag) => (
                <Box
                  key={tag}
                  sx={{
                    px: 1,
                    py: 0.25,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '4px',
                  }}
                >
                  {tag}
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
        <CardFooter sx={{ pt: 0 }}>
          <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 500 }}>
            {translations.articles.viewAll}
            <span aria-hidden style={{ fontWeight: 700 }}>→</span>
          </Typography>
        </CardFooter>
      </Card>
    </Link>
  );
}

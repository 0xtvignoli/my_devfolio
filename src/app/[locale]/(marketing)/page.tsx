import Link from 'next/link';
import { ViewAllLink } from '@/components/shared/view-all-link';
import { ProjectCard } from '@/components/shared/project-card';
import { SectionHeading } from '@/components/shared/section-heading';
import { projects } from '@/data/content/projects';
import { ExperienceTimeline } from '@/components/experience-timeline';
import { ArticleCard } from '@/components/shared/article-card';
import { getArticles } from '@/data/content/articles';
import { EnhancedHero } from '@/components/enhanced-hero';
import { ContactSection } from '@/components/shared/contact-section';
import { ProfileAvatar } from '@/components/shared/profile-avatar';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import { AUTHOR_NAME } from '@/lib/seo/constants';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { Terminal } from 'lucide-react';

export const dynamic = 'force-static';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);
  return createPageMetadata({
    title: `${AUTHOR_NAME} - Senior DevOps Engineer Portfolio`,
    description: t.hero.subtitle,
    path: '/',
    locale,
  });
}

export default async function Home({ params }: HomePageProps) {
  const { locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);
  const articles = getArticles(locale);

  const featuredProjects = projects.slice(0, 2);
  const featuredArticles = articles.slice(0, 2);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
      <EnhancedHero
        locale={locale}
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        badge={t.hero.badge}
        ctaPortfolio={t.hero.ctaPortfolio}
        ctaLab={t.hero.ctaLab}
        ctaContact={t.hero.ctaContact}
        labPreviewTitle={t.hero.labPreviewTitle}
        labPreviewSubtitle={t.hero.labPreviewSubtitle}
      />

      <Stack component="section" id="about" aria-label={locale === 'it' ? 'Profilo' : 'Profile'} sx={{ py: 4 }}>
        <ProfileAvatar locale={locale} name={AUTHOR_NAME} role={t.hero.badge} />
      </Stack>

      {t.hero.tryLabTitle && t.hero.tryLabCta && (
        <Box
          component="section"
          aria-labelledby="try-lab-heading"
          className="glass-panel"
          sx={{
            py: 3,
            px: 2,
            borderRadius: 2,
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
          }}
        >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Terminal size={20} aria-hidden style={{ color: 'hsl(var(--primary))' }} />
            <Box>
              <h2 id="try-lab-heading" className="font-headline text-lg font-semibold text-foreground" style={{ margin: 0 }}>
                {t.hero.tryLabTitle}
              </h2>
              {t.hero.tryLabDescription && (
                <p className="text-sm text-muted-foreground dark:text-muted-foreground" style={{ margin: '4px 0 0' }}>
                  {t.hero.tryLabDescription}
                </p>
              )}
            </Box>
          </Box>
          <Link
            href={localizedPath(locale, '/lab')}
            className="font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary shrink-0 inline-flex items-center gap-1 min-h-[44px] min-w-[44px] justify-center"
          >
            {t.hero.tryLabCta}
          </Link>
        </Stack>
        </Box>
      )}

      <Stack component="section" id="skills" spacing={3} sx={{ py: 6 }}>
        <SectionHeading variant="h2" className="text-center" sx={{ mb: 3, fontSize: '1.875rem' }}>
          {t.skills.title}
        </SectionHeading>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
          {t.skills.list.map((skill) => (
            <Box
              key={skill}
              className="glass-panel"
              sx={{
                px: 2,
                py: 1,
                borderRadius: 9999,
                fontSize: '0.875rem',
                fontWeight: 500,
                border: '1px solid var(--glass-border)',
              }}
            >
              {skill}
            </Box>
          ))}
        </Box>
      </Stack>

      <Stack component="section" id="portfolio" spacing={3} sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <SectionHeading variant="h2" sx={{ fontSize: '1.875rem' }}>
            {t.portfolio.title}
          </SectionHeading>
          <ViewAllLink href={localizedPath(locale, '/portfolio')}>{t.portfolio.viewAll}</ViewAllLink>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} locale={locale} translations={t} />
          ))}
        </Box>
      </Stack>

      <Stack component="section" id="experience" spacing={3} sx={{ py: 6 }}>
        <SectionHeading variant="h2" className="text-center" sx={{ mb: 3, fontSize: '1.875rem' }}>
          {t.experience.title}
        </SectionHeading>
        <ExperienceTimeline locale={locale} />
      </Stack>

      <Stack component="section" id="articles" spacing={3} sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <SectionHeading variant="h2" sx={{ fontSize: '1.875rem' }}>
            {t.articles.title}
          </SectionHeading>
          <ViewAllLink href={localizedPath(locale, '/articles')}>{t.articles.viewAll}</ViewAllLink>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {featuredArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} locale={locale} translations={t} />
          ))}
        </Box>
      </Stack>

      <ContactSection email={t.contact.email} translations={t} locale={locale} />
    </Container>
  );
}

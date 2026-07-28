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
import { hasAssistantKey } from '@/ai/config';
import { isContactFormConfigured } from '@/lib/contact-config';
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
          sx={{
            py: 3,
            px: 2.5,
            borderRadius: 0,
            border: '1px solid',
            borderColor: 'divider',
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
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box component="span" aria-hidden sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.6 }}>{'>_'}</Box>
            <Box>
              <h2 id="try-lab-heading" className="font-headline text-lg font-bold text-foreground" style={{ margin: 0 }}>
                {t.hero.tryLabTitle}
              </h2>
              {t.hero.tryLabDescription && (
                <p className="text-sm text-muted-foreground" style={{ margin: '4px 0 0' }}>
                  {t.hero.tryLabDescription}
                </p>
              )}
            </Box>
          </Box>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href={localizedPath(locale, '/lab')}
              className="font-medium text-foreground underline underline-offset-4 hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring shrink-0 inline-flex items-center gap-2 min-h-[44px] min-w-[44px] justify-center"
            >
              {t.hero.tryLabCta}
              <span aria-hidden className="font-bold no-underline">→</span>
            </Link>
            {/* The experiments that aren't simulated. Live Ops depends on a
                backend that isn't always up, and this is the landing page — no
                link rather than a link to an offline page. Build-time gate, so
                configuring the backend needs a redeploy to surface it. */}
            {process.env.NEXT_PUBLIC_MINILAB_URL && (
              <Link
                href={localizedPath(locale, '/live')}
                title="Real commands against an emulated AWS"
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground inline-flex items-center min-h-[44px]"
              >
                Live Ops
              </Link>
            )}
            {/* Native <a>: /shell needs a full-document load for its COOP/COEP
                isolation headers to apply (see proxy.ts). */}
            <a
              href={localizedPath(locale, '/shell')}
              title="Real bash, running in your browser via WebAssembly"
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground inline-flex items-center min-h-[44px]"
            >
              Shell
            </a>
          </Stack>
        </Stack>
        </Box>
      )}

      <Stack component="section" id="skills" spacing={3} sx={{ py: 6 }}>
        <SectionHeading variant="h2" marker="##" sx={{ mb: 3, fontSize: '1.5rem' }}>
          {t.skills.title}
        </SectionHeading>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {t.skills.list.map((skill) => (
            <Box
              key={skill}
              sx={{
                px: 1.25,
                py: 0.25,
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: 400,
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {skill}
            </Box>
          ))}
        </Box>
      </Stack>

      <Stack component="section" id="portfolio" spacing={3} sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <SectionHeading variant="h2" marker="##" rule={false} sx={{ fontSize: '1.5rem' }}>
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
        <SectionHeading variant="h2" marker="##" sx={{ mb: 3, fontSize: '1.5rem' }}>
          {t.experience.title}
        </SectionHeading>
        <ExperienceTimeline locale={locale} />
      </Stack>

      <Stack component="section" id="articles" spacing={3} sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <SectionHeading variant="h2" marker="##" rule={false} sx={{ fontSize: '1.5rem' }}>
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

      <ContactSection
        translations={t}
        locale={locale}
        assistantEnabled={hasAssistantKey()}
        formEnabled={isContactFormConfigured()}
      />
    </Container>
  );
}

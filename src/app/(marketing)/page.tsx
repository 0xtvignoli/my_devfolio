import { ViewAllLink } from '@/components/shared/view-all-link';
import { ProjectCard } from '@/components/shared/project-card';
import { SectionHeading } from '@/components/shared/section-heading';
import { projects } from '@/data/content/projects';
import { ExperienceTimeline } from '@/components/experience-timeline';
import { ArticleCard } from '@/components/shared/article-card';
import { getArticles } from '@/data/content/articles';
import { EnhancedHero } from '@/components/enhanced-hero';
import { ContactSection } from '@/components/shared/contact-section';
import { resolveLocale, getTranslations } from '@/lib/i18n/server';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

export default async function Home() {
  const locale = await resolveLocale();
  const t = getTranslations(locale);
  const articles = getArticles(locale);

  const featuredProjects = projects.slice(0, 2);
  const featuredArticles = articles.slice(0, 2);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
      <EnhancedHero
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        ctaPortfolio={t.hero.ctaPortfolio}
        ctaContact={t.hero.ctaContact}
      />

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
          <ViewAllLink href="/portfolio">{t.portfolio.viewAll}</ViewAllLink>
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
          <ViewAllLink href="/articles">{t.articles.viewAll}</ViewAllLink>
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

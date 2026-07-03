import { ProjectCard } from '@/components/shared/project-card';
import { projects } from '@/data/content/projects';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { buildBreadcrumbSchema } from '@/lib/seo/structured-data';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

type PortfolioPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);
  return createPageMetadata({
    title: t.nav.portfolio,
    description: t.portfolio.pageSubtitle ?? t.hero.subtitle,
    path: '/portfolio',
    locale,
  });
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', path: localizedPath(locale) },
          { name: t.nav.portfolio, path: localizedPath(locale, '/portfolio') },
        ])}
      />
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <section className="mb-12 border-b border-border pb-6" aria-labelledby="portfolio-heading">
          <h1 id="portfolio-heading" className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            <span aria-hidden className="text-muted-foreground mr-2">#</span>
            {t.nav.portfolio}
          </h1>
          {t.portfolio.pageSubtitle && (
            <p className="text-base text-muted-foreground mt-3 max-w-2xl">
              {t.portfolio.pageSubtitle}
            </p>
          )}
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} locale={locale} translations={t} />
          ))}
        </div>
      </div>
    </>
  );
}

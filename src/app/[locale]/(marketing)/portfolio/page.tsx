import { ProjectEntry } from '@/components/shared/project-entry';
import { projects } from '@/data/content/projects';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { buildCollectionPageSchema, buildBreadcrumbSchema } from '@/lib/seo/structured-data';
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
        data={[
          buildCollectionPageSchema({
            path: localizedPath(locale, '/portfolio'),
            locale,
            name: t.nav.portfolio,
            description: t.portfolio.pageSubtitle,
            items: projects.map((p) => ({
              name: p.title[locale],
              description: p.description[locale],
              codeRepository: p.githubUrl,
              keywords: p.tags,
            })),
          }),
          buildBreadcrumbSchema([
            { name: 'Home', path: localizedPath(locale) },
            { name: t.nav.portfolio, path: localizedPath(locale, '/portfolio') },
          ]),
        ]}
      />
      <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
        <h1 className="font-serif text-[clamp(40px,5vw,60px)] font-normal leading-[1.05] tracking-[-0.02em]">{t.nav.portfolio}</h1>
        <p className="mb-8 mt-5 max-w-[600px] text-[19px] text-muted-foreground">{t.portfolio.pageSubtitle}</p>
        <div className="border-t border-foreground">
          {projects.map((project, i) => (
            <ProjectEntry key={project.id} project={project} index={i} locale={locale} translations={t} />
          ))}
        </div>
      </div>
    </>
  );
}

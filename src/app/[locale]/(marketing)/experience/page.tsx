import { ExperienceTimeline } from '@/components/experience-timeline';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { buildBreadcrumbSchema } from '@/lib/seo/structured-data';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

type ExperiencePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ExperiencePageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);
  return createPageMetadata({
    title: t.experience.title,
    description: t.experience.pageSubtitle ?? t.hero.subtitle,
    path: '/experience',
    locale,
  });
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', path: localizedPath(locale) },
          { name: t.experience.title, path: localizedPath(locale, '/experience') },
        ])}
      />
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <section className="mb-16 border-b border-border pb-6" aria-labelledby="experience-heading">
          <h1 id="experience-heading" className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            <span aria-hidden className="text-muted-foreground mr-2">#</span>
            {t.experience.title}
          </h1>
          {t.experience.pageSubtitle && (
            <p className="text-base text-muted-foreground mt-3 max-w-2xl">
              {t.experience.pageSubtitle}
            </p>
          )}
        </section>
        <ExperienceTimeline locale={locale} />
      </div>
    </>
  );
}

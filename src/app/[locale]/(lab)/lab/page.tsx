import { LabPageWrapper } from '@/components/lab/lab-page-wrapper';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import { buildBreadcrumbSchema, buildLabSchema } from '@/lib/seo/structured-data';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

type LabPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LabPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);
  return createPageMetadata({
    title: t.nav.lab,
    description: t.hero.tryLabDescription ?? t.hero.subtitle,
    path: '/lab',
    locale,
  });
}

export default async function LabPage({ params }: LabPageProps) {
  const { locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const translations = getTranslations(locale);

  return (
    <>
      <JsonLd
        data={[
          buildLabSchema(),
          buildBreadcrumbSchema([
            { name: 'Home', path: localizedPath(locale) },
            { name: 'Lab', path: localizedPath(locale, '/lab') },
          ]),
        ]}
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-4 pb-2" aria-label="Breadcrumb region">
          <Breadcrumbs items={[{ label: 'Lab' }]} />
        </div>
        <LabPageWrapper locale={locale} translations={translations} />
      </div>
    </>
  );
}

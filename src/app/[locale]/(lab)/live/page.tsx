import { LabLivePanel } from '@/components/lab/lab-live-panel';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

type LivePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LivePageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocaleParam(localeParam);
  return createPageMetadata({
    title: 'Live Ops (experimental)',
    description: 'Run real commands against an emulated AWS, isolated per session.',
    path: '/live',
    locale,
    noIndex: true,
  });
}

export default async function LivePage({ params }: LivePageProps) {
  const { locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const translations = getTranslations(locale);

  return (
    <div className="lab-md3-theme min-h-screen bg-[var(--md-sys-color-surface)]">
      <div className="container mx-auto px-4 pt-4 pb-2" aria-label="Breadcrumb region">
        <Breadcrumbs
          items={[
            { label: translations.nav.lab, href: localizedPath(locale, '/lab') },
            { label: 'Live Ops' },
          ]}
        />
      </div>
      <div className="container mx-auto px-4 pb-6" style={{ height: 'calc(100dvh - 8rem)' }}>
        <LabLivePanel />
      </div>
    </div>
  );
}

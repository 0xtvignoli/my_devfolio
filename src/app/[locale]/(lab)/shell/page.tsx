import { RealShell } from '@/components/lab/real-shell';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

// Static shell; the cross-origin isolation headers it needs are applied at the
// edge by proxy.ts for the /shell path. noIndex — it's an experimental route.
export const dynamic = 'force-static';

type ShellPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ShellPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocaleParam(localeParam);
  return createPageMetadata({
    title: 'Real Shell (experimental)',
    description: 'A genuinely executing bash shell running client-side via WebAssembly.',
    path: '/shell',
    locale,
    noIndex: true,
  });
}

export default async function ShellPage({ params }: ShellPageProps) {
  const { locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const translations = getTranslations(locale);

  return (
    <div className="lab-md3-theme min-h-screen bg-[var(--md-sys-color-surface)]">
      <div className="container mx-auto px-4 pt-4 pb-2" aria-label="Breadcrumb region">
        <Breadcrumbs
          items={[
            { label: translations.nav.lab, href: localizedPath(locale, '/lab') },
            { label: 'Shell' },
          ]}
        />
      </div>
      <div className="container mx-auto px-4 pb-6" style={{ height: 'calc(100dvh - 8rem)' }}>
        <RealShell />
      </div>
    </div>
  );
}

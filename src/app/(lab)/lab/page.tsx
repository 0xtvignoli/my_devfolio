import { LabPageWrapper } from '@/components/lab/lab-page-wrapper';
import { AuroraBackground } from '@/components/backgrounds/aurora';
import { GridBackground } from '@/components/backgrounds/grid';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { resolveLocale, getTranslations } from '@/lib/i18n/server';

export default async function LabPage() {
  const locale = await resolveLocale();
  const translations = getTranslations(locale);

  return (
    <div className="relative">
      <AuroraBackground />
      <GridBackground />
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 pt-6 pb-4">
        <Breadcrumbs 
          items={[
            { label: 'Lab', href: '/lab' }
          ]}
        />
      </div>
      <LabPageWrapper locale={locale} translations={translations} />
    </div>
  );
}

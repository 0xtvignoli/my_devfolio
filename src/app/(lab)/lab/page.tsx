import { LabClientPage } from '@/components/lab/lab-client-page';
import { AuroraBackground } from '@/components/backgrounds/aurora';
import { GridBackground } from '@/components/backgrounds/grid';
import { resolveLocale, getTranslations } from '@/lib/i18n/server';

export default async function LabPage() {
  const locale = await resolveLocale();
  const translations = getTranslations(locale);

  return (
    <div className="relative">
      <AuroraBackground />
      <GridBackground />
      <LabClientPage locale={locale} translations={translations} />
    </div>
  );
}

'use client';

import { ErrorBoundary } from '@/components/shared/error-boundary';
import { LabLayoutSelector } from '@/components/lab/lab-layout-selector';
import type { CiRun } from '@/lib/ci-status';
import type { Locale, Translations } from '@/lib/types';

interface LabPageWrapperProps {
  locale: Locale;
  translations: Translations;
  /** Real CI runs, fetched at build time by the server page. */
  ciRuns: CiRun[];
}

export function LabPageWrapper({ locale, translations, ciRuns }: LabPageWrapperProps) {
  return (
    <ErrorBoundary
      messages={{
        title: translations.errorBoundary.title,
        description: translations.errorBoundary.description,
        reloadLabel: translations.errorBoundary.reload,
        goHomeLabel: translations.errorBoundary.goHome,
      }}
    >
      <LabLayoutSelector locale={locale} translations={translations} ciRuns={ciRuns} />
    </ErrorBoundary>
  );
}




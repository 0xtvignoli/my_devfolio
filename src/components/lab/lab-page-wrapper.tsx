'use client';

import { ErrorBoundary } from '@/components/shared/error-boundary';
import { LabLayoutSelector } from '@/components/lab/lab-layout-selector';
import type { Locale, Translations } from '@/lib/types';

interface LabPageWrapperProps {
  locale: Locale;
  translations: Translations;
}

export function LabPageWrapper({ locale, translations }: LabPageWrapperProps) {
  return (
    <ErrorBoundary
      messages={{
        title: translations.errorBoundary.title,
        description: translations.errorBoundary.description,
        reloadLabel: translations.errorBoundary.reload,
        goHomeLabel: translations.errorBoundary.goHome,
      }}
    >
      <LabLayoutSelector locale={locale} translations={translations} />
    </ErrorBoundary>
  );
}




import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Locale } from '@/lib/types';
import { SUPPORTED_LOCALES, isSupportedLocale } from '@/lib/i18n/config';
import { resolveLocaleParam } from '@/lib/i18n/server';

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: localeParam } = await params;
  if (!isSupportedLocale(localeParam)) {
    notFound();
  }

  const locale: Locale = resolveLocaleParam(localeParam);

  return <div data-locale={locale}>{children}</div>;
}

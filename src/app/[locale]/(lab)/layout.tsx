import type { ReactNode } from "react";
import { LabProviders } from "@/components/providers/lab-providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getTranslations, resolveLocaleParam } from "@/lib/i18n/server";
import type { Locale } from "@/lib/types";

type LabLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LabLayout({ children, params }: LabLayoutProps) {
  const { locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const translations = getTranslations(locale);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)]">
      <Header locale={locale} translations={translations} />
      <LabProviders>
        <main id="main-content" className="flex-1">{children}</main>
      </LabProviders>
      <Footer locale={locale} />
    </div>
  );
}

import type { ReactNode } from "react";
import { LabProviders } from "@/components/providers/lab-providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { resolveLocale, getTranslations } from "@/lib/i18n/server";

export default async function LabLayout({ children }: { children: ReactNode }) {
  const locale = await resolveLocale();
  const translations = getTranslations(locale);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)]">
      <Header locale={locale} translations={translations} />
      <LabProviders>
        <main className="flex-1">{children}</main>
      </LabProviders>
      <Footer />
    </div>
  );
}

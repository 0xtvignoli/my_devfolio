import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { resolveLocale, getTranslations } from "@/lib/i18n/server";

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const locale = await resolveLocale();
  const translations = getTranslations(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} translations={translations} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

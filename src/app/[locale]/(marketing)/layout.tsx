import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketingBottomNav } from "@/components/mobile/marketing-bottom-nav";
import { getTranslations, resolveLocaleParam } from "@/lib/i18n/server";
import type { Locale } from "@/lib/types";

type MarketingLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MarketingLayout({ children, params }: MarketingLayoutProps) {
  const { locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const translations = getTranslations(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} translations={translations} />
      <main
        id="main-content"
        className="flex-1 pb-[calc(72px+env(safe-area-inset-bottom,0px))] md:pb-0"
      >
        {children}
      </main>
      <Footer locale={locale} />
      <MarketingBottomNav locale={locale} translations={translations} />
    </div>
  );
}

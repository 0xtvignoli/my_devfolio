import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getTranslations, resolveLocaleParam } from "@/lib/i18n/server";
import { localizedPath } from "@/lib/i18n/paths";
import { getArticles } from "@/data/content/articles";
import { projects } from "@/data/content/projects";
import type { PaletteEntry } from "@/components/command-palette";
import type { Locale } from "@/lib/types";

type MarketingLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MarketingLayout({ children, params }: MarketingLayoutProps) {
  const { locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const translations = getTranslations(locale);
  const t = translations;
  // Home first: the palette's mail command goes to its #contact section.
  const paletteEntries: PaletteEntry[] = [
    { group: "pages", title: "Home", href: localizedPath(locale) },
    { group: "pages", title: t.nav.portfolio, href: localizedPath(locale, "/portfolio") },
    { group: "pages", title: t.nav.articles, href: localizedPath(locale, "/articles") },
    { group: "pages", title: t.nav.lab, href: localizedPath(locale, "/lab") },
    { group: "pages", title: t.nav.experience, href: localizedPath(locale, "/experience") },
    { group: "pages", title: t.nav.cv, href: localizedPath(locale, "/cv") },
    ...getArticles(locale).map((a) => ({ group: "articles" as const, title: a.title, href: localizedPath(locale, `/articles/${a.slug}`) })),
    ...projects.map((p) => ({ group: "projects" as const, title: p.title[locale], href: `${localizedPath(locale, "/portfolio")}#${p.id}` })),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} translations={translations} paletteEntries={paletteEntries} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  );
}

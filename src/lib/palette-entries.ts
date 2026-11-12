import { LAB_EXPERIMENTS } from '@/data/lab';
import { getArticles } from '@/data/content/articles';
import { projects } from '@/data/content/projects';
import { getTranslations } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import type { PaletteEntry } from '@/components/command-palette';
import type { Locale } from '@/lib/types';

/** Everything the ⌘K palette can jump to. Home first: the mail command goes to its #contact. */
export function paletteEntries(locale: Locale): PaletteEntry[] {
  const t = getTranslations(locale);
  return [
    { group: 'pages', title: 'Home', href: localizedPath(locale) },
    { group: 'pages', title: t.nav.portfolio, href: localizedPath(locale, '/portfolio') },
    { group: 'pages', title: t.nav.articles, href: localizedPath(locale, '/articles') },
    { group: 'pages', title: t.nav.lab, href: localizedPath(locale, '/lab') },
    ...LAB_EXPERIMENTS.map((e) => ({ group: 'pages' as const, title: `Lab · ${t.labIndex.items[e.key].title}`, href: localizedPath(locale, e.path) })),
    { group: 'pages', title: t.nav.experience, href: localizedPath(locale, '/experience') },
    { group: 'pages', title: t.nav.cv, href: localizedPath(locale, '/cv') },
    ...getArticles(locale).map((a) => ({ group: 'articles' as const, title: a.title, href: localizedPath(locale, `/articles/${a.slug}`) })),
    ...projects.map((p) => ({ group: 'projects' as const, title: p.title[locale], href: `${localizedPath(locale, '/portfolio')}#${p.id}` })),
  ];
}

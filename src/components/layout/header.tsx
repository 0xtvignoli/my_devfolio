'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { cn } from '@/lib/utils';
import { AUTHOR_NAME } from '@/lib/seo/constants';
import { localizedPath, stripLocaleFromPath } from '@/lib/i18n/paths';
import type { Locale, Translations } from '@/lib/types';

function isActivePath(currentPath: string, itemPath: string): boolean {
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

/**
 * One row, no drawer: five short items wrap onto a second line on a phone,
 * which is cheaper and more honest than a hamburger hiding four links.
 */
export function Header({ locale, translations }: { locale: Locale; translations: Translations }) {
  const currentPath = stripLocaleFromPath(usePathname() ?? '/');
  const links = [
    { path: '/portfolio', label: translations.nav.portfolio },
    { path: '/articles', label: translations.nav.articles },
    { path: '/lab', label: translations.nav.lab },
    { path: '/cv', label: translations.nav.cv },
  ];

  return (
    <header data-site-header className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-x-8 gap-y-2 px-4 py-5 sm:px-8 sm:py-7">
      <Link
        href={localizedPath(locale)}
        className="py-2 font-serif text-[22px] font-semibold tracking-[-0.01em] text-foreground"
      >
        {AUTHOR_NAME}
      </Link>
      <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[15px] sm:gap-x-7">
        {links.map((link) => {
          const active = isActivePath(currentPath, link.path);
          return (
            <Link
              key={link.path}
              href={localizedPath(locale, link.path)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'py-2.5 hover:text-foreground',
                active ? 'text-foreground underline underline-offset-[6px]' : 'text-muted-foreground',
              )}
            >
              {link.label}
            </Link>
          );
        })}
        <LocaleSwitcher locale={locale} />
        <ThemeToggle labels={translations.theme} />
      </nav>
    </header>
  );
}

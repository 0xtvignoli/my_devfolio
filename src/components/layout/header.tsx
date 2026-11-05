'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { CommandPalette, type PaletteEntry } from '@/components/command-palette';
import { cn } from '@/lib/utils';
import { AUTHOR_NAME } from '@/lib/seo/constants';
import { localizedPath, stripLocaleFromPath, switchLocaleInPath } from '@/lib/i18n/paths';
import type { Locale, Translations } from '@/lib/types';

function isActivePath(currentPath: string, itemPath: string): boolean {
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

/**
 * One row, no drawer: five short items wrap onto a second line on a phone,
 * which is cheaper and more honest than a hamburger hiding four links.
 */
export function Header({ locale, translations, paletteEntries }: { locale: Locale; translations: Translations; paletteEntries: PaletteEntry[] }) {
  const pathname = usePathname() ?? '/';
  const currentPath = stripLocaleFromPath(pathname);
  const links = [
    { path: '/portfolio', label: translations.nav.portfolio },
    { path: '/articles', label: translations.nav.articles },
    { path: '/lab', label: translations.nav.lab },
    { path: '/cv', label: translations.nav.cv },
  ];

  return (
    <header data-site-header className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-x-8 gap-y-2 px-4 py-5 sm:px-8 sm:py-7">
      {/* The wordmark is a home path: ~/thomas-vignoli_ with a blinking cursor.
          Screen readers get the plain name; the cursor holds still under
          prefers-reduced-motion. */}
      <Link href={localizedPath(locale)} aria-label={AUTHOR_NAME} className="py-2 font-mono text-[17px] font-medium text-foreground sm:text-lg">
        <span aria-hidden>
          <span className="text-link">~/</span>thomas-vignoli
          <span className="animate-blink text-link motion-reduce:animate-none">_</span>
        </span>
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
        <CommandPalette
          entries={paletteEntries}
          t={translations.palette}
          otherLocaleHref={switchLocaleInPath(pathname, locale === 'en' ? 'it' : 'en')}
        />
        <ThemeToggle labels={translations.theme} />
      </nav>
    </header>
  );
}

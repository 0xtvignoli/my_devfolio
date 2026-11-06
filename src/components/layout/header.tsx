'use client';

import { useEffect, useRef } from 'react';
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

const MENU_ID = 'site-menu';

/**
 * From sm: one row, links always visible. Phones: a sticky 56 px bar with the
 * wordmark, search (the ⌘K palette, which has no keyboard there) and a Menu
 * that is a native popover: focus, Esc and tap-outside come from the browser.
 */
export function Header({ locale, translations, paletteEntries }: { locale: Locale; translations: Translations; paletteEntries: PaletteEntry[] }) {
  const pathname = usePathname() ?? '/';
  const currentPath = stripLocaleFromPath(pathname);
  const menu = useRef<HTMLDivElement>(null);
  const links = [
    { path: '/portfolio', label: translations.nav.portfolio },
    { path: '/articles', label: translations.nav.articles },
    { path: '/lab', label: translations.nav.lab },
    { path: '/cv', label: translations.nav.cv },
  ];
  const current = links.find((link) => isActivePath(currentPath, link.path));

  // Client navigation is not a tap outside: close the menu ourselves.
  useEffect(() => {
    menu.current?.hidePopover?.();
  }, [pathname]);

  const navLinks = (big: boolean) =>
    links.map((link) => {
      const active = link === current;
      return (
        <Link
          key={link.path}
          href={localizedPath(locale, link.path)}
          aria-current={active ? 'page' : undefined}
          className={cn(
            big
              ? 'flex min-h-[52px] items-center border-b border-border px-5 font-serif text-[22px]'
              : 'py-2.5 hover:text-foreground',
            active ? 'text-foreground underline underline-offset-[6px]' : big ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {link.label}
        </Link>
      );
    });

  return (
    <header
      data-site-header
      className="sticky top-0 z-40 border-b border-border bg-background sm:static sm:border-0 sm:bg-transparent"
    >
      <div className="mx-auto flex min-h-14 w-full max-w-[1120px] items-center justify-between gap-x-8 pl-4 pr-1 sm:flex-wrap sm:gap-y-2 sm:px-8 sm:py-7">
        {/* The wordmark is a home path: ~/thomas-vignoli_ with a blinking cursor.
            Screen readers get the plain name; the cursor holds still under
            prefers-reduced-motion. */}
        <Link href={localizedPath(locale)} aria-label={AUTHOR_NAME} className="py-2 font-mono text-[15px] font-medium text-foreground sm:text-lg">
          <span aria-hidden>
            <span className="text-link">~/</span>thomas-vignoli
            <span className="animate-blink text-link motion-reduce:animate-none">_</span>
          </span>
        </Link>
        <div className="flex items-center gap-x-6 text-[15px] sm:gap-x-7">
          <nav aria-label="Primary" className="hidden items-center gap-x-7 sm:flex">
            {navLinks(false)}
            <LocaleSwitcher locale={locale} />
          </nav>
          <span className="flex items-center">
            {current && <span className="mr-1 text-[13px] text-muted-foreground sm:hidden">{current.label}</span>}
            <CommandPalette
              entries={paletteEntries}
              t={translations.palette}
              otherLocaleHref={switchLocaleInPath(pathname, locale === 'en' ? 'it' : 'en')}
            />
            <button
              type="button"
              popoverTarget={MENU_ID}
              className="min-h-11 px-3 text-[15px] font-medium sm:hidden"
            >
              {translations.nav.menu}
            </button>
          </span>
          <span className="hidden sm:inline-flex">
            <ThemeToggle labels={translations.theme} />
          </span>
        </div>
      </div>
      <div
        id={MENU_ID}
        ref={menu}
        popover="auto"
        className="inset-x-2 bottom-auto top-[60px] m-0 w-auto border border-foreground bg-background p-0 text-foreground shadow-lg sm:hidden"
      >
        <nav aria-label="Primary">{navLinks(true)}</nav>
        <div className="flex min-h-14 items-center justify-between px-5 text-[15px]">
          <LocaleSwitcher locale={locale} />
          <ThemeToggle labels={translations.theme} />
        </div>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Locale, Translations } from '@/lib/types';
import { localizedPath, stripLocaleFromPath } from '@/lib/i18n/paths';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

interface HeaderProps {
  locale: Locale;
  translations: Translations;
}

function isActivePath(currentPath: string, itemPath: string): boolean {
  if (itemPath === '/') return currentPath === '/';
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

/** Terminal-style monospaced wordmark (block monogram + name). */
function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2 text-foreground">
      <span
        aria-hidden
        className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-[4px] border border-foreground text-[0.8125rem] font-bold leading-none"
      >
        ~$
      </span>
      <span className="text-base font-bold">devops-folio</span>
    </span>
  );
}

export function Header({ locale, translations }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname() ?? '/';
  const currentPath = stripLocaleFromPath(pathname);

  const navLinks = [
    { path: '/portfolio', label: translations.nav.portfolio },
    { path: '/experience', label: translations.nav.experience },
    { path: '/articles', label: translations.nav.articles },
    { path: '/lab', label: translations.nav.lab },
  ].map((link) => ({ ...link, href: localizedPath(locale, link.path) }));

  const homeHref = localizedPath(locale);

  return (
    <>
      <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        {/* Landscape on a notched phone puts the cutout on one side, and
            viewport-fit=cover means the bar now extends under it. */}
        <Toolbar
          sx={{
            minHeight: 56,
            pl: { xs: 'max(16px, env(safe-area-inset-left, 0px))', md: 'max(24px, env(safe-area-inset-left, 0px))' },
            pr: { xs: 'max(16px, env(safe-area-inset-right, 0px))', md: 'max(24px, env(safe-area-inset-right, 0px))' },
          }}
        >
          <Link href={homeHref} className="flex items-center mr-6 no-underline">
            <Wordmark />
          </Link>
          <Box component="nav" aria-label="Primary" sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
            {navLinks.map((link) => {
              const active = isActivePath(currentPath, link.path);
              return (
                <Link
                  key={link.path}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'inline-flex items-center min-h-[44px] px-3 py-2 text-[0.9375rem] font-medium no-underline border-b-2 transition-colors',
                    active
                      ? 'text-foreground border-foreground'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <LocaleSwitcher locale={locale} />
            <ThemeToggle labels={translations.theme} />
          </Box>
          <IconButton
            edge="end"
            aria-label="Open navigation menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { md: 'none' }, minWidth: 44, minHeight: 44 }}
          >
            <Menu size={24} aria-hidden />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              boxSizing: 'border-box',
              // Full-height surface: the bottom row (locale + theme) would sit
              // under the home indicator otherwise.
              pb: 'env(safe-area-inset-bottom, 0px)',
              pl: 'env(safe-area-inset-left, 0px)',
            },
          },
        }}
        aria-label="Navigation menu"
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Link href={homeHref} onClick={() => setDrawerOpen(false)} className="flex items-center mb-4 no-underline">
            <Wordmark />
          </Link>
          <Box component="nav" sx={{ flex: 1 }}>
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {navLinks.map((link) => {
                const active = isActivePath(currentPath, link.path);
                return (
                  <li key={link.path}>
                    <Link
                      href={link.href}
                      onClick={() => setDrawerOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 no-underline border-l-2 transition-colors',
                        active
                          ? 'text-foreground border-foreground font-bold'
                          : 'text-muted-foreground border-transparent font-medium hover:text-foreground'
                      )}
                    >
                      <span aria-hidden className="text-muted-foreground font-bold">
                        {active ? '[x]' : '[ ]'}
                      </span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </Box>
          </Box>
          <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, display: 'flex', gap: 1 }}>
            <LocaleSwitcher locale={locale} />
            <ThemeToggle labels={translations.theme} />
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

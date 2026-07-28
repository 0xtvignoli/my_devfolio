'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, FlaskConical, Mail } from 'lucide-react';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import type { Locale, Translations } from '@/lib/types';
import { localizedPath, stripLocaleFromPath } from '@/lib/i18n/paths';

interface MarketingBottomNavProps {
  locale: Locale;
  translations: Translations;
}

export function MarketingBottomNav({ locale, translations }: MarketingBottomNavProps) {
  const pathname = usePathname() ?? '/';
  const currentPath = stripLocaleFromPath(pathname);

  const items = [
    { path: '/', label: translations.mobileNav.home, icon: Home },
    { path: '/portfolio', label: translations.mobileNav.portfolio, icon: LayoutGrid },
    { path: '/lab', label: translations.nav.lab, icon: FlaskConical, highlight: true },
    { path: '/#contact', label: translations.mobileNav.contact, icon: Mail },
  ];

  const activeIndex = items.findIndex((item) =>
    item.path === '/'
      ? currentPath === '/'
      : item.path.startsWith('/#')
        ? false
        : currentPath === item.path || currentPath.startsWith(`${item.path}/`)
  );

  return (
    <Paper
      component="nav"
      aria-label={translations.mobileNav.ariaLabel}
      elevation={0}
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: 1,
        borderColor: 'divider',
        pb: 'env(safe-area-inset-bottom, 0px)',
        // Landscape: the cutout is on a side, and the bar spans edge to edge.
        pl: 'env(safe-area-inset-left, 0px)',
        pr: 'env(safe-area-inset-right, 0px)',
        bgcolor: 'background.default',
        boxShadow: 'none',
      }}
    >
      <BottomNavigation
        showLabels
        value={activeIndex >= 0 ? activeIndex : 0}
        sx={{
          height: 64,
          bgcolor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 56,
            minHeight: 48,
            color: 'text.secondary',
            '&.Mui-selected': { color: 'primary.main' },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            fontWeight: 500,
          },
        }}
      >
        {items.map((item) => {
          const href = item.path.startsWith('/#')
            ? `${localizedPath(locale)}${item.path.slice(1)}`
            : localizedPath(locale, item.path);
          const Icon = item.icon;
          return (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={
                <Icon
                  size={22}
                  aria-hidden
                  style={item.highlight ? { color: 'var(--accent-primary)' } : undefined}
                />
              }
              component={Link}
              href={href}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
}

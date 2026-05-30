'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Code2, LayoutGrid, Briefcase, BookOpen, FlaskConical, Menu } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Locale, Translations } from '@/lib/types';
import { localizedPath, stripLocaleFromPath } from '@/lib/i18n/paths';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

interface HeaderProps {
  locale: Locale;
  translations: Translations;
}

function isActivePath(currentPath: string, itemPath: string): boolean {
  if (itemPath === '/') return currentPath === '/';
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

export function Header({ locale, translations }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname() ?? '/';
  const currentPath = stripLocaleFromPath(pathname);

  const navLinks = [
    { path: '/portfolio', label: translations.nav.portfolio, icon: LayoutGrid },
    { path: '/experience', label: translations.nav.experience, icon: Briefcase },
    { path: '/articles', label: translations.nav.articles, icon: BookOpen },
    { path: '/lab', label: translations.nav.lab, icon: FlaskConical },
  ].map((link) => ({ ...link, href: localizedPath(locale, link.path) }));

  const homeHref = localizedPath(locale);

  const linkSx = (active: boolean) => ({
    textDecoration: 'none',
    color: 'inherit',
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 500,
    opacity: active ? 1 : 0.75,
    position: 'relative' as const,
    px: 1.5,
    py: 0.75,
    borderRadius: 1,
    bgcolor: active ? 'action.selected' : 'transparent',
    transition: 'opacity 0.2s, background-color 0.2s',
    '&:hover': { opacity: 1 },
  });

  return (
    <>
      <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 } }}>
          <Link href={homeHref} style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 24, textDecoration: 'none', color: 'inherit' }}>
            <Code2 style={{ height: 24, width: 24 }} aria-hidden />
            <Typography variant="h6" component="span" sx={{ fontWeight: 700, fontFamily: 'var(--font-headline), system-ui, sans-serif' }}>
              DevOps Folio
            </Typography>
          </Link>
          <Box component="nav" aria-label="Primary" sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
            {navLinks.map((link) => {
              const active = isActivePath(currentPath, link.path);
              return (
                <Link key={link.path} href={link.href} style={linkSx(active)} aria-current={active ? 'page' : undefined}>
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
        slotProps={{ paper: { sx: { width: 280, boxSizing: 'border-box' } } }}
        aria-label="Navigation menu"
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Link href={homeHref} onClick={() => setDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, textDecoration: 'none', color: 'inherit' }}>
            <Code2 style={{ height: 24, width: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'var(--font-headline), system-ui, sans-serif' }}>
              DevOps Folio
            </Typography>
          </Link>
          <Box component="nav" sx={{ flex: 1 }}>
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {navLinks.map((link) => {
                const active = isActivePath(currentPath, link.path);
                return (
                  <li key={link.path}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href={link.href}
                        onClick={() => setDrawerOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 12,
                          borderRadius: 8,
                          textDecoration: 'none',
                          color: 'inherit',
                          opacity: active ? 1 : 0.9,
                          fontWeight: active ? 600 : 500,
                          background: active ? 'rgba(0, 217, 255, 0.08)' : 'transparent',
                        }}
                      >
                        <link.icon style={{ width: 20, height: 20 }} aria-hidden />
                        <Typography component="span" sx={{ fontWeight: 'inherit' }}>
                          {link.label}
                        </Typography>
                      </Link>
                    </motion.div>
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

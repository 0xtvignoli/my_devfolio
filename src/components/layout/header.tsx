'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Code2, LayoutGrid, Briefcase, BookOpen, FlaskConical, Trophy, Menu } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Locale, Translations } from '@/lib/types';
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

export function Header({ locale, translations }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: translations.nav.dashboard, icon: Trophy },
    { href: '/portfolio', label: translations.nav.portfolio, icon: LayoutGrid },
    { href: '/experience', label: translations.nav.experience, icon: Briefcase },
    { href: '/articles', label: translations.nav.articles, icon: BookOpen },
    { href: '/lab', label: translations.nav.lab, icon: FlaskConical },
  ];

  return (
    <>
      <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 } }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 24, textDecoration: 'none', color: 'inherit' }}>
            <Code2 style={{ height: 24, width: 24 }} aria-hidden />
            <Typography variant="h6" component="span" fontWeight={700} sx={{ fontFamily: 'var(--font-headline), system-ui, sans-serif' }}>
              DevOps Folio
            </Typography>
          </Link>
          <Box component="nav" sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ textDecoration: 'none', color: 'inherit', opacity: 0.8, fontSize: '0.875rem', fontWeight: 500 }}
                className="nav-link"
              >
                <Box component="span" sx={{ '&:hover': { opacity: 1 } }}>
                  {link.label}
                </Box>
              </Link>
            ))}
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
        PaperProps={{
          sx: { width: 280, boxSizing: 'border-box' },
        }}
        aria-label="Navigation menu"
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Link href="/" onClick={() => setDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, textDecoration: 'none', color: 'inherit' }}>
            <Code2 style={{ height: 24, width: 24 }} />
            <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'var(--font-headline), system-ui, sans-serif' }}>
              DevOps Folio
            </Typography>
          </Link>
          <Box component="nav" sx={{ flex: 1 }}>
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href={link.href}
                      onClick={() => setDrawerOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: 12,
                        borderRadius: 8,
                        textDecoration: 'none',
                        color: 'inherit',
                        opacity: 0.9,
                      }}
                    >
                      <link.icon style={{ width: 20, height: 20 }} aria-hidden />
                      <Typography component="span" fontWeight={500}>
                        {link.label}
                      </Typography>
                    </Link>
                  </motion.div>
                </li>
              ))}
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

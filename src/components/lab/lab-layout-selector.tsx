'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { LabClientPage } from '@/components/lab/lab-client-page';
import { ImmersiveLabLayout } from '@/components/lab/immersive-lab-layout';
import { LabPageSkeleton } from '@/components/lab/lab-page-skeleton';
import { LayoutGrid, Maximize2, Trophy } from 'lucide-react';
import { localizedPath } from '@/lib/i18n/paths';
import { trackLabLayoutSwitch, trackLabView } from '@/lib/lab-telemetry';
import type { CiRun } from '@/lib/ci-status';
import type { Locale, Translations } from '@/lib/types';

interface LabLayoutSelectorProps {
  locale: Locale;
  translations: Translations;
  ciRuns: CiRun[];
}

export type LayoutType = 'standard' | 'immersive';

const LAYOUTS: { id: LayoutType; labelKey: 'standard' | 'immersive'; hintKey: 'standardHint' | 'immersiveHint'; icon: typeof LayoutGrid }[] = [
  { id: 'standard', labelKey: 'standard', hintKey: 'standardHint', icon: LayoutGrid },
  { id: 'immersive', labelKey: 'immersive', hintKey: 'immersiveHint', icon: Maximize2 },
];

export function LabLayoutSelector({ locale, translations, ciRuns }: LabLayoutSelectorProps) {
  const t = translations.lab.layout;
  const [layout, setLayout] = useState<LayoutType>('standard');
  const [isClient, setIsClient] = useState(false);
  const isCompact = useMediaQuery('(max-width:899.95px)');

  useEffect(() => {
    const saved = localStorage.getItem('lab-layout-preference') as string | null;
    let initial: LayoutType = 'standard';
    if (saved === 'geek') {
      localStorage.setItem('lab-layout-preference', 'immersive');
      initial = 'immersive';
    } else if (saved === 'standard' || saved === 'immersive') {
      initial = saved;
    }
    setLayout(initial);
    setIsClient(true);
    trackLabView(initial);
  }, []);

  // Immersive is a desktop TUI: three nested scroll panes don't fit a 664px
  // screen, and its only exit is Escape, which needs a keyboard. Compact falls
  // back to standard — the stored preference is left alone, so a wider window
  // still restores it.
  useEffect(() => {
    if (isCompact) setLayout('standard');
  }, [isCompact]);

  const applyLayout = useCallback((newLayout: LayoutType) => {
    setLayout(newLayout);
    localStorage.setItem('lab-layout-preference', newLayout);
    trackLabLayoutSwitch(newLayout);
  }, []);

  const handleLayoutChange = (_: React.MouseEvent<HTMLElement>, newLayout: LayoutType | null) => {
    if (!newLayout) return;
    applyLayout(newLayout);
  };

  // Fullscreen immersive mode: hide site chrome, lock scroll, exit with Escape.
  useEffect(() => {
    if (!isClient || layout !== 'immersive') return;
    document.body.classList.add('lab-immersive-active');
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Let open dialogs/tour consume Escape first.
      if (document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]')) return;
      applyLayout('standard');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('lab-immersive-active');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isClient, layout, applyLayout]);

  if (!isClient) {
    return <LabPageSkeleton />;
  }

  return (
    <Box className="lab-md3-theme" sx={{ position: 'relative' }} suppressHydrationWarning>
      <Paper
        elevation={0}
        role="radiogroup"
        aria-label={t.ariaLabel}
        sx={{
          // Compact: in flow above the hero instead of a panel permanently
          // floating over the breadcrumb and every card below it.
          position: layout === 'immersive' ? 'fixed' : { xs: 'static', md: 'fixed' },
          top: layout === 'immersive' ? { xs: 8, md: 10 } : { md: 80 },
          right: layout === 'immersive' ? { xs: 12, md: 16 } : { md: 16 },
          width: 'fit-content',
          ml: 'auto',
          mr: { xs: layout === 'immersive' ? 0 : 2, md: 0 },
          mt: { xs: layout === 'immersive' ? 0 : 1, md: 0 },
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          borderRadius: 'var(--lab-radius-lg)',
          bgcolor: 'var(--md-sys-color-surface-container-highest)',
          border: '1px solid var(--md-sys-color-outline-variant)',
          boxShadow: 'var(--lab-elevation-2)',
        }}
        suppressHydrationWarning
      >
        <Box
          component={Link}
          href={localizedPath(locale, '/dashboard')}
          sx={{
            display: layout === 'immersive' ? 'none' : 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: 'var(--lab-radius-md)',
            color: 'var(--md-sys-color-on-surface-variant)',
            textDecoration: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            minHeight: 44,
            '&:hover': { bgcolor: 'var(--md-sys-color-surface-container-high)', color: 'var(--md-sys-color-on-surface)' },
          }}
          title={translations.nav.missionProgress}
        >
          <Trophy size={16} aria-hidden />
          <Typography component="span" variant="body2" sx={{ display: { xs: 'none', md: 'inline' }, fontWeight: 600 }}>
            {translations.nav.missionProgress}
          </Typography>
        </Box>

        <Box sx={{ width: 1, height: 28, bgcolor: 'var(--md-sys-color-outline-variant)', display: layout === 'immersive' ? 'none' : { xs: 'none', sm: 'block' } }} />

        <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 600, display: layout === 'immersive' ? 'none' : { xs: 'none', sm: 'block' }, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {t.label}
        </Typography>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={layout}
          onChange={handleLayoutChange}
          aria-labelledby="lab-layout-label"
          sx={{ display: isCompact ? 'none' : 'flex' }}
        >
          {LAYOUTS.map(({ id, labelKey, hintKey, icon: Icon }) => (
            <ToggleButton
              key={id}
              value={id}
              aria-label={`${t[labelKey]}: ${t[hintKey]}`}
              title={t[hintKey]}
              sx={{
                px: { xs: 1, sm: 1.5 },
                minHeight: 44,
                minWidth: 44,
                gap: 0.75,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'var(--md-sys-color-outline-variant) !important',
                color: 'var(--md-sys-color-on-surface-variant)',
                '&.Mui-selected': {
                  bgcolor: 'var(--md-sys-color-primary-container) !important',
                  color: 'var(--md-sys-color-on-primary-container) !important',
                },
              }}
            >
              <Icon size={16} aria-hidden />
              <Typography component="span" variant="caption" sx={{ display: layout === 'immersive' ? 'none' : { xs: 'none', sm: 'inline' }, fontWeight: 600 }}>
                {t[labelKey]}
              </Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>

      {layout === 'standard' && <LabClientPage locale={locale} translations={translations} ciRuns={ciRuns} />}
      {layout === 'immersive' && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            bgcolor: 'var(--md-sys-color-surface)',
          }}
          aria-hidden="false"
        >
          <ImmersiveLabLayout locale={locale} translations={translations} />
        </Box>
      )}
    </Box>
  );
}

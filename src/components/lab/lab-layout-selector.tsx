'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { LabClientPage } from '@/components/lab/lab-client-page';
import { ImmersiveLabLayout } from '@/components/lab/immersive-lab-layout';
import { LabPageSkeleton } from '@/components/lab/lab-page-skeleton';
import { LayoutGrid, Maximize2, Trophy } from 'lucide-react';
import { localizedPath } from '@/lib/i18n/paths';
import type { Locale, Translations } from '@/lib/types';

interface LabLayoutSelectorProps {
  locale: Locale;
  translations: Translations;
}

export type LayoutType = 'standard' | 'immersive';

const LAYOUTS: { id: LayoutType; labelKey: 'standard' | 'immersive'; hintKey: 'standardHint' | 'immersiveHint'; icon: typeof LayoutGrid }[] = [
  { id: 'standard', labelKey: 'standard', hintKey: 'standardHint', icon: LayoutGrid },
  { id: 'immersive', labelKey: 'immersive', hintKey: 'immersiveHint', icon: Maximize2 },
];

export function LabLayoutSelector({ locale, translations }: LabLayoutSelectorProps) {
  const t = translations.lab.layout;
  const [layout, setLayout] = useState<LayoutType>('standard');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lab-layout-preference') as string | null;
    if (saved === 'geek') {
      localStorage.setItem('lab-layout-preference', 'immersive');
      setLayout('immersive');
    } else if (saved === 'standard' || saved === 'immersive') {
      setLayout(saved);
    }
    setIsClient(true);
  }, []);

  const handleLayoutChange = (_: React.MouseEvent<HTMLElement>, newLayout: LayoutType | null) => {
    if (!newLayout) return;
    setLayout(newLayout);
    localStorage.setItem('lab-layout-preference', newLayout);
  };

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
          position: 'fixed',
          top: { xs: 72, md: 80 },
          right: { xs: 12, md: 16 },
          zIndex: 50,
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
            display: 'inline-flex',
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

        <Box sx={{ width: 1, height: 28, bgcolor: 'var(--md-sys-color-outline-variant)', display: { xs: 'none', sm: 'block' } }} />

        <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 600, display: { xs: 'none', sm: 'block' }, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {t.label}
        </Typography>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={layout}
          onChange={handleLayoutChange}
          aria-labelledby="lab-layout-label"
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
              <Typography component="span" variant="caption" sx={{ display: { xs: 'none', sm: 'inline' }, fontWeight: 600 }}>
                {t[labelKey]}
              </Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>

      {layout === 'standard' && <LabClientPage locale={locale} translations={translations} />}
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

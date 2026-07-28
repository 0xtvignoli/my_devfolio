'use client';

import Link from 'next/link';
import { Terminal } from 'lucide-react';
import { HeroCTAButton } from '@/components/shared/hero-cta-button';
import { LabPreviewPanel } from '@/components/hero/lab-preview-panel';
import type { Locale } from '@/lib/types';
import { localizedPath } from '@/lib/i18n/paths';
import Box from '@mui/material/Box';

interface EnhancedHeroProps {
  locale: Locale;
  title: string;
  subtitle: string;
  badge: string;
  ctaPortfolio: string;
  ctaLab: string;
  ctaContact: string;
  labPreviewTitle: string;
  labPreviewSubtitle: string;
}

export function EnhancedHero({
  locale,
  title,
  subtitle,
  badge,
  ctaPortfolio,
  ctaLab,
  ctaContact,
  labPreviewTitle,
  labPreviewSubtitle,
}: EnhancedHeroProps) {
  return (
    <Box component="section" id="hero" sx={{ py: { xs: 6, md: 10 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: { xs: 4, lg: 6 },
          alignItems: 'center',
        }}
      >
        <Box sx={{ textAlign: 'left' }}>
          {/* Bracketed status badge */}
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '4px',
              px: 1.25,
              py: 0.25,
              mb: 3,
              fontSize: '0.875rem',
              color: 'text.secondary',
            }}
          >
            <Box component="span" aria-hidden sx={{ color: 'text.primary', fontWeight: 700 }}>[+]</Box>
            {badge}
          </Box>

          <Box
            component="h1"
            sx={{
              m: 0,
              mb: 3,
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.375rem' },
              lineHeight: 1.5,
              letterSpacing: 0,
              color: 'text.primary',
            }}
          >
            {title}
          </Box>

          <Box
            component="p"
            sx={{
              m: 0,
              mb: 5,
              maxWidth: '46ch',
              fontSize: '1rem',
              lineHeight: 1.5,
              color: 'text.secondary',
            }}
          >
            {subtitle}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' } }}>
            <HeroCTAButton href={localizedPath(locale, '/portfolio')} variant="primary">
              {ctaPortfolio}
            </HeroCTAButton>
            <HeroCTAButton href={localizedPath(locale, '/lab')} variant="secondary" icon={Terminal}>
              {ctaLab}
            </HeroCTAButton>
            <HeroCTAButton href="#contact" variant="outline">
              {ctaContact}
            </HeroCTAButton>
          </Box>
        </Box>

        <Box>
          <Link
            href={`${localizedPath(locale, '/lab')}?cmd=${encodeURIComponent('kubectl get pods')}`}
            aria-label={ctaLab}
            className="block no-underline"
          >
            <LabPreviewPanel title={labPreviewTitle} subtitle={labPreviewSubtitle} />
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

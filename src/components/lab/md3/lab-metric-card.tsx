'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Info } from 'lucide-react';
import type { ReactNode } from 'react';

type LabMetricCardProps = {
  label: string;
  value: ReactNode;
  subtitle?: string;
  hint?: string;
  accentColor?: string;
  chart: ReactNode;
  'aria-label'?: string;
};

export function LabMetricCard({
  label,
  value,
  subtitle,
  hint,
  chart,
  'aria-label': ariaLabel,
}: LabMetricCardProps) {
  return (
    <Box
      className="lab-md3-metric-tonal"
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        // Grid items default to min-width:auto — two per row at 320px pushed the
        // track 3px past the viewport rather than shrinking.
        minWidth: 0,
        transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: 'var(--lab-elevation-2)' },
      }}
      aria-label={ariaLabel}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </Typography>
        {hint ? (
          <Tooltip title={hint} arrow placement="top">
            <IconButton size="small" aria-label={`About ${label}`} sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              <Info size={16} />
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>
      <Typography
        variant="h5"
        component="div"
        suppressHydrationWarning
        sx={{
          color: 'var(--md-sys-color-on-surface)',
          fontWeight: 700,
          lineHeight: 1.2,
          // Two cards per row on compact leaves ~140px: "13.4 / 32 GB" needs to fit.
          fontSize: { xs: '1.0625rem', md: '1.5rem' },
        }}
      >
        {value}
      </Typography>
      {subtitle ? (
        <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          {subtitle}
        </Typography>
      ) : null}
      <Box sx={{ flex: 1, minHeight: 80, mt: 0.5, mx: -1 }}>{chart}</Box>
    </Box>
  );
}

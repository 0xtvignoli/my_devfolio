'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Circle } from 'lucide-react';
import type { ReactNode } from 'react';

type LabHeroHeaderProps = {
  title: string;
  subtitle: string;
  liveLabel: string;
  actions?: ReactNode;
  stats: { label: string; value: ReactNode; accent?: string }[];
};

export function LabHeroHeader({ title, subtitle, liveLabel, actions, stats }: LabHeroHeaderProps) {
  return (
    <Box
      className="lab-md3-surface"
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 'var(--lab-radius-xl)',
        bgcolor: 'var(--md-sys-color-surface-container-low)',
        backgroundImage: 'none',
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
            <Chip
              size="small"
              icon={
                <Circle
                  size={8}
                  fill="currentColor"
                  style={{ color: 'var(--md-sys-color-tertiary)', animation: 'pulse 2s infinite' }}
                />
              }
              label={liveLabel}
              sx={{
                bgcolor: 'var(--md-sys-color-tertiary-container)',
                color: 'var(--md-sys-color-on-surface)',
                fontWeight: 600,
                '& .MuiChip-icon': { ml: 0.5 },
              }}
            />
            {actions}
          </Stack>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            <Box component="span" aria-hidden sx={{ color: 'var(--md-sys-color-on-surface-variant)', mr: 1 }}>
              #
            </Box>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--md-sys-color-on-surface-variant)', maxWidth: 720 }}>
            {subtitle}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} role="group" aria-label="Live metrics" sx={{ flexWrap: 'wrap' }}>
          {stats.map((stat) => (
            <Box
              key={stat.label}
              sx={{
                px: 2,
                py: 1.25,
                borderRadius: 'var(--lab-radius-md)',
                bgcolor: 'var(--md-sys-color-surface-container-highest)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                minWidth: 100,
              }}
            >
              <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)', display: 'block' }}>
                {stat.label}
              </Typography>
              <Typography
                variant="subtitle1"
                suppressHydrationWarning
                sx={{ color: 'var(--md-sys-color-on-surface)', fontWeight: 700 }}
              >
                {stat.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

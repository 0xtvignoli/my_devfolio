'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type LabSectionCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  id?: string;
  action?: ReactNode;
  noPadding?: boolean;
};

export function LabSectionCard({ title, subtitle, children, id, action, noPadding }: LabSectionCardProps) {
  return (
    <Box
      component="section"
      id={id}
      className="lab-md3-surface"
      sx={{ overflow: 'hidden' }}
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          px: 2.5,
          py: 2,
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          bgcolor: 'var(--md-sys-color-surface-container-lowest)',
        }}
      >
        <Box>
          <Typography id={id ? `${id}-heading` : undefined} variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" sx={{ color: 'var(--md-sys-color-on-surface-variant)', mt: 0.25 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {action}
      </Box>
      <Box sx={{ p: noPadding ? 0 : 2.5 }}>{children}</Box>
    </Box>
  );
}

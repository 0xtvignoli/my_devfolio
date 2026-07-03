'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface LabEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  hint?: ReactNode;
}

/** Inline code chip used inside empty-state hints (e.g. suggested commands). */
export function LabCodeHint({ children }: { children: ReactNode }) {
  return (
    <Box
      component="code"
      sx={{
        px: 0.75,
        py: 0.25,
        borderRadius: 1,
        fontFamily: 'var(--font-family-mono), monospace',
        fontSize: '0.75rem',
        bgcolor: 'var(--md-sys-color-surface-container-high)',
        color: 'var(--md-sys-color-primary)',
      }}
    >
      {children}
    </Box>
  );
}

export function LabEmptyState({ icon: Icon, title, description, hint }: LabEmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1,
        py: 6,
        px: 2,
        color: 'var(--md-sys-color-on-surface-variant)',
      }}
    >
      <Icon size={40} strokeWidth={1.5} aria-hidden style={{ opacity: 0.5 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
        {title}
      </Typography>
      <Typography variant="body2">{description}</Typography>
      {hint ? (
        <Typography variant="caption" sx={{ mt: 0.5, color: 'var(--md-sys-color-on-surface-variant)' }}>
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}

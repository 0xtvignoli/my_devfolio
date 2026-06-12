'use client';

import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

interface LabChartShellProps {
  children: ReactNode;
  compact?: boolean;
  'aria-label'?: string;
}

/** Fixed-height wrapper that gives lab charts a consistent MD3 frame. */
export function LabChartShell({ children, compact = false, ...aria }: LabChartShellProps) {
  return (
    <Box
      role="img"
      aria-label={aria['aria-label']}
      sx={{
        width: '100%',
        height: compact ? 72 : 200,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

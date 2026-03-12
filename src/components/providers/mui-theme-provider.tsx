'use client';

import { useTheme } from 'next-themes';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useMemo } from 'react';
import { createAppTheme } from '@/lib/mui-theme';

export function MuiThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const mode = (resolvedTheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}

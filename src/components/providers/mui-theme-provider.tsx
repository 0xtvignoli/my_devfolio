'use client';

import { useTheme } from 'next-themes';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { createAppTheme } from '@/lib/mui-theme';

const DEFAULT_MODE = 'dark' as const;

export function MuiThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mode = useMemo(() => {
    if (!mounted) return DEFAULT_MODE;
    return resolvedTheme === 'dark' ? 'dark' : 'light';
  }, [mounted, resolvedTheme]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}

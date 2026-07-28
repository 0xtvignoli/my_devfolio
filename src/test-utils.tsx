import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const emotionCache = createCache({ key: 'test' });

export function MuiTestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
    </CacheProvider>
  );
}

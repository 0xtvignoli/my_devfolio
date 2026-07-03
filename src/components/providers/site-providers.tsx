"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MuiThemeProviderWrapper } from "@/components/providers/mui-theme-provider";
import { SnackbarProvider } from "@/contexts/snackbar-context";
import { WebVitalsTracker } from "@/components/analytics/web-vitals";
import { SkipLink } from "@/components/shared/skip-link";

interface SiteProvidersProps {
  children: ReactNode;
  skipLabel?: string;
}

export function SiteProviders({ children, skipLabel }: SiteProvidersProps) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <MuiThemeProviderWrapper>
          <SnackbarProvider>
            <MotionConfig reducedMotion="user">
              {skipLabel ? <SkipLink label={skipLabel} /> : null}
              <WebVitalsTracker />
              {children}
            </MotionConfig>
          </SnackbarProvider>
        </MuiThemeProviderWrapper>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

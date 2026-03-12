"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MuiThemeProviderWrapper } from "@/components/providers/mui-theme-provider";
import { SnackbarProvider } from "@/contexts/snackbar-context";
import { GamificationProvider } from "@/contexts/gamification-context";
import { WebVitalsTracker } from "@/components/analytics/web-vitals";
import { SkipLink } from "@/components/shared/skip-link";

interface SiteProvidersProps {
  children: ReactNode;
  skipLabel?: string;
}

export function SiteProviders({ children, skipLabel }: SiteProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <MuiThemeProviderWrapper>
        <SnackbarProvider>
          <GamificationProvider>
            {skipLabel ? <SkipLink label={skipLabel} /> : null}
            <WebVitalsTracker />
            {children}
          </GamificationProvider>
        </SnackbarProvider>
      </MuiThemeProviderWrapper>
    </ThemeProvider>
  );
}

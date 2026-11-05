"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WebVitalsTracker } from "@/components/analytics/web-vitals";
import { SkipLink } from "@/components/shared/skip-link";

interface SiteProvidersProps {
  children: ReactNode;
  skipLabel?: string;
}

export function SiteProviders({ children, skipLabel }: SiteProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {skipLabel ? <SkipLink label={skipLabel} /> : null}
      <WebVitalsTracker />
      {children}
    </ThemeProvider>
  );
}

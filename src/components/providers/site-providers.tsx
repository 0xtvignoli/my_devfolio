"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { GamificationProvider } from "@/contexts/gamification-context";
import { WebVitalsTracker } from "@/components/analytics/web-vitals";

interface SiteProvidersProps {
  children: ReactNode;
}

export function SiteProviders({ children }: SiteProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <GamificationProvider>
        <WebVitalsTracker />
        {children}
        <Toaster />
      </GamificationProvider>
    </ThemeProvider>
  );
}

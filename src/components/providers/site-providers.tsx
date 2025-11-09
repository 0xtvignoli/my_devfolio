"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { GamificationProvider } from "@/contexts/gamification-context";

interface SiteProvidersProps {
  children: ReactNode;
}

export function SiteProviders({ children }: SiteProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <GamificationProvider>
        {children}
        <Toaster />
      </GamificationProvider>
    </ThemeProvider>
  );
}

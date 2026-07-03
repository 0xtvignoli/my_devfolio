"use client";

import type { ReactNode } from "react";
import { LabSimulationProvider } from "@/contexts/lab-simulation-context";
import { GamificationProvider } from "@/contexts/gamification-context";

interface LabProvidersProps {
  children: ReactNode;
}

export function LabProviders({ children }: LabProvidersProps) {
  return (
    <GamificationProvider>
      <LabSimulationProvider>{children}</LabSimulationProvider>
    </GamificationProvider>
  );
}

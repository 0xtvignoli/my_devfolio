"use client";

import type { ReactNode } from "react";
import { LabSimulationProvider } from "@/contexts/lab-simulation-context";

interface LabProvidersProps {
  children: ReactNode;
}

export function LabProviders({ children }: LabProvidersProps) {
  return <LabSimulationProvider>{children}</LabSimulationProvider>;
}

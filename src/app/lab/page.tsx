'use client';

import { LabSimulationProvider } from '@/contexts/lab-simulation-context';
import { LabClientPage } from '@/components/lab/lab-client-page';
import { AuroraBackground } from '@/components/backgrounds/aurora';
import { GridBackground } from '@/components/backgrounds/grid';

export default function LabPage() {
  return (
    <div className="relative">
      <AuroraBackground />
      <GridBackground />
      <LabSimulationProvider>
        <LabClientPage />
      </LabSimulationProvider>
    </div>
  );
}

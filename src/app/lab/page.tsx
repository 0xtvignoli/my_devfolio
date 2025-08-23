'use client';

import { LabSimulationProvider } from '@/contexts/lab-simulation-context';
import { LabClientPage } from '@/components/lab/lab-client-page';

export default function LabPage() {
  return (
    <LabSimulationProvider>
      <LabClientPage />
    </LabSimulationProvider>
  );
}

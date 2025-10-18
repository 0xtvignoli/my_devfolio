'use client';

import { LabSimulationProvider } from '@/contexts/lab-simulation-context';
import { ImmersiveLabLayout } from '@/components/lab/immersive-lab-layout';

export default function LabPage() {
  return (
    <LabSimulationProvider>
      <ImmersiveLabLayout />
    </LabSimulationProvider>
  );
}

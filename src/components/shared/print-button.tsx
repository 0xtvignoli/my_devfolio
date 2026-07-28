'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui-mui';

/** Print / save-as-PDF. The browser's own dialog beats shipping a PDF generator. */
export function PrintButton({ label }: { label: string }) {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()} startIcon={<Printer size={14} />}>
      {label}
    </Button>
  );
}

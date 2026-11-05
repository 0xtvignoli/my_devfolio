'use client';

import { Printer } from 'lucide-react';

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center gap-2 border border-foreground px-4 text-sm font-medium hover:bg-foreground hover:text-background"
    >
      <Printer size={14} aria-hidden />
      {label}
    </button>
  );
}

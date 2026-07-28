'use client';

import { FileQuestion } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/**
 * Stato vuoto riutilizzabile: nessun risultato, lista vuota, nessun dato.
 * Opzionale: icona custom, azione (es. bottone "Torna indietro" o CTA).
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="mb-4 text-muted-foreground" aria-hidden="true">
        {icon ?? <FileQuestion className="h-12 w-12" />}
      </div>
      <h2 className="font-headline text-lg font-semibold text-foreground">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

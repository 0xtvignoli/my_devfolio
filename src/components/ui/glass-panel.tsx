'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stronger opacity (uses --glass-bg-strong when true) */
  strong?: boolean;
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, strong, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('glass-panel rounded-2xl', strong && 'bg-[var(--glass-bg-strong)]', className)}
      style={style}
      {...props}
    />
  )
);
GlassPanel.displayName = 'GlassPanel';

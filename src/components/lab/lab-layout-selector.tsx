'use client';

import { useState, useEffect } from 'react';
import { LabClientPage } from '@/components/lab/lab-client-page';
import { ImmersiveLabLayout } from '@/components/lab/immersive-lab-layout';
import Link from 'next/link';
import { LayoutGrid, Terminal, Trophy } from 'lucide-react';
import { LabPageSkeleton } from '@/components/lab/lab-page-skeleton';
import { cn } from '@/lib/utils';
import { localizedPath } from '@/lib/i18n/paths';
import type { Locale, Translations } from '@/lib/types';

interface LabLayoutSelectorProps {
  locale: Locale;
  translations: Translations;
}

export type LayoutType = 'standard' | 'immersive';

const LAYOUTS: { id: LayoutType; label: string; icon: typeof LayoutGrid; title: string }[] = [
  { id: 'standard', label: 'Standard', icon: LayoutGrid, title: 'Mission console – cards and sections' },
  { id: 'immersive', label: 'Immersive', icon: Terminal, title: 'Tiled terminal – cluster, pipeline, status line' },
];

export function LabLayoutSelector({ locale, translations }: LabLayoutSelectorProps) {
  const [layout, setLayout] = useState<LayoutType>('standard');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lab-layout-preference') as string | null;
    if (saved === 'geek') {
      localStorage.setItem('lab-layout-preference', 'immersive');
      setLayout('immersive');
    } else if (saved === 'standard' || saved === 'immersive') {
      setLayout(saved);
    }
    setIsClient(true);
  }, []);

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    localStorage.setItem('lab-layout-preference', newLayout);
  };

  if (!isClient) {
    return <LabPageSkeleton />;
  }

  return (
    <div className="relative" suppressHydrationWarning>
      <div
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-[var(--radius)] pl-2 pr-2 py-2 shadow-lg"
        role="radiogroup"
        aria-label="Layout selection"
        suppressHydrationWarning
      >
        <Link
          href={localizedPath(locale, '/dashboard')}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title={translations.nav.missionProgress}
        >
          <Trophy className="h-4 w-4 shrink-0" aria-hidden />
          <span className="hidden md:inline">{translations.nav.missionProgress}</span>
        </Link>
        <span className="w-px h-6 bg-border hidden sm:block" aria-hidden />
        <span id="lab-layout-label" className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:inline">
          Layout
        </span>
        <div className="flex gap-1" role="none">
          {LAYOUTS.map(({ id, label, icon: Icon, title }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleLayoutChange(id)}
              className={cn(
                'inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] sm:min-w-0 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                layout === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
              role="radio"
              aria-checked={layout === id}
              aria-label={`${label} layout: ${title}`}
              title={title}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {layout === 'standard' && <LabClientPage locale={locale} translations={translations} />}
      {layout === 'immersive' && (
        <div className="fixed inset-0 z-40 bg-[#0d1117] lab-immersive-theme" aria-hidden="false">
          <ImmersiveLabLayout locale={locale} translations={translations} />
        </div>
      )}
    </div>
  );
}

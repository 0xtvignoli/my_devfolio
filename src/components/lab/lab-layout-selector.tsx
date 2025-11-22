'use client';

import { useState, useEffect } from 'react';
import { LabClientPage } from '@/components/lab/lab-client-page';
import { ImmersiveLabLayout } from '@/components/lab/immersive-lab-layout';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Locale, Translations } from '@/lib/types';

interface LabLayoutSelectorProps {
  locale: Locale;
  translations: Translations;
}

type LayoutType = 'standard' | 'immersive';

export function LabLayoutSelector({ locale, translations }: LabLayoutSelectorProps) {
  const [layout, setLayout] = useState<LayoutType>('standard');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load saved preference from localStorage
    const savedLayout = localStorage.getItem('lab-layout-preference') as LayoutType | null;
    if (savedLayout === 'standard' || savedLayout === 'immersive') {
      setLayout(savedLayout);
    }
  }, []);

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    localStorage.setItem('lab-layout-preference', newLayout);
  };

  if (!isClient) {
    return <LabClientPage locale={locale} translations={translations} />;
  }

  return (
    <div className="relative">
      {/* Layout Toggle - Fixed top right */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg p-1 shadow-lg">
        <Button
          variant={layout === 'standard' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLayoutChange('standard')}
          className={cn(
            "gap-2",
            layout === 'standard' && "bg-primary text-primary-foreground"
          )}
          aria-label="Switch to standard layout"
        >
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Standard</span>
        </Button>
        <Button
          variant={layout === 'immersive' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLayoutChange('immersive')}
          className={cn(
            "gap-2",
            layout === 'immersive' && "bg-primary text-primary-foreground"
          )}
          aria-label="Switch to immersive layout"
        >
          <Terminal className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Immersive</span>
        </Button>
      </div>

      {/* Render selected layout */}
      {layout === 'standard' ? (
        <LabClientPage locale={locale} translations={translations} />
      ) : (
        <ImmersiveLabLayout locale={locale} translations={translations} />
      )}
    </div>
  );
}


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
    // Load saved preference from localStorage ONLY on client
    const savedLayout = localStorage.getItem('lab-layout-preference') as LayoutType | null;
    if (savedLayout === 'standard' || savedLayout === 'immersive') {
      setLayout(savedLayout);
    }
    setIsClient(true);
  }, []);

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    localStorage.setItem('lab-layout-preference', newLayout);
  };

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return null;
  }

  return (
    <div className="relative" suppressHydrationWarning>
      {/* Layout Toggle - Fixed top right */}
      <div className="fixed top-4 right-4 z-50 flex gap-1 sm:gap-2 bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg p-1 shadow-lg" suppressHydrationWarning>
        <Button
          variant={layout === 'standard' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLayoutChange('standard')}
          className={cn(
            "gap-1 sm:gap-2 px-2 sm:px-3",
            layout === 'standard' && "bg-primary text-primary-foreground"
          )}
          aria-label="Switch to standard layout"
          title="Standard Layout"
        >
          <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="hidden sm:inline text-xs sm:text-sm">Standard</span>
        </Button>
        <Button
          variant={layout === 'immersive' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLayoutChange('immersive')}
          className={cn(
            "gap-1 sm:gap-2 px-2 sm:px-3",
            layout === 'immersive' && "bg-primary text-primary-foreground"
          )}
          aria-label="Switch to immersive layout"
          title="Immersive Layout"
        >
          <Terminal className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="hidden sm:inline text-xs sm:text-sm">Immersive</span>
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




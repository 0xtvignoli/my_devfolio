'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type GtagEventParams = Record<string, string | number | boolean | undefined>;

type GtagFunction = {
  (command: 'js', date: Date): void;
  (command: 'config', targetId: string, params?: GtagEventParams): void;
  (command: 'event', eventName: string, params?: GtagEventParams): void;
  (...args: Array<string | Date | GtagEventParams | undefined>): void;
};

declare global {
  interface Window {
    gtag: GtagFunction;
    dataLayer: Array<Record<string, unknown>>;
  }
}

export function GoogleAnalytics({ GA_MEASUREMENT_ID }: { GA_MEASUREMENT_ID: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    // Track page views
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams, GA_MEASUREMENT_ID]);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        id="google-analytics"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

// Helper functions for custom events
export const trackEvent = (eventName: string, parameters?: GtagEventParams) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackLabInteraction = (action: string, details?: GtagEventParams) => {
  trackEvent('lab_interaction', {
    action,
    ...details,
  });
};

export const trackDeployment = (strategy: string, result: 'success' | 'failure') => {
  trackEvent('deployment', {
    strategy,
    result,
  });
};

export const trackChaosExperiment = (type: string, duration: number) => {
  trackEvent('chaos_experiment', {
    experiment_type: type,
    duration,
  });
};

export const trackAchievement = (achievementId: string, title: string) => {
  trackEvent('achievement_unlocked', {
    achievement_id: achievementId,
    achievement_title: title,
  });
};

'use client';

import { useEffect, useRef } from 'react';

interface AriaLiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  id?: string;
}

export function AriaLiveRegion({ 
  message, 
  priority = 'polite',
  id = 'aria-live-region'
}: AriaLiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && regionRef.current) {
      // Clear and set message to trigger announcement
      regionRef.current.textContent = '';
      // Use setTimeout to ensure the clear is processed
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  return (
    <div
      ref={regionRef}
      id={id}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
}


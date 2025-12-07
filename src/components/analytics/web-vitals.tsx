'use client';

import { useEffect } from 'react';
import { initializeWebVitals } from '@/lib/web-vitals';

/**
 * Web Vitals tracking component
 * Initializes Core Web Vitals measurement on client side
 * Place this in your root layout to start tracking
 */
export function WebVitalsTracker() {
  useEffect(() => {
    initializeWebVitals();
  }, []);

  // This component doesn't render anything
  return null;
}

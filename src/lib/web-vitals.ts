'use client';

import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export interface WebVitalsMetric {
  name: string;
  delta: number;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  url?: string;
}

/**
 * Send Web Vitals metrics to analytics service
 * This helps track Core Web Vitals performance
 */
export function sendWebVitals(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vital:', {
      name: metric.name,
      value: metric.value.toFixed(2),
      rating: metric.rating,
      delta: metric.delta.toFixed(2),
    });
  }

  // Send to analytics endpoint
  // Replace with your actual analytics service
  if (window.location.pathname !== '/_next/static' && !window.location.pathname.includes('__nextjs')) {
    const vitalsUrl = `${process.env.NEXT_PUBLIC_ANALYTICS_URL || 'https://analytics.example.com'}/api/vitals`;
    
    // Use sendBeacon for reliability when page is unloading
    if (navigator.sendBeacon) {
      navigator.sendBeacon(vitalsUrl, JSON.stringify(metric));
    }
  }
}

/**
 * Initialize Web Vitals tracking
 * Call this in your root layout or _app
 */
export function initializeWebVitals() {
  try {
    onCLS(sendWebVitals);
    onFID(sendWebVitals);
    onFCP(sendWebVitals);
    onLCP(sendWebVitals);
    onTTFB(sendWebVitals);
  } catch (error) {
    console.error('Failed to initialize Web Vitals:', error);
  }
}

/**
 * Get performance metrics from the browser API
 * Useful for real-time monitoring
 */
export function getPerformanceMetrics() {
  if (typeof window === 'undefined') return null;

  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

  return {
    pageLoadTime,
    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
    timeToFirstByte: perfData.responseStart - perfData.navigationStart,
    domInteractive: perfData.domInteractive - perfData.navigationStart,
  };
}

/**
 * Monitor and log memory usage (for debugging)
 */
export function monitorMemoryUsage() {
  if ('memory' in performance && (performance as any).memory) {
    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = (performance as any).memory;
    return {
      usedJSHeapSize: (usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    };
  }
  return null;
}

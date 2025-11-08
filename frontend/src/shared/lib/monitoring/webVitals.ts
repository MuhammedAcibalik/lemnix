/**
 * Web Vitals Monitoring
 * 
 * Tracks Core Web Vitals (LCP, CLS, FID/INP, FCP, TTFB) and reports to analytics.
 * Helps monitor and improve user experience metrics.
 * 
 * @module shared/lib/monitoring/webVitals
 */

import type { Metric } from 'web-vitals';

/**
 * Web Vitals thresholds (Google recommendations)
 */
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  INP: { good: 200, needsImprovement: 500 },   // Interaction to Next Paint
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
} as const;

/**
 * Get rating for a metric
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Send metric to analytics
 * ✅ P3-12: Enhanced with backend reporting
 */
function sendToAnalytics(metric: Metric): void {
  const { name, value, id, rating, delta, navigationType } = metric;
  
  // Log in development
  if (import.meta.env.DEV) {
    const customRating = getRating(name, value);
    const emoji = customRating === 'good' ? '✅' : customRating === 'needs-improvement' ? '⚠️' : '❌';
    
    console.log(`${emoji} Web Vital [${name}]:`, {
      value: Math.round(value),
      rating: customRating,
      id,
      threshold: THRESHOLDS[name as keyof typeof THRESHOLDS],
    });
  }
  
  // ✅ P3-12: Send to backend via Beacon API
  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    const payload = {
      name,
      value,
      rating: getRating(name, value),
      delta: delta || 0,
      id,
      navigationType: navigationType || 'unknown',
    };
    
    // Beacon API with Blob for proper Content-Type
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const sent = navigator.sendBeacon('/api/metrics/web-vitals', blob);
    
    if (!sent && import.meta.env.DEV) {
      console.warn(`[WEB-VITALS] Failed to send ${name} via Beacon API`);
    }
  }
  
  // Send to analytics service (Google Analytics, Sentry, etc.)
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // Google Analytics 4
    (window as { gtag: (event: string, name: string, params: Record<string, unknown>) => void }).gtag('event', name, {
      value: Math.round(value),
      metric_id: id,
      metric_value: value,
      metric_delta: delta,
      metric_rating: rating,
    });
  }
  
  // Custom analytics endpoint (optional, fallback if Beacon fails)
  if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
    fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({
        metric: name,
        value,
        id,
        rating,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {
      // Silently fail - don't break user experience
    });
  }
}

/**
 * Initialize Web Vitals monitoring
 * 
 * Dynamically imports web-vitals library and starts tracking.
 * Safe to call multiple times (will only initialize once).
 */
export async function initWebVitals(): Promise<void> {
  try {
    // Dynamic import for code splitting
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');
    
    // Track all Core Web Vitals
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics); // FID replaced with INP in web-vitals v3
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
    
    // INP is the new metric replacing FID
    if (onINP) {
      onINP(sendToAnalytics);
    }
    
    if (import.meta.env.DEV) {
      console.log('📊 Web Vitals monitoring initialized');
    }
  } catch (error) {
    // Silently fail in production
    if (import.meta.env.DEV) {
      console.warn('Failed to initialize Web Vitals:', error);
    }
  }
}

/**
 * Report custom performance mark
 */
export function reportCustomMetric(
  name: string,
  value: number,
  unit: 'ms' | 'count' | 'bytes' = 'ms'
): void {
  if (import.meta.env.DEV) {
    console.log(`📈 Custom Metric [${name}]:`, value, unit);
  }
  
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as { gtag: (event: string, name: string, params: Record<string, unknown>) => void }).gtag('event', 'custom_metric', {
      metric_name: name,
      metric_value: value,
      metric_unit: unit,
    });
  }
}

/**
 * Performance observer for long tasks
 */
export function observeLongTasks(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }
  
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          // Task longer than 50ms
          if (import.meta.env.DEV) {
            console.warn('⚠️ Long Task detected:', {
              duration: Math.round(entry.duration),
              startTime: Math.round(entry.startTime),
              name: entry.name,
            });
          }
          
          reportCustomMetric('long_task', entry.duration, 'ms');
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  } catch {
    // Browser doesn't support PerformanceObserver or longtask
  }
}


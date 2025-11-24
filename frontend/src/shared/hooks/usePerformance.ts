/**
 * @fileoverview Performance Hooks - Debounce, Throttle, and Performance Monitoring
 * @module shared/hooks/usePerformance
 * @version 3.0.0
 */

import { useCallback, useEffect, useRef } from "react";
import type { WindowWithIdleCallback } from "../types/browser";

/**
 * Debounce function - delays execution until after wait milliseconds
 * have elapsed since the last invocation
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  // Type-safe wrapper that preserves function signature
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Throttle function - ensures function is called at most once per limit milliseconds
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Measure render time for a component (DEV mode only)
 * Logs component render times to help identify performance bottlenecks
 */
export function measureRenderTime(componentName: string): () => void {
  if (process.env.NODE_ENV !== "development") {
    return () => {}; // No-op in production
  }

  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (renderTime > 16) {
      // Warn if render takes longer than one frame (16ms at 60fps)
      console.warn(
        `[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`,
      );
    } else {
      console.log(
        `[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`,
      );
    }
  };
}

/**
 * Schedule a task to run during browser idle time
 * Uses requestIdleCallback with setTimeout fallback
 */
export function scheduleIdleTask(
  callback: () => void,
  options?: { timeout?: number },
): number {
  if (typeof window === "undefined") {
    return 0; // Server-side rendering fallback
  }

  const globalWindow = window as Window & WindowWithIdleCallback;

  if (globalWindow.requestIdleCallback) {
    return globalWindow.requestIdleCallback(callback, options);
  }

  // Fallback for browsers that don't support requestIdleCallback
  return window.setTimeout(callback, 1);
}

/**
 * Cancel a scheduled idle task
 */
export function cancelIdleTask(id: number): void {
  if (typeof window === "undefined") return;

  const globalWindow = window as Window & WindowWithIdleCallback;

  if (globalWindow.cancelIdleCallback) {
    globalWindow.cancelIdleCallback(id);
  } else {
    window.clearTimeout(id);
  }
}

/**
 * Hook for debounced values
 * Updates the returned value only after the specified delay has passed
 * without the value changing
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for debounced callbacks
 * Returns a memoized debounced version of the callback
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFn = useCallback(
    debounce(
      ((...args: Parameters<T>) => {
        callbackRef.current(...args);
      }) as (...args: unknown[]) => unknown,
      delay,
    ),
    [delay],
  );
  return debouncedFn as (...args: Parameters<T>) => void;
}

/**
 * Hook for throttled callbacks
 * Returns a memoized throttled version of the callback
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number,
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledFn = useCallback(
    throttle(
      ((...args: Parameters<T>) => {
        callbackRef.current(...args);
      }) as (...args: unknown[]) => unknown,
      limit,
    ),
    [limit],
  );
  return throttledFn as (...args: Parameters<T>) => void;
}

/**
 * Hook to measure component render performance
 * Only active in development mode
 */
export function useRenderPerformance(componentName: string): void {
  useEffect(() => {
    const end = measureRenderTime(componentName);
    return end;
  });
}

/**
 * Hook to schedule idle tasks with cleanup
 */
export function useIdleTask(
  task: () => void,
  deps: React.DependencyList = [],
  options?: { timeout?: number },
): void {
  useEffect(() => {
    const taskId = scheduleIdleTask(task, options);

    return () => {
      cancelIdleTask(taskId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// Import useState for hooks
import { useState } from "react";

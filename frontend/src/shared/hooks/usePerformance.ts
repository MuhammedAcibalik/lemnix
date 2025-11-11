/**
 * @fileoverview Performance Hooks - Debounce, Throttle, and Performance Monitoring
 * @module shared/hooks/usePerformance
 * @version 3.0.0
 */

import { useCallback, useEffect, useRef } from "react";

/**
 * Debounce function - delays execution until after wait milliseconds
 * have elapsed since the last invocation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
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
    
    if (renderTime > 16) { // Warn if render takes longer than one frame (16ms at 60fps)
      console.warn(
        `[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`
      );
    } else {
      console.log(
        `[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`
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
  options?: { timeout?: number }
): number {
  if (typeof window === "undefined") {
    return 0; // Server-side rendering fallback
  }
  
  // Use type assertion to work around TypeScript control flow narrowing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalWindow = window as any;
  
  if ("requestIdleCallback" in globalWindow) {
    return globalWindow.requestIdleCallback(callback, options);
  }

  // Fallback for browsers that don't support requestIdleCallback
  return globalWindow.setTimeout(callback, 1);
}

/**
 * Cancel a scheduled idle task
 */
export function cancelIdleTask(id: number): void {
  if (typeof window === "undefined") return;
  
  // Use type assertion to work around TypeScript control flow narrowing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalWindow = window as any;
  
  if ("cancelIdleCallback" in globalWindow) {
    globalWindow.cancelIdleCallback(id);
  } else {
    globalWindow.clearTimeout(id);
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    debounce((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, delay),
    [delay]
  );
}

/**
 * Hook for throttled callbacks
 * Returns a memoized throttled version of the callback
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    throttle((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, limit),
    [limit]
  );
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
  options?: { timeout?: number }
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

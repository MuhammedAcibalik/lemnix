/**
 * @fileoverview useContainerQuery Hook
 * @module shared/hooks/useContainerQuery
 * @description React hook for container-based responsive queries
 * @version 3.0.0
 */

import { useState, useEffect, useRef, RefObject } from 'react';

export interface ContainerSize {
  width: number;
  height: number;
}

export interface ContainerQueryOptions {
  /** Debounce delay in milliseconds */
  debounce?: number;
  /** Enable height tracking */
  trackHeight?: boolean;
}

/**
 * Hook for container-based responsive queries
 * Tracks the size of a specific container element instead of viewport
 * 
 * @param options - Configuration options
 * @returns Ref to attach to container and current size
 * 
 * @example
 * ```tsx
 * function ResponsiveCard() {
 *   const { ref, size } = useContainerQuery();
 *   const isCompact = size.width < 400;
 *   
 *   return (
 *     <div ref={ref}>
 *       {isCompact ? <CompactView /> : <FullView />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useContainerQuery<T extends HTMLElement = HTMLDivElement>(
  options: ContainerQueryOptions = {}
): {
  ref: RefObject<T>;
  size: ContainerSize;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
} {
  const { debounce = 150, trackHeight = false } = options;
  
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ContainerSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!ref.current) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const element = ref.current;

    const updateSize = () => {
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      setSize({
        width: rect.width,
        height: trackHeight ? rect.height : 0,
      });
    };

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, debounce);
    };

    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(element);

    // Initial size
    updateSize();

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [debounce, trackHeight]);

  // Helper flags for common breakpoints
  const isSmall = size.width < 640;
  const isMedium = size.width >= 640 && size.width < 1024;
  const isLarge = size.width >= 1024;

  return {
    ref,
    size,
    isSmall,
    isMedium,
    isLarge,
  };
}

/**
 * Hook to check if container width is above a threshold
 * 
 * @param threshold - Width threshold in pixels
 * @param options - Configuration options
 * @returns Ref and boolean indicating if width is above threshold
 * 
 * @example
 * ```tsx
 * const { ref, isAbove } = useContainerWidth(768);
 * 
 * return (
 *   <div ref={ref}>
 *     {isAbove ? <DesktopLayout /> : <MobileLayout />}
 *   </div>
 * );
 * ```
 */
export function useContainerWidth<T extends HTMLElement = HTMLDivElement>(
  threshold: number,
  options: ContainerQueryOptions = {}
): {
  ref: RefObject<T>;
  width: number;
  isAbove: boolean;
  isBelow: boolean;
} {
  const { ref, size } = useContainerQuery<T>(options);

  return {
    ref,
    width: size.width,
    isAbove: size.width >= threshold,
    isBelow: size.width < threshold,
  };
}

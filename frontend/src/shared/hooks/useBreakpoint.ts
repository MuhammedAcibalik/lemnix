/**
 * @fileoverview useBreakpoint Hook
 * @module shared/hooks/useBreakpoint
 * @description React hook for detecting current responsive breakpoint
 */

import { useState, useEffect } from "react";
import {
  breakpoints,
  getCurrentBreakpoint,
  type Breakpoint,
} from "../config/breakpoints";

/**
 * Hook to detect current breakpoint based on window width
 *
 * @returns Object with current breakpoint and helper functions
 *
 * @example
 * ```tsx
 * const { current, isAbove, isBelow } = useBreakpoint();
 *
 * if (current === 'mobile') {
 *   // Mobile layout
 * }
 *
 * if (isAbove('md')) {
 *   // Desktop layout
 * }
 * ```
 */
export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === "undefined") {
      return "mobile";
    }
    return getCurrentBreakpoint(window.innerWidth);
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      const newBreakpoint = getCurrentBreakpoint(window.innerWidth);
      if (newBreakpoint !== currentBreakpoint) {
        setCurrentBreakpoint(newBreakpoint);
      }
    };

    window.addEventListener("resize", handleResize);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [currentBreakpoint]);

  /**
   * Check if current breakpoint is above specified breakpoint
   */
  const isAbove = (breakpoint: Breakpoint): boolean => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth >= breakpoints[breakpoint];
  };

  /**
   * Check if current breakpoint is below specified breakpoint
   */
  const isBelow = (breakpoint: Breakpoint): boolean => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth < breakpoints[breakpoint];
  };

  /**
   * Check if current breakpoint matches specified breakpoint
   */
  const is = (breakpoint: Breakpoint): boolean => {
    return currentBreakpoint === breakpoint;
  };

  return {
    current: currentBreakpoint,
    isAbove,
    isBelow,
    is,
    // Convenience flags
    isMobile: currentBreakpoint === "mobile",
    isTablet: currentBreakpoint === "tablet" || currentBreakpoint === "md",
    isDesktop: isAbove("desktop"),
    isWide: isAbove("wide"),
  };
}

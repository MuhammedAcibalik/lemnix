/**
 * @fileoverview useBreakpoint Hook
 * @module shared/hooks/useBreakpoint
 * @description React hook for detecting current responsive breakpoint
 */

<<<<<<< HEAD
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
=======
import { useState, useEffect } from 'react';
import { breakpoints, getCurrentBreakpoint, type Breakpoint } from '../config/breakpoints';

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
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * if (isAbove('md')) {
 *   // Desktop layout
 * }
 * ```
 */
export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(() => {
<<<<<<< HEAD
    if (typeof window === "undefined") {
      return "mobile";
=======
    if (typeof window === 'undefined') {
      return 'mobile';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    }
    return getCurrentBreakpoint(window.innerWidth);
  });

  useEffect(() => {
<<<<<<< HEAD
    if (typeof window === "undefined") {
=======
    if (typeof window === 'undefined') {
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
      return;
    }

    const handleResize = () => {
      const newBreakpoint = getCurrentBreakpoint(window.innerWidth);
      if (newBreakpoint !== currentBreakpoint) {
        setCurrentBreakpoint(newBreakpoint);
      }
    };

<<<<<<< HEAD
    window.addEventListener("resize", handleResize);

=======
    window.addEventListener('resize', handleResize);
    
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    // Initial check
    handleResize();

    return () => {
<<<<<<< HEAD
      window.removeEventListener("resize", handleResize);
=======
      window.removeEventListener('resize', handleResize);
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    };
  }, [currentBreakpoint]);

  /**
   * Check if current breakpoint is above specified breakpoint
   */
  const isAbove = (breakpoint: Breakpoint): boolean => {
<<<<<<< HEAD
    if (typeof window === "undefined") {
=======
    if (typeof window === 'undefined') {
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
      return false;
    }
    return window.innerWidth >= breakpoints[breakpoint];
  };

  /**
   * Check if current breakpoint is below specified breakpoint
   */
  const isBelow = (breakpoint: Breakpoint): boolean => {
<<<<<<< HEAD
    if (typeof window === "undefined") {
=======
    if (typeof window === 'undefined') {
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
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
<<<<<<< HEAD
    isMobile: currentBreakpoint === "mobile",
    isTablet: currentBreakpoint === "tablet" || currentBreakpoint === "md",
    isDesktop: isAbove("desktop"),
    isWide: isAbove("wide"),
=======
    isMobile: currentBreakpoint === 'mobile',
    isTablet: currentBreakpoint === 'tablet' || currentBreakpoint === 'md',
    isDesktop: isAbove('desktop'),
    isWide: isAbove('wide'),
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
  };
}

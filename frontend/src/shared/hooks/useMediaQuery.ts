/**
 * @fileoverview useMediaQuery Hook
 * @module shared/hooks/useMediaQuery
 * @description React hook for responsive media queries
 */

<<<<<<< HEAD
import { useState, useEffect } from "react";

/**
 * Custom hook to track media query matches
 *
 * @param query - CSS media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the media query matches
 *
=======
import { useState, useEffect } from 'react';

/**
 * Custom hook to track media query matches
 * 
 * @param query - CSS media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the media query matches
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Check if window is available (SSR safety)
<<<<<<< HEAD
    if (typeof window === "undefined") {
=======
    if (typeof window === 'undefined') {
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    // Check if window is available (SSR safety)
<<<<<<< HEAD
    if (typeof window === "undefined") {
=======
    if (typeof window === 'undefined') {
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
      return;
    }

    const mediaQuery = window.matchMedia(query);
<<<<<<< HEAD

=======
    
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    // Update state if initial value is different
    if (mediaQuery.matches !== matches) {
      setMatches(mediaQuery.matches);
    }

    // Define the event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers use addEventListener
<<<<<<< HEAD
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
=======
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    };
  }, [query, matches]);

  return matches;
}

/**
 * @fileoverview useMediaQuery Hook
 * @module shared/hooks/useMediaQuery
 * @description React hook for responsive media queries
 */

import { useState, useEffect } from "react";

/**
 * Custom hook to track media query matches
 *
 * @param query - CSS media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the media query matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Check if window is available (SSR safety)
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Update state if initial value is different
    if (mediaQuery.matches !== matches) {
      setMatches(mediaQuery.matches);
    }

    // Define the event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers use addEventListener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query, matches]);

  return matches;
}

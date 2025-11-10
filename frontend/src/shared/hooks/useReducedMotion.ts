/**
 * useReducedMotion Hook
 * Respects user's motion preferences for accessibility
 *
 * @module shared/hooks
 * @version 3.0.0
 */

import { useState, useEffect } from "react";

/**
 * Hook to detect if user prefers reduced motion
 * Respects the prefers-reduced-motion media query for accessibility
 *
 * @returns {boolean} true if user prefers reduced motion
 *
 * @example
 * ```tsx
 * const shouldReduceMotion = useReducedMotion();
 * <motion.div animate={shouldReduceMotion ? {} : { x: 100 }} />
 * ```
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
};

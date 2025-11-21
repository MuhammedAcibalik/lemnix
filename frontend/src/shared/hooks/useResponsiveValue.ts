/**
 * @fileoverview useResponsiveValue Hook
 * @module shared/hooks/useResponsiveValue
 * @description React hook for getting responsive values based on current breakpoint
 * @version 3.0.0
 */

import { useState, useEffect } from "react";
import { breakpoints, type Breakpoint } from "../config/breakpoints";
import { getResponsiveValue } from "../utils/responsive";

type ResponsiveValueMap<T> = Partial<Record<Breakpoint, T>>;

/**
 * Hook to get responsive values based on current screen width
 *
 * @param values - Object mapping breakpoints to values
 * @param defaultValue - Default value if no breakpoint matches
 * @returns Current value for the active breakpoint
 *
 * @example
 * ```tsx
 * const columns = useResponsiveValue({
 *   mobile: 1,
 *   tablet: 2,
 *   desktop: 3,
 *   wide: 4,
 * }, 1);
 *
 * const padding = useResponsiveValue({
 *   mobile: 16,
 *   tablet: 24,
 *   desktop: 32,
 * });
 * ```
 */
export function useResponsiveValue<T>(
  values: ResponsiveValueMap<T>,
  defaultValue?: T,
): T | undefined {
  const [value, setValue] = useState<T | undefined>(() => {
    if (typeof window === "undefined") {
      return defaultValue;
    }
    return getResponsiveValue(values, window.innerWidth) || defaultValue;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newValue =
          getResponsiveValue(values, window.innerWidth) || defaultValue;
        setValue(newValue);
      }, 150); // Debounce for performance
    };

    // Initial value
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [values, defaultValue]);

  return value;
}

/**
 * Hook to get multiple responsive values at once
 *
 * @param valuesMap - Object with keys and responsive value maps
 * @returns Object with current values for each key
 *
 * @example
 * ```tsx
 * const { columns, gap, padding } = useResponsiveValues({
 *   columns: { mobile: 1, tablet: 2, desktop: 3 },
 *   gap: { mobile: 8, tablet: 12, desktop: 16 },
 *   padding: { mobile: 16, tablet: 24, desktop: 32 },
 * });
 * ```
 */
export function useResponsiveValues<
  T extends Record<string, ResponsiveValueMap<any>>,
>(valuesMap: T): { [K in keyof T]: ReturnType<typeof useResponsiveValue> } {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth);
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const result = {} as { [K in keyof T]: any };

  for (const key in valuesMap) {
    result[key] = getResponsiveValue(valuesMap[key], width);
  }

  return result;
}

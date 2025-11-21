/**
 * @fileoverview useResponsiveValue Hook
 * @module shared/hooks/useResponsiveValue
 * @description React hook for getting responsive values based on current breakpoint
 * @version 3.0.0
 */

<<<<<<< HEAD
import { useState, useEffect } from "react";
import { breakpoints, type Breakpoint } from "../config/breakpoints";
import { getResponsiveValue } from "../utils/responsive";
=======
import { useState, useEffect } from 'react';
import { breakpoints, type Breakpoint } from '../config/breakpoints';
import { getResponsiveValue } from '../utils/responsive';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce

type ResponsiveValueMap<T> = Partial<Record<Breakpoint, T>>;

/**
 * Hook to get responsive values based on current screen width
<<<<<<< HEAD
 *
 * @param values - Object mapping breakpoints to values
 * @param defaultValue - Default value if no breakpoint matches
 * @returns Current value for the active breakpoint
 *
=======
 * 
 * @param values - Object mapping breakpoints to values
 * @param defaultValue - Default value if no breakpoint matches
 * @returns Current value for the active breakpoint
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @example
 * ```tsx
 * const columns = useResponsiveValue({
 *   mobile: 1,
 *   tablet: 2,
 *   desktop: 3,
 *   wide: 4,
 * }, 1);
<<<<<<< HEAD
 *
=======
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * const padding = useResponsiveValue({
 *   mobile: 16,
 *   tablet: 24,
 *   desktop: 32,
 * });
 * ```
 */
export function useResponsiveValue<T>(
  values: ResponsiveValueMap<T>,
<<<<<<< HEAD
  defaultValue?: T,
): T | undefined {
  const [value, setValue] = useState<T | undefined>(() => {
    if (typeof window === "undefined") {
=======
  defaultValue?: T
): T | undefined {
  const [value, setValue] = useState<T | undefined>(() => {
    if (typeof window === 'undefined') {
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
      return defaultValue;
    }
    return getResponsiveValue(values, window.innerWidth) || defaultValue;
  });

  useEffect(() => {
<<<<<<< HEAD
    if (typeof window === "undefined") {
=======
    if (typeof window === 'undefined') {
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
<<<<<<< HEAD
        const newValue =
          getResponsiveValue(values, window.innerWidth) || defaultValue;
=======
        const newValue = getResponsiveValue(values, window.innerWidth) || defaultValue;
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
        setValue(newValue);
      }, 150); // Debounce for performance
    };

    // Initial value
    handleResize();

<<<<<<< HEAD
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
=======
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    };
  }, [values, defaultValue]);

  return value;
}

/**
 * Hook to get multiple responsive values at once
<<<<<<< HEAD
 *
 * @param valuesMap - Object with keys and responsive value maps
 * @returns Object with current values for each key
 *
=======
 * 
 * @param valuesMap - Object with keys and responsive value maps
 * @returns Object with current values for each key
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @example
 * ```tsx
 * const { columns, gap, padding } = useResponsiveValues({
 *   columns: { mobile: 1, tablet: 2, desktop: 3 },
 *   gap: { mobile: 8, tablet: 12, desktop: 16 },
 *   padding: { mobile: 16, tablet: 24, desktop: 32 },
 * });
 * ```
 */
<<<<<<< HEAD
export function useResponsiveValues<
  T extends Record<string, ResponsiveValueMap<any>>,
>(valuesMap: T): { [K in keyof T]: ReturnType<typeof useResponsiveValue> } {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
=======
export function useResponsiveValues<T extends Record<string, ResponsiveValueMap<any>>>(
  valuesMap: T
): { [K in keyof T]: ReturnType<typeof useResponsiveValue> } {
  const [width, setWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth);
      }, 150);
    };

<<<<<<< HEAD
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
=======
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    };
  }, []);

  const result = {} as { [K in keyof T]: any };

  for (const key in valuesMap) {
    result[key] = getResponsiveValue(valuesMap[key], width);
  }

  return result;
}

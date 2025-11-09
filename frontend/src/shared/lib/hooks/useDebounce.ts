/**
 * LEMNİX useDebounce Hook
 * Debounce values to improve performance
 *
 * @module shared/lib/hooks
 * @version 1.0.0 - FSD Compliant
 */

import { useState, useEffect } from "react";

/**
 * Debounce a value with specified delay
 *
 * @example
 * ```tsx
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // API call with debounced value
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
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

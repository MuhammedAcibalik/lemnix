/**
 * LEMNİX usePrevious Hook
 * Get the previous value of a state or prop
 * 
 * @module shared/lib/hooks
 * @version 1.0.0 - FSD Compliant
 */

import { useRef, useEffect } from 'react';

/**
 * Track previous value of a variable
 * 
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 * 
 * console.log(`Current: ${count}, Previous: ${prevCount}`);
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}


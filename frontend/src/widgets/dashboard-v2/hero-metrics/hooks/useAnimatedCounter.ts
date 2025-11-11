/**
 * useAnimatedCounter Hook
 * Animates number changes with easing
 *
 * @module widgets/dashboard-v2/hero-metrics/hooks
 * @version 3.0.0
 */

import { useEffect, useState, useRef } from "react";

export interface UseAnimatedCounterOptions {
  /**
   * Duration of animation in milliseconds
   * @default 1000
   */
  duration?: number;

  /**
   * Easing function for animation
   * @default "easeOutQuart"
   */
  easing?: "linear" | "easeOutQuart" | "easeInOutCubic";

  /**
   * Number of decimal places to show
   * @default 0
   */
  decimals?: number;
}

/**
 * Easing functions
 */
const easingFunctions = {
  linear: (t: number) => t,
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

/**
 * Hook to animate number changes
 */
export const useAnimatedCounter = (
  targetValue: number,
  options: UseAnimatedCounterOptions = {},
): number => {
  const { duration = 1000, easing = "easeOutQuart", decimals = 0 } = options;

  const [displayValue, setDisplayValue] = useState(targetValue);
  const startValueRef = useRef(targetValue);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Cancel any ongoing animation
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    startValueRef.current = displayValue;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = easingFunctions[easing](progress);
      const currentValue =
        startValueRef.current +
        (targetValue - startValueRef.current) * easedProgress;

      setDisplayValue(Number(currentValue.toFixed(decimals)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetValue, duration, easing, decimals]);

  return displayValue;
};

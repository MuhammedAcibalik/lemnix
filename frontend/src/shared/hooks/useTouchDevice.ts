/**
 * @fileoverview useTouchDevice Hook
 * @module shared/hooks/useTouchDevice
 * @description React hook for detecting touch device capabilities
 * @version 3.0.0
 */

import { useState, useEffect } from "react";

export interface TouchDeviceState {
  /** True if device supports touch */
  isTouch: boolean;
  /** True if device has a mouse pointer */
  hasMouse: boolean;
  /** True if device is hybrid (both touch and mouse) */
  isHybrid: boolean;
  /** Maximum number of simultaneous touch points */
  maxTouchPoints: number;
  /** True if device has coarse pointer (touch/stylus) */
  hasCoarsePointer: boolean;
  /** True if device has fine pointer (mouse/trackpad) */
  hasFinePointer: boolean;
}

/**
 * Detect if device supports touch
 */
function detectTouch(): boolean {
  if (typeof window === "undefined") return false;

  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Detect pointer capabilities
 */
function detectPointerCapabilities() {
  if (typeof window === "undefined") {
    return {
      hasCoarsePointer: false,
      hasFinePointer: false,
      hasMouse: false,
    };
  }

  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const hasMouse = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;

  return {
    hasCoarsePointer,
    hasFinePointer,
    hasMouse,
  };
}

/**
 * Hook to detect touch device capabilities

 * 
 * @returns Touch device state
 * 

 * @example
 * ```tsx
 * function InteractiveButton() {
 *   const { isTouch, hasMouse, isHybrid } = useTouchDevice();

 *   
 *   const buttonSize = isTouch ? 44 : 32; // Touch-friendly size
 *   
 *   return (
 *     <button 

 *       style={{ minWidth: buttonSize, minHeight: buttonSize }}
 *       onMouseEnter={hasMouse ? handleHover : undefined}
 *     >
 *       Click me
 *     </button>
 *   );
 * }
 * ```
 */
export function useTouchDevice(): TouchDeviceState {
  const [state, setState] = useState<TouchDeviceState>(() => {
    const isTouch = detectTouch();
    const pointerCaps = detectPointerCapabilities();

    const maxTouchPoints =
      typeof navigator !== "undefined" ? navigator.maxTouchPoints : 0;

    return {
      isTouch,
      hasMouse: pointerCaps.hasMouse,
      isHybrid: isTouch && pointerCaps.hasMouse,
      maxTouchPoints,
      hasCoarsePointer: pointerCaps.hasCoarsePointer,
      hasFinePointer: pointerCaps.hasFinePointer,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Re-check on resize (some devices change between touch/mouse mode)
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleChange = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const isTouch = detectTouch();
        const pointerCaps = detectPointerCapabilities();
        const maxTouchPoints = navigator.maxTouchPoints;

        setState({
          isTouch,
          hasMouse: pointerCaps.hasMouse,
          isHybrid: isTouch && pointerCaps.hasMouse,
          maxTouchPoints,
          hasCoarsePointer: pointerCaps.hasCoarsePointer,
          hasFinePointer: pointerCaps.hasFinePointer,
        });
      }, 200);
    };

    // Listen for media query changes

    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    const hoverQuery = window.matchMedia("(hover: hover)");

    coarsePointerQuery.addEventListener("change", handleChange);
    finePointerQuery.addEventListener("change", handleChange);
    hoverQuery.addEventListener("change", handleChange);

    return () => {
      clearTimeout(timeoutId);
      coarsePointerQuery.removeEventListener("change", handleChange);
      finePointerQuery.removeEventListener("change", handleChange);
      hoverQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return state;
}

/**
 * Hook to get optimal touch target size
 * Returns appropriate button/interactive element size based on device

 * 
 * @param defaultSize - Default size for non-touch devices
 * @returns Optimal size in pixels
 * 

 * @example
 * ```tsx
 * function ActionButton() {
 *   const size = useTouchTargetSize(32);

 *   

 *   return (
 *     <button style={{ minWidth: size, minHeight: size }}>
 *       Action
 *     </button>
 *   );
 * }
 * ```
 */
export function useTouchTargetSize(defaultSize = 32): number {
  const { isTouch } = useTouchDevice();

  // WCAG 2.1 Level AAA recommends 44x44px for touch targets
  const TOUCH_TARGET_SIZE = 44;

  return isTouch ? Math.max(defaultSize, TOUCH_TARGET_SIZE) : defaultSize;
}

/**
 * Hook to determine if hover effects should be enabled

 * 
 * @returns True if hover effects should be enabled
 * 

 * @example
 * ```tsx
 * function Card() {
 *   const shouldHover = useHoverCapability();

 *   

 *   return (
 *     <div className={shouldHover ? 'with-hover' : 'no-hover'}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useHoverCapability(): boolean {
  const { hasMouse, isHybrid } = useTouchDevice();

  // Enable hover on mouse-only and hybrid devices
  return hasMouse || isHybrid;
}

/**
 * @fileoverview useTouchDevice Hook
 * @module shared/hooks/useTouchDevice
 * @description React hook for detecting touch device capabilities
 * @version 3.0.0
 */

<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState, useEffect } from 'react';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce

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
<<<<<<< HEAD
  if (typeof window === "undefined") return false;

  return (
    "ontouchstart" in window ||
=======
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    navigator.maxTouchPoints > 0 ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Detect pointer capabilities
 */
function detectPointerCapabilities() {
<<<<<<< HEAD
  if (typeof window === "undefined") {
=======
  if (typeof window === 'undefined') {
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    return {
      hasCoarsePointer: false,
      hasFinePointer: false,
      hasMouse: false,
    };
  }

<<<<<<< HEAD
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const hasMouse = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;
=======
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce

  return {
    hasCoarsePointer,
    hasFinePointer,
    hasMouse,
  };
}

/**
 * Hook to detect touch device capabilities
<<<<<<< HEAD
 *
 * @returns Touch device state
 *
=======
 * 
 * @returns Touch device state
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @example
 * ```tsx
 * function InteractiveButton() {
 *   const { isTouch, hasMouse, isHybrid } = useTouchDevice();
<<<<<<< HEAD
 *
 *   const buttonSize = isTouch ? 44 : 32; // Touch-friendly size
 *
 *   return (
 *     <button
=======
 *   
 *   const buttonSize = isTouch ? 44 : 32; // Touch-friendly size
 *   
 *   return (
 *     <button 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
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
<<<<<<< HEAD
    const maxTouchPoints =
      typeof navigator !== "undefined" ? navigator.maxTouchPoints : 0;
=======
    const maxTouchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0;
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce

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
<<<<<<< HEAD
    if (typeof window === "undefined") return;
=======
    if (typeof window === 'undefined') return;
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce

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
<<<<<<< HEAD
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
=======
    const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
    const finePointerQuery = window.matchMedia('(pointer: fine)');
    const hoverQuery = window.matchMedia('(hover: hover)');

    coarsePointerQuery.addEventListener('change', handleChange);
    finePointerQuery.addEventListener('change', handleChange);
    hoverQuery.addEventListener('change', handleChange);

    return () => {
      clearTimeout(timeoutId);
      coarsePointerQuery.removeEventListener('change', handleChange);
      finePointerQuery.removeEventListener('change', handleChange);
      hoverQuery.removeEventListener('change', handleChange);
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    };
  }, []);

  return state;
}

/**
 * Hook to get optimal touch target size
 * Returns appropriate button/interactive element size based on device
<<<<<<< HEAD
 *
 * @param defaultSize - Default size for non-touch devices
 * @returns Optimal size in pixels
 *
=======
 * 
 * @param defaultSize - Default size for non-touch devices
 * @returns Optimal size in pixels
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @example
 * ```tsx
 * function ActionButton() {
 *   const size = useTouchTargetSize(32);
<<<<<<< HEAD
 *
=======
 *   
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
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
<<<<<<< HEAD

  // WCAG 2.1 Level AAA recommends 44x44px for touch targets
  const TOUCH_TARGET_SIZE = 44;

=======
  
  // WCAG 2.1 Level AAA recommends 44x44px for touch targets
  const TOUCH_TARGET_SIZE = 44;
  
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
  return isTouch ? Math.max(defaultSize, TOUCH_TARGET_SIZE) : defaultSize;
}

/**
 * Hook to determine if hover effects should be enabled
<<<<<<< HEAD
 *
 * @returns True if hover effects should be enabled
 *
=======
 * 
 * @returns True if hover effects should be enabled
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @example
 * ```tsx
 * function Card() {
 *   const shouldHover = useHoverCapability();
<<<<<<< HEAD
 *
=======
 *   
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
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
<<<<<<< HEAD

=======
  
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
  // Enable hover on mouse-only and hybrid devices
  return hasMouse || isHybrid;
}

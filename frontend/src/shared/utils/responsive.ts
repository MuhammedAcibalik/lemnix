/**
 * @fileoverview Responsive Utilities
 * @module shared/utils/responsive
 * @description Helper functions for responsive design calculations
 * @version 3.0.0
 */

import { breakpoints } from "../config/breakpoints";

/**
 * Get responsive value based on current breakpoint
 * Returns the appropriate value for the current screen width
<<<<<<< HEAD
 *
 * @param values - Object with breakpoint keys and values
 * @param width - Current window width
 * @returns The value for the current breakpoint
 *
=======
 * 
 * @param values - Object with breakpoint keys and values
 * @param width - Current window width
 * @returns The value for the current breakpoint
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @example
 * ```tsx
 * const padding = getResponsiveValue({
 *   mobile: 16,
 *   tablet: 24,
 *   desktop: 32,
 * }, window.innerWidth);
 * ```
 */
export function getResponsiveValue<T>(
  values: Partial<Record<keyof typeof breakpoints, T>>,
<<<<<<< HEAD
  width: number,
): T | undefined {
  // Sort breakpoints in descending order
  const sortedBreakpoints = Object.entries(breakpoints).sort(
    ([, a], [, b]) => b - a,
  );
=======
  width: number
): T | undefined {
  // Sort breakpoints in descending order
  const sortedBreakpoints = Object.entries(breakpoints)
    .sort(([, a], [, b]) => b - a);
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce

  // Find the first breakpoint that matches
  for (const [breakpoint, minWidth] of sortedBreakpoints) {
    if (width >= minWidth && breakpoint in values) {
      return values[breakpoint as keyof typeof breakpoints];
    }
  }

  // Return the smallest breakpoint value as fallback
  const smallestBreakpoint = sortedBreakpoints[sortedBreakpoints.length - 1][0];
  return values[smallestBreakpoint as keyof typeof breakpoints];
}

/**
 * Calculate fluid value between min and max based on viewport
 * Uses linear interpolation
<<<<<<< HEAD
 *
=======
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @param minValue - Minimum value at minBreakpoint
 * @param maxValue - Maximum value at maxBreakpoint
 * @param minBreakpoint - Starting breakpoint
 * @param maxBreakpoint - Ending breakpoint
 * @param currentWidth - Current window width
 * @returns Interpolated value
<<<<<<< HEAD
 *
=======
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @example
 * ```tsx
 * const fontSize = calculateFluidValue(16, 24, 320, 1920, window.innerWidth);
 * ```
 */
export function calculateFluidValue(
  minValue: number,
  maxValue: number,
  minBreakpoint: number,
  maxBreakpoint: number,
<<<<<<< HEAD
  currentWidth: number,
=======
  currentWidth: number
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
): number {
  if (currentWidth <= minBreakpoint) return minValue;
  if (currentWidth >= maxBreakpoint) return maxValue;

<<<<<<< HEAD
  const ratio =
    (currentWidth - minBreakpoint) / (maxBreakpoint - minBreakpoint);
=======
  const ratio = (currentWidth - minBreakpoint) / (maxBreakpoint - minBreakpoint);
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
  return minValue + (maxValue - minValue) * ratio;
}

/**
 * Generate CSS clamp() function for fluid sizing
<<<<<<< HEAD
 *
=======
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @param min - Minimum size (in rem or px)
 * @param preferred - Preferred size (viewport-based)
 * @param max - Maximum size (in rem or px)
 * @returns CSS clamp string
<<<<<<< HEAD
 *
=======
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @example
 * ```tsx
 * const fontSize = clamp('1rem', '0.5rem + 2vw', '3rem');
 * // Returns: 'clamp(1rem, 0.5rem + 2vw, 3rem)'
 * ```
 */
export function clamp(min: string, preferred: string, max: string): string {
  return `clamp(${min}, ${preferred}, ${max})`;
}

/**
 * Convert pixel value to rem
<<<<<<< HEAD
 *
 * @param px - Pixel value
 * @param baseFontSize - Base font size (default: 16)
 * @returns rem value as string
 *
=======
 * 
 * @param px - Pixel value
 * @param baseFontSize - Base font size (default: 16)
 * @returns rem value as string
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @example
 * ```tsx
 * pxToRem(24) // '1.5rem'
 * ```
 */
export function pxToRem(px: number, baseFontSize = 16): string {
  return `${px / baseFontSize}rem`;
}

/**
 * Convert rem value to pixels
<<<<<<< HEAD
 *
 * @param rem - Rem value
 * @param baseFontSize - Base font size (default: 16)
 * @returns pixel value as number
 *
=======
 * 
 * @param rem - Rem value
 * @param baseFontSize - Base font size (default: 16)
 * @returns pixel value as number
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @example
 * ```tsx
 * remToPx(1.5) // 24
 * ```
 */
export function remToPx(rem: number, baseFontSize = 16): number {
  return rem * baseFontSize;
}

/**
 * Check if current width matches a specific breakpoint
<<<<<<< HEAD
 *
=======
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @param breakpoint - Breakpoint name
 * @param width - Current window width
 * @returns true if width is within breakpoint range
 */
export function isBreakpoint(
  breakpoint: keyof typeof breakpoints,
<<<<<<< HEAD
  width: number,
): boolean {
  const breakpointKeys = Object.keys(breakpoints) as Array<
    keyof typeof breakpoints
  >;
  const currentIndex = breakpointKeys.indexOf(breakpoint);
  const currentMin = breakpoints[breakpoint];

=======
  width: number
): boolean {
  const breakpointKeys = Object.keys(breakpoints) as Array<keyof typeof breakpoints>;
  const currentIndex = breakpointKeys.indexOf(breakpoint);
  const currentMin = breakpoints[breakpoint];
  
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
  if (currentIndex === breakpointKeys.length - 1) {
    // Last breakpoint, no upper limit
    return width >= currentMin;
  }
<<<<<<< HEAD

  const nextBreakpoint = breakpointKeys[currentIndex + 1];
  const nextMin = breakpoints[nextBreakpoint];

=======
  
  const nextBreakpoint = breakpointKeys[currentIndex + 1];
  const nextMin = breakpoints[nextBreakpoint];
  
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
  return width >= currentMin && width < nextMin;
}

/**
 * Get columns count based on screen width
<<<<<<< HEAD
 *
 * @param width - Current window width
 * @returns Number of columns (1-4)
 *
=======
 * 
 * @param width - Current window width
 * @returns Number of columns (1-4)
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @example
 * ```tsx
 * getColumnsCount(320) // 1 (mobile)
 * getColumnsCount(768) // 2 (tablet)
 * getColumnsCount(1920) // 4 (desktop)
 * ```
 */
export function getColumnsCount(width: number): number {
  if (width < breakpoints.sm) return 1; // Mobile
  if (width < breakpoints.md) return 2; // Mobile large
  if (width < breakpoints.lg) return 2; // Tablet
  if (width < breakpoints.xl) return 3; // Desktop small
  if (width < breakpoints["2xl"]) return 3; // Desktop standard
  return 4; // Desktop large and ultra-wide
}

/**
 * Calculate responsive grid gap
<<<<<<< HEAD
 *
=======
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @param width - Current window width
 * @returns Gap size in pixels
 */
export function getGridGap(width: number): number {
  if (width < breakpoints.sm) return 8;
  if (width < breakpoints.md) return 12;
  if (width < breakpoints.lg) return 16;
  if (width < breakpoints.xl) return 20;
  if (width < breakpoints["2xl"]) return 24;
  return 32;
}

/**
 * Calculate responsive padding
<<<<<<< HEAD
 *
=======
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @param width - Current window width
 * @returns Padding size in pixels
 */
export function getContainerPadding(width: number): number {
  if (width < breakpoints.sm) return 16;
  if (width < breakpoints.md) return 24;
  if (width < breakpoints.lg) return 32;
  if (width < breakpoints.xl) return 40;
  if (width < breakpoints["2xl"]) return 48;
  return 64;
}

/**
 * Get device type based on width
<<<<<<< HEAD
 *
 * @param width - Current window width
 * @returns Device type
 */
export function getDeviceType(
  width: number,
): "mobile" | "tablet" | "desktop" | "wide" {
  if (width < breakpoints.md) return "mobile";
  if (width < breakpoints.lg) return "tablet";
  if (width < breakpoints["2xl"]) return "desktop";
  return "wide";
=======
 * 
 * @param width - Current window width
 * @returns Device type
 */
export function getDeviceType(width: number): 'mobile' | 'tablet' | 'desktop' | 'wide' {
  if (width < breakpoints.md) return 'mobile';
  if (width < breakpoints.lg) return 'tablet';
  if (width < breakpoints["2xl"]) return 'desktop';
  return 'wide';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
}

/**
 * Check if device is touch-capable
<<<<<<< HEAD
 *
 * @returns true if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;

  return (
    "ontouchstart" in window ||
=======
 * 
 * @returns true if device supports touch
 */
export function isTouchDevice(): boolean {
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
 * Get safe area insets (for mobile notches)
<<<<<<< HEAD
 *
 * @returns Insets object
 */
export function getSafeAreaInsets() {
  if (
    typeof window === "undefined" ||
    !CSS.supports("padding: env(safe-area-inset-top)")
  ) {
=======
 * 
 * @returns Insets object
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined' || !CSS.supports('padding: env(safe-area-inset-top)')) {
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const computed = getComputedStyle(document.documentElement);
<<<<<<< HEAD

  return {
    top: parseInt(computed.getPropertyValue("--safe-area-inset-top") || "0"),
    right: parseInt(
      computed.getPropertyValue("--safe-area-inset-right") || "0",
    ),
    bottom: parseInt(
      computed.getPropertyValue("--safe-area-inset-bottom") || "0",
    ),
    left: parseInt(computed.getPropertyValue("--safe-area-inset-left") || "0"),
=======
  
  return {
    top: parseInt(computed.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(computed.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(computed.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(computed.getPropertyValue('--safe-area-inset-left') || '0'),
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
  };
}

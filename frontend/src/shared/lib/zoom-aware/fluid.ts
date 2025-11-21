/**
 * @fileoverview Zoom-Aware Fluid Utilities
 * @module shared/lib/zoom-aware/fluid
 * @description Utilities for creating zoom/scale-aware UI elements that adapt to any resolution or zoom level
 */

/**
 * Creates a fluid value using clamp() that scales smoothly between min and max
 * @param min - Minimum value (in rem or px)
 * @param preferred - Preferred value (in vw, rem, or percentage)
 * @param max - Maximum value (in rem or px)
 * @returns CSS clamp() string
 *
 * @example
 * ```tsx
 * fontSize: fluid("0.875rem", "2vw + 0.5rem", "1.125rem")
 * // Result: clamp(0.875rem, 2vw + 0.5rem, 1.125rem)
 * ```
 */
export function fluid(min: string, preferred: string, max: string): string {
  return `clamp(${min}, ${preferred}, ${max})`;
}

/**
 * Creates a fluid spacing value that scales with viewport
 * @param min - Minimum spacing (in rem)
 * @param max - Maximum spacing (in rem)
 * @param viewportUnit - Viewport unit multiplier (default: 1vw)
 * @returns CSS clamp() string
 *
 * @example
 * ```tsx
 * padding: fluidSpacing("0.5rem", "2rem", 0.5)
 * // Result: clamp(0.5rem, 0.5vw + 0.5rem, 2rem)
 * ```
 */
export function fluidSpacing(
  min: string,
  max: string,
  viewportUnit: number = 1,
): string {
  const preferred = `${viewportUnit}vw + ${min}`;
  return fluid(min, preferred, max);
}

/**
 * Creates a fluid font size that scales with viewport
 * @param min - Minimum font size (in rem)
 * @param max - Maximum font size (in rem)
 * @param viewportUnit - Viewport unit multiplier (default: 0.5)
 * @returns CSS clamp() string
 *
 * @example
 * ```tsx
 * fontSize: fluidFontSize("0.875rem", "1.125rem")
 * // Result: clamp(0.875rem, 0.5vw + 0.875rem, 1.125rem)
 * ```
 */
export function fluidFontSize(
  min: string,
  max: string,
  viewportUnit: number = 0.5,
): string {
  return fluidSpacing(min, max, viewportUnit);
}

/**
 * Creates a fluid container width that adapts to viewport
 * @param min - Minimum width (in rem or percentage)
 * @param max - Maximum width (in rem or percentage)
 * @param preferred - Preferred width (default: 100%)
 * @returns CSS clamp() string
 *
 * @example
 * ```tsx
 * width: fluidWidth("90%", "100%", "min(100%, 1200px)")
 * // Result: clamp(90%, min(100%, 1200px), 100%)
 * ```
 */
export function fluidWidth(
  min: string,
  max: string,
  preferred: string = "100%",
): string {
  return fluid(min, preferred, max);
}

/**
 * Creates a fluid height that adapts to viewport
 * @param min - Minimum height (in rem or vh)
 * @param max - Maximum height (in rem or vh)
 * @param preferred - Preferred height (default: auto)
 * @returns CSS clamp() string
 *
 * @example
 * ```tsx
 * height: fluidHeight("200px", "400px", "50vh")
 * // Result: clamp(200px, 50vh, 400px)
 * ```
 */
export function fluidHeight(
  min: string,
  max: string,
  preferred: string = "auto",
): string {
  return fluid(min, preferred, max);
}

/**
 * Creates a responsive gap that scales with container
 * @param min - Minimum gap (in rem)
 * @param max - Maximum gap (in rem)
 * @param containerUnit - Container unit multiplier (default: 0.5)
 * @returns CSS clamp() string
 *
 * @example
 * ```tsx
 * gap: responsiveGap("0.5rem", "2rem")
 * // Result: clamp(0.5rem, 0.5cqw + 0.5rem, 2rem)
 * ```
 */
export function responsiveGap(
  min: string,
  max: string,
  containerUnit: number = 0.5,
): string {
  // Use container query units if supported, fallback to viewport
  const preferred = `max(${containerUnit}cqw, ${containerUnit}vw) + ${min}`;
  return fluid(min, preferred, max);
}

/**
 * Creates a safe min-width that prevents elements from becoming too small
 * @param base - Base minimum width (in rem)
 * @returns CSS min-width value
 *
 * @example
 * ```tsx
 * minWidth: safeMinWidth("12rem")
 * // Result: min(12rem, 100%)
 * ```
 */
export function safeMinWidth(base: string): string {
  return `min(${base}, 100%)`;
}

/**
 * Creates a safe max-width that prevents elements from becoming too large
 * @param base - Base maximum width (in rem or percentage)
 * @returns CSS max-width value
 *
 * @example
 * ```tsx
 * maxWidth: safeMaxWidth("1200px")
 * // Result: min(1200px, 100%)
 * ```
 */
export function safeMaxWidth(base: string): string {
  return `min(${base}, 100%)`;
}

/**
 * Converts px to rem for better zoom scaling
 * @param px - Pixel value
 * @param baseFontSize - Base font size in px (default: 16)
 * @returns Rem value as string
 *
 * @example
 * ```tsx
 * fontSize: pxToRem(16) // "1rem"
 * fontSize: pxToRem(24) // "1.5rem"
 * ```
 */
export function pxToRem(px: number, baseFontSize: number = 16): string {
  return `${px / baseFontSize}rem`;
}

/**
 * Creates a container query-aware value
 * @param min - Minimum value
 * @param max - Maximum value
 * @param containerUnit - Container query unit (default: "cqw" for width)
 * @returns CSS clamp() string with container queries
 *
 * @example
 * ```tsx
 * fontSize: containerAware("0.875rem", "1.125rem", "cqw")
 * // Result: clamp(0.875rem, 0.5cqw + 0.875rem, 1.125rem)
 * ```
 */
export function containerAware(
  min: string,
  max: string,
  containerUnit: "cqw" | "cqh" | "cqi" | "cqb" | "cqmin" | "cqmax" = "cqw",
): string {
  const preferred = `0.5${containerUnit} + ${min}`;
  return fluid(min, preferred, max);
}

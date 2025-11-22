/**
 * @fileoverview Responsive Breakpoints Configuration
 * @module shared/config/breakpoints
 * @description Mobile-first responsive breakpoint definitions aligned with Design System v3
 *
 * @deprecated This file uses FSD-specific breakpoint names. For new code, use Design System v3 breakpoints directly.
 * This file is kept for backward compatibility and provides mapping to Design System v3 breakpoints.
 */

import { breakpoints as DSBreakpoints } from "@/App/theme/designSystem.v3";

/**
 * Responsive breakpoints aligned with Design System v3
 * Maps FSD-specific names to Design System v3 breakpoints
 */
export const breakpoints = {
  /** Mobile devices (320px+) - Maps to DS xs */
  mobile: DSBreakpoints.xs,
  /** Small tablets (480px+) - Maps to DS sm */
  sm: DSBreakpoints.sm,
  /** Tablets (768px+) - Maps to DS md */
  tablet: DSBreakpoints.md,
  md: DSBreakpoints.md,
  /** Small laptops (1024px+) - Maps to DS lg */
  desktop: DSBreakpoints.lg,
  lg: DSBreakpoints.lg,
  /** Desktop (1366px+) - Maps to DS xl */
  wide: DSBreakpoints.xl,
  xl: DSBreakpoints.xl,
  /** Large desktop (1920px+) - Maps to DS xxl */
  "2xl": DSBreakpoints.xxl,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Media query helper - creates min-width media query string
 */
export const mediaQuery = {
  mobile: `(min-width: ${breakpoints.mobile}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  tablet: `(min-width: ${breakpoints.tablet}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  desktop: `(min-width: ${breakpoints.desktop}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  wide: `(min-width: ${breakpoints.wide}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  "2xl": `(min-width: ${breakpoints["2xl"]}px)`,
} as const;

/**
 * Get current breakpoint name based on window width
 */
export function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints["2xl"]) return "2xl";
  if (width >= breakpoints.xl) return "xl";
  if (width >= breakpoints.lg) return "lg";
  if (width >= breakpoints.md) return "md";
  if (width >= breakpoints.sm) return "sm";
  return "mobile";
}

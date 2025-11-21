/**
 * @fileoverview Responsive Breakpoints Configuration
 * @module shared/config/breakpoints
 * @description Mobile-first responsive breakpoint definitions for FSD architecture
 */

/**
 * Responsive breakpoints following mobile-first approach
 */
export const breakpoints = {
  /** Mobile devices (320px+) */
  mobile: 320,
  /** Small tablets (640px+) */
  sm: 640,
  /** Tablets (768px+) */
  tablet: 768,
  md: 768,
  /** Small laptops (1024px+) */
  desktop: 1024,
  lg: 1024,
  /** Desktop (1280px+) */
  wide: 1280,
  xl: 1280,
  /** Large desktop (1536px+) */
<<<<<<< HEAD
  "2xl": 1536,
=======
  '2xl': 1536,
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
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
<<<<<<< HEAD
  "2xl": `(min-width: ${breakpoints["2xl"]}px)`,
=======
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
} as const;

/**
 * Get current breakpoint name based on window width
 */
export function getCurrentBreakpoint(width: number): Breakpoint {
<<<<<<< HEAD
  if (width >= breakpoints["2xl"]) return "2xl";
  if (width >= breakpoints.xl) return "xl";
  if (width >= breakpoints.lg) return "lg";
  if (width >= breakpoints.md) return "md";
  if (width >= breakpoints.sm) return "sm";
  return "mobile";
=======
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'mobile';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
}

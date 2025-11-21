/**
 * Responsive Utilities
 * Comprehensive responsive design utilities for grid system and layouts
 * @version 3.0 - Enhanced for ultra-wide display support
 */

import * as DS from "./designSystem.v3";

const spacingUnit = DS.spacing["1"];

const multiply = (value: number) => value * spacingUnit;

/**
 * Responsive spacing helper - Apply different spacing values at different breakpoints
 * @example responsive.spacing(2, 3, 4, 5, 6, 7, 8) // xs, sm, md, lg, xl, xxl, xxxl
 */
export const responsive = {
  spacing: (
    xs: number,
    sm?: number,
    md?: number,
    lg?: number,
    xl?: number,
    xxl?: number,
    xxxl?: number,
  ) => ({
    xs: multiply(xs),
    ...(sm && { sm: multiply(sm) }),
    ...(md && { md: multiply(md) }),
    ...(lg && { lg: multiply(lg) }),
    ...(xl && { xl: multiply(xl) }),
    ...(xxl && { xxl: multiply(xxl) }),
    ...(xxxl && { xxxl: multiply(xxxl) }),
  }),
  fontSize: (
    xs: string,
    sm?: string,
    md?: string,
    lg?: string,
    xl?: string,
    xxl?: string,
    xxxl?: string,
  ) => ({
    xs,
    ...(sm && { sm }),
    ...(md && { md }),
    ...(lg && { lg }),
    ...(xl && { xl }),
    ...(xxl && { xxl }),
    ...(xxxl && { xxxl }),
  }),
  padding: (
    xs: number,
    sm?: number,
    md?: number,
    lg?: number,
    xl?: number,
    xxl?: number,
    xxxl?: number,
  ) => ({
    xs: multiply(xs),
    ...(sm && { sm: multiply(sm) }),
    ...(md && { md: multiply(md) }),
    ...(lg && { lg: multiply(lg) }),
    ...(xl && { xl: multiply(xl) }),
    ...(xxl && { xxl: multiply(xxl) }),
    ...(xxxl && { xxxl: multiply(xxxl) }),
  }),
  margin: (
    xs: number,
    sm?: number,
    md?: number,
    lg?: number,
    xl?: number,
    xxl?: number,
    xxxl?: number,
  ) => ({
    xs: multiply(xs),
    ...(sm && { sm: multiply(sm) }),
    ...(md && { md: multiply(md) }),
    ...(lg && { lg: multiply(lg) }),
    ...(xl && { xl: multiply(xl) }),
    ...(xxl && { xxl: multiply(xxl) }),
    ...(xxxl && { xxxl: multiply(xxxl) }),
  }),
};

/**
 * Grid spacing presets for common use cases
 */
export const gridSpacing = {
  tight: { xs: spacingUnit, sm: multiply(1.5), md: multiply(2) },
  normal: { xs: multiply(2), md: multiply(3), lg: multiply(4) },
  loose: { xs: multiply(3), md: multiply(4), lg: multiply(5), xl: multiply(6) },
  wide: { xs: multiply(4), md: multiply(5), lg: multiply(6), xl: multiply(8) },
} as const;

/**
 * Grid column configurations for responsive layouts
 * Automatically adjusts number of columns based on screen size
 */
export const gridSizes = {
  // Feature cards: 1 col mobile → 4 cols ultra-wide
  featureCard: { item: true, xs: 12, sm: 6, md: 4, lg: 3 },
  // Stat cards: 1 col mobile → 4 cols desktop
  statCard: { item: true, xs: 12, sm: 6, md: 3 },
  // Form sections: 1 col mobile → 2 cols desktop
  formSection: { item: true, xs: 12, md: 6 },
  // Full width sections
  fullSection: { item: true, xs: 12 },
  // Half sections for larger screens
  halfSection: { item: true, xs: 12, md: 6 },
  // Third sections
  thirdSection: { item: true, xs: 12, sm: 6, md: 4 },
  // Quarter sections
  quarterSection: { item: true, xs: 12, sm: 6, md: 3 },
  // Dashboard cards: 1 col mobile → 3 cols wide
  dashboardCard: { item: true, xs: 12, sm: 6, lg: 4 },
  // Product cards: 1 col mobile → 5 cols ultra-wide
  productCard: { item: true, xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 },
} as const;

/**
 * Container sizes with max-width constraints
 * Uses design system containerMaxWidths
 */
export const containerSizes = DS.containerMaxWidths;

/**
 * Container helper - Creates responsive container with padding
 * @param size - Max width size (xs, sm, md, lg, xl, xxl, xxxl)
 */
export const container = (size: keyof typeof containerSizes = "xl") => ({
  maxWidth: containerSizes[size],
  mx: "auto",
  px: responsive.padding(2, 3, 4, 5, 6),
});

/**
 * Media query helpers for custom breakpoints
 */
export const mediaQuery = {
  up: (breakpoint: keyof typeof DS.breakpoints) =>
    `@media (min-width: ${DS.breakpoints[breakpoint]}px)`,
  down: (breakpoint: keyof typeof DS.breakpoints) =>
    `@media (max-width: ${DS.breakpoints[breakpoint] - 1}px)`,
  between: (
    start: keyof typeof DS.breakpoints,
    end: keyof typeof DS.breakpoints,
  ) =>
    `@media (min-width: ${DS.breakpoints[start]}px) and (max-width: ${
      DS.breakpoints[end] - 1
    }px)`,
  only: (breakpoint: keyof typeof DS.breakpoints) => {
    const breakpointKeys = Object.keys(DS.breakpoints) as Array<keyof typeof DS.breakpoints>;
    const currentIndex = breakpointKeys.indexOf(breakpoint);
    if (currentIndex === breakpointKeys.length - 1) {
      return `@media (min-width: ${DS.breakpoints[breakpoint]}px)`;
    }
    const nextBreakpoint = breakpointKeys[currentIndex + 1];
    return `@media (min-width: ${DS.breakpoints[breakpoint]}px) and (max-width: ${DS.breakpoints[nextBreakpoint] - 1}px)`;
  },
};

/**
 * Responsive layout presets for common UI patterns
 */
export const layouts = {
  hero: {
    textAlign: "center" as const,
    py: responsive.padding(6, 8, 10, 12, 16),
    px: responsive.padding(2, 3, 4, 5, 6),
  },
  section: {
    py: responsive.padding(4, 6, 8, 10, 12),
    px: responsive.padding(2, 3, 4, 5, 6),
  },
  cardGrid: {
    spacing: gridSpacing.normal,
    sx: {
      mb: responsive.margin(4, 6, 8),
    },
  },
  form: {
    maxWidth: { xs: "100%", md: 600 },
    mx: "auto",
    p: responsive.padding(3, 4, 5),
  },
  sidebar: {
    width: { xs: "100%", md: 280, lg: 320 },
    flexShrink: 0,
  },
  mainWithSidebar: {
    flexGrow: 1,
    p: responsive.padding(2, 3, 4, 5),
    ml: { xs: 0, md: 280, lg: 320 },
  },
  dashboard: {
    container: {
      maxWidth: { xs: "100%", xl: 1440, xxl: 1920 },
      mx: "auto",
      p: responsive.padding(2, 3, 4, 5, 6),
    },
    grid: {
      spacing: { xs: 2, sm: 3, md: 4 },
    },
  },
} as const;

/**
 * Component size variants with responsive considerations
 */
export const componentVariants = {
  button: {
    small: {
      height: DS.componentSizes.button.sm.height,
      px: multiply(2),
      fontSize: DS.componentSizes.button.sm.fontSize,
    },
    medium: {
      height: DS.componentSizes.button.md.height,
      px: multiply(3),
      fontSize: DS.componentSizes.button.md.fontSize,
    },
    large: {
      height: DS.componentSizes.button.lg.height,
      px: multiply(4),
      fontSize: DS.componentSizes.button.lg.fontSize,
    },
    // Touch-friendly sizes for mobile (min 44x44px)
    touchFriendly: {
      minHeight: 44,
      minWidth: 44,
      px: multiply(4),
    },
  },
  card: {
    compact: {
      p: responsive.padding(2, 3),
    },
    comfortable: {
      p: responsive.padding(3, 4, 5),
    },
    spacious: {
      p: responsive.padding(4, 5, 6, 8),
    },
  },
  avatar: DS.componentSizes.avatar,
} as const;

/**
 * Animation and transition presets
 */
export const animations = {
  transition: {
    fast: DS.transitions.fast,
    normal: DS.transitions.base,
    slow: DS.transitions.slow,
  },
  hover: {
    scale: DS.transitions.transform,
    lift: DS.transitions.base,
  },
} as const;

/**
 * Touch target sizes for accessibility
 * Minimum 44x44px for touch-friendly interfaces
 */
export const touchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 56,
} as const;

/**
 * Typography scale for responsive text
 * Returns appropriate font size based on screen size
 */
export const responsiveTypography = {
  display: {
    fontSize: DS.fluidTypography.display.lg,
    lineHeight: DS.lineHeight.tight,
    fontWeight: DS.fontWeight.bold,
  },
  h1: {
    fontSize: DS.fluidTypography.heading.h1,
    lineHeight: DS.lineHeight.tight,
    fontWeight: DS.fontWeight.bold,
  },
  h2: {
    fontSize: DS.fluidTypography.heading.h2,
    lineHeight: DS.lineHeight.snug,
    fontWeight: DS.fontWeight.bold,
  },
  h3: {
    fontSize: DS.fluidTypography.heading.h3,
    lineHeight: DS.lineHeight.snug,
    fontWeight: DS.fontWeight.semibold,
  },
  body: {
    fontSize: DS.fluidTypography.body.base,
    lineHeight: DS.lineHeight.normal,
    fontWeight: DS.fontWeight.normal,
  },
} as const;

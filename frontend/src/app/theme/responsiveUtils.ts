/**
 * Responsive Utilities
 * Grid sistem ve responsive tasarım için yardımcı fonksiyonlar
 */

import * as DS from "./designSystem.v2";

const spacingUnit = DS.spacing["1"];

const multiply = (value: number) => value * spacingUnit;

export const responsive = {
  spacing: (
    xs: number,
    sm?: number,
    md?: number,
    lg?: number,
    xl?: number,
  ) => ({
    xs: multiply(xs),
    ...(sm && { sm: multiply(sm) }),
    ...(md && { md: multiply(md) }),
    ...(lg && { lg: multiply(lg) }),
    ...(xl && { xl: multiply(xl) }),
  }),
  fontSize: (
    xs: string,
    sm?: string,
    md?: string,
    lg?: string,
    xl?: string,
  ) => ({
    xs,
    ...(sm && { sm }),
    ...(md && { md }),
    ...(lg && { lg }),
    ...(xl && { xl }),
  }),
  padding: (xs: number, md?: number, lg?: number) => ({
    xs: multiply(xs),
    ...(md && { md: multiply(md) }),
    ...(lg && { lg: multiply(lg) }),
  }),
  margin: (xs: number, md?: number, lg?: number) => ({
    xs: multiply(xs),
    ...(md && { md: multiply(md) }),
    ...(lg && { lg: multiply(lg) }),
  }),
};

export const gridSpacing = {
  tight: { xs: spacingUnit, md: multiply(2) },
  normal: { xs: multiply(2), md: multiply(3) },
  loose: { xs: multiply(3), md: multiply(4), lg: multiply(5) },
  wide: { xs: multiply(4), md: multiply(5), lg: multiply(6) },
} as const;

export const gridSizes = {
  featureCard: { item: true, xs: 12, sm: 6, md: 4, lg: 3 },
  statCard: { item: true, xs: 12, sm: 6, md: 3 },
  formSection: { item: true, xs: 12, md: 6 },
  fullSection: { item: true, xs: 12 },
  halfSection: { item: true, xs: 12, md: 6 },
  thirdSection: { item: true, xs: 12, md: 4 },
  quarterSection: { item: true, xs: 12, sm: 6, md: 3 },
} as const;

export const containerSizes = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
  full: "100%",
} as const;

export const container = (size: keyof typeof containerSizes = "xl") => ({
  maxWidth: containerSizes[size],
  mx: "auto",
  px: responsive.padding(2, 3, 4),
});

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
};

export const layouts = {
  hero: {
    textAlign: "center" as const,
    py: responsive.padding(6, 8, 12),
    px: responsive.padding(2, 4),
  },
  section: {
    py: responsive.padding(4, 6, 8),
    px: responsive.padding(2, 3, 4),
  },
  cardGrid: {
    spacing: gridSpacing.normal,
    sx: {
      mb: responsive.margin(4, 6),
    },
  },
  form: {
    maxWidth: 600,
    mx: "auto",
    p: responsive.padding(3, 4),
  },
  sidebar: {
    width: { xs: "100%", md: 280 },
    flexShrink: 0,
  },
  mainWithSidebar: {
    flexGrow: 1,
    p: responsive.padding(2, 3, 4),
    ml: { xs: 0, md: 280 },
  },
} as const;

export const componentVariants = {
  button: {
    small: {
      height: DS.componentSizes.button.small.height,
      px: multiply(2),
      fontSize: DS.componentSizes.button.small.fontSize,
    },
    medium: {
      height: DS.componentSizes.button.medium.height,
      px: multiply(3),
      fontSize: DS.componentSizes.button.medium.fontSize,
    },
    large: {
      height: DS.componentSizes.button.large.height,
      px: multiply(4),
      fontSize: DS.componentSizes.button.large.fontSize,
    },
  },
  card: {
    compact: {
      p: responsive.padding(2),
    },
    comfortable: {
      p: responsive.padding(3, 4),
    },
    spacious: {
      p: responsive.padding(4, 5, 6),
    },
  },
  avatar: DS.componentSizes.avatar,
} as const;

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

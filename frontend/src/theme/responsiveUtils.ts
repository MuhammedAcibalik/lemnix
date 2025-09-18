/**
 * Responsive Utilities
 * Grid sistem ve responsive tasarım için yardımcı fonksiyonlar
 */

import { breakpoints, spacing } from './designSystem';

// ============================================================================
// RESPONSIVE HELPERS
// ============================================================================

/**
 * Responsive değer oluşturucu - daha esnek kullanım
 */
export const responsive = {
  /**
   * Spacing değerleri için responsive helper
   */
  spacing: (xs: number, sm?: number, md?: number, lg?: number, xl?: number) => ({
    xs: spacing.xs * xs,
    ...(sm && { sm: spacing.xs * sm }),
    ...(md && { md: spacing.xs * md }),
    ...(lg && { lg: spacing.xs * lg }),
    ...(xl && { xl: spacing.xs * xl }),
  }),

  /**
   * Font size için responsive helper
   */
  fontSize: (xs: string, sm?: string, md?: string, lg?: string, xl?: string) => ({
    xs,
    ...(sm && { sm }),
    ...(md && { md }),
    ...(lg && { lg }),
    ...(xl && { xl }),
  }),

  /**
   * Padding için responsive helper
   */
  padding: (xs: number, md?: number, lg?: number) => ({
    xs: spacing.xs * xs,
    ...(md && { md: spacing.xs * md }),
    ...(lg && { lg: spacing.xs * lg }),
  }),

  /**
   * Margin için responsive helper
   */
  margin: (xs: number, md?: number, lg?: number) => ({
    xs: spacing.xs * xs,
    ...(md && { md: spacing.xs * md }),
    ...(lg && { lg: spacing.xs * lg }),
  }),
};

// ============================================================================
// GRID SYSTEM HELPERS
// ============================================================================

/**
 * Standart grid spacing değerleri
 */
export const gridSpacing = {
  tight: { xs: 1, md: 2 },
  normal: { xs: 2, md: 3 },
  loose: { xs: 3, md: 4, lg: 5 },
  wide: { xs: 4, md: 5, lg: 6 },
} as const;

/**
 * Responsive grid item boyutları
 */
export const gridSizes = {
  // Feature cards
  featureCard: { item: true, xs: 12, sm: 6, md: 4, lg: 3 },
  // Stat cards  
  statCard: { item: true, xs: 12, sm: 6, md: 3 },
  // Form sections
  formSection: { item: true, xs: 12, md: 6 },
  // Full width sections
  fullSection: { item: true, xs: 12 },
  // Half sections
  halfSection: { item: true, xs: 12, md: 6 },
  // Third sections
  thirdSection: { item: true, xs: 12, md: 4 },
  // Quarter sections
  quarterSection: { item: true, xs: 12, sm: 6, md: 3 },
} as const;

// ============================================================================
// CONTAINER UTILITIES
// ============================================================================

/**
 * Container max-width değerleri
 */
export const containerSizes = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  full: '100%',
} as const;

/**
 * Responsive container helper
 */
export const container = (size: keyof typeof containerSizes = 'xl') => ({
  maxWidth: containerSizes[size],
  mx: 'auto',
  px: responsive.padding(2, 3, 4),
});

// ============================================================================
// MEDIA QUERY HELPERS
// ============================================================================

/**
 * Media query oluşturucu
 */
export const mediaQuery = {
  up: (breakpoint: keyof typeof breakpoints) => `@media (min-width: ${breakpoints[breakpoint]}px)`,
  down: (breakpoint: keyof typeof breakpoints) => `@media (max-width: ${breakpoints[breakpoint] - 1}px)`,
  between: (start: keyof typeof breakpoints, end: keyof typeof breakpoints) => 
    `@media (min-width: ${breakpoints[start]}px) and (max-width: ${breakpoints[end] - 1}px)`,
};

// ============================================================================
// LAYOUT PRESETS
// ============================================================================

/**
 * Yaygın layout desenleri
 */
export const layouts = {
  // Ana sayfa hero section
  hero: {
    textAlign: 'center' as const,
    py: responsive.padding(6, 8, 12),
    px: responsive.padding(2, 4),
  },

  // Section wrapper
  section: {
    py: responsive.padding(4, 6, 8),
    px: responsive.padding(2, 3, 4),
  },

  // Card grid
  cardGrid: {
    spacing: gridSpacing.normal,
    sx: {
      mb: responsive.margin(4, 6),
    },
  },

  // Form layout
  form: {
    maxWidth: 600,
    mx: 'auto',
    p: responsive.padding(3, 4),
  },

  // Sidebar layout
  sidebar: {
    width: { xs: '100%', md: 280 },
    flexShrink: 0,
  },

  // Main content with sidebar
  mainWithSidebar: {
    flexGrow: 1,
    p: responsive.padding(2, 3, 4),
    ml: { xs: 0, md: 280 },
  },
} as const;

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

/**
 * Bileşen varyantları için responsive değerler
 */
export const componentVariants = {
  button: {
    small: {
      height: 32,
      px: 2,
      fontSize: '0.875rem',
    },
    medium: {
      height: 40,
      px: 3,
      fontSize: '0.875rem',
    },
    large: {
      height: 48,
      px: 4,
      fontSize: '1rem',
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

  avatar: {
    small: { width: 32, height: 32 },
    medium: { width: 40, height: 40 },
    large: { width: 56, height: 56 },
    xlarge: { width: 72, height: 72 },
  },
} as const;

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

/**
 * Yaygın animasyon değerleri
 */
export const animations = {
  transition: {
    fast: 'all 0.15s ease-in-out',
    normal: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.5s ease-in-out',
  },
  
  hover: {
    scale: 'transform 0.2s ease-in-out',
    lift: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

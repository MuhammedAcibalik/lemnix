/**
 * @fileoverview Design System - Barrel Export
 * @module shared/design-system
 * @version 3.0.0
 *
 * @description
 * Central export point for all design system tokens, theme, and utilities.
 * Provides a clean API for consuming the design system throughout the application.
 *
 * @example
 * ```tsx
 * // Import tokens
 * import { colors, spacing, typography } from '@/shared/design-system';
 *
 * // Import theme
 * import { theme } from '@/shared/design-system';
 *
 * // Import utilities
 * import { withOpacity, createGradient } from '@/shared/design-system';
 * ```
 */

// ============================================================================
// DESIGN TOKENS
// ============================================================================

export {
  // Color system
  colors,
  brandColors,
  semanticColors,
  neutralColors,
  slateColors,
  functionalColors,

  // Spacing system
  spacing,
  spacingScale,

  // Typography system
  typography,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,

  // Visual tokens
  borderRadius,
  shadows,
  gradients,

  // Animation tokens
  transitions,
  duration,
  easing,

  // Layout tokens
  zIndex,
  breakpoints,
  componentSizes,

  // Backward compatibility
  componentSizesCompat,
  spacingCompat,

  // Modern UI effects
  glass,
  focus,

  // Utility functions
  withOpacity,
  createGradient,
  createGlow,

  // Complete token set
  designTokens,
} from "./tokens";

// ============================================================================
// THEME
// ============================================================================

export {
  theme,
  globalStyles,
  designSystem,
  default as themeDefault,
} from "./theme";

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Export useful types for TypeScript consumers
export type { DesignSystem } from "../hooks/useDesignSystem";

/**
 * @fileoverview Design System Hook
 * @module shared/hooks
 * @version 3.0.0
 *
 * @description
 * Type-safe React hook for accessing design system tokens and utilities.
 * Provides helper functions for common design system operations.
 *
 * @example
 * ```tsx
 * const ds = useDesignSystem();
 *
 * <Box sx={{
 *   backgroundColor: ds.getColor('primary.600'),
 *   padding: ds.getSpacing('4'),
 *   borderRadius: ds.getBorderRadius('lg'),
 *   boxShadow: ds.getShadow('soft.md'),
 *   ...ds.getGlassStyle('light'),
 * }} />
 * ```
 */

import { useTheme } from "@mui/material";
import * as tokens from "../design-system/tokens";

// Helper type for nested object access
type NestedObject = {
  [key: string]: string | number | NestedObject;
};

/**
 * Design System Hook
 *
 * Provides type-safe access to all design system values and utilities.
 * Integrates with Material-UI theme for seamless integration.
 */
export const useDesignSystem = () => {
  const muiTheme = useTheme();

  /**
   * Get color by path (supports dot notation)
   * @param path - Color path (e.g., 'primary.600', 'success.main')
   * @returns Color value as string
   * @example getColor('primary.600') → '#2563eb'
   */
  const getColor = (path: string): string => {
    const keys = path.split(".");
    let value: NestedObject | string | number = tokens.colors;

    for (const key of keys) {
      if (typeof value === "object" && value !== null && key in value) {
        value = value[key];
      } else {
        console.warn(`Color path "${path}" not found in design system`);
        return "#000000";
      }
    }

    return typeof value === "string" ? value : String(value);
  };

  /**
   * Get spacing value
   * @param size - Spacing key
   * @returns Spacing value in pixels
   * @example getSpacing('4') → 16
   */
  const getSpacing = (size: keyof typeof tokens.spacing): number => {
    return tokens.spacing[size];
  };

  /**
   * Get component size configuration
   * @param component - Component name
   * @param size - Size variant
   * @returns Size configuration object
   */
  const getComponentSize = (
    component: keyof typeof tokens.componentSizes,
    size: "xs" | "sm" | "md" | "lg" | "xl"
  ) => {
    return tokens.componentSizes[component][size];
  };

  /**
   * Get shadow by path (supports dot notation)
   * @param path - Shadow path (e.g., 'soft.md', 'button.hover')
   * @returns Shadow value as string
   * @example getShadow('soft.md') → '0 6px 12px rgba(...)'
   */
  const getShadow = (path: string): string => {
    const keys = path.split(".");
    let value: NestedObject | string | number = tokens.shadows;

    for (const key of keys) {
      if (typeof value === "object" && value !== null && key in value) {
        value = value[key];
      } else {
        console.warn(`Shadow path "${path}" not found`);
        return "none";
      }
    }

    return typeof value === "string" ? value : String(value);
  };

  /**
   * Get border radius value
   * @param key - Border radius key
   * @returns Border radius in pixels
   */
  const getBorderRadius = (key: keyof typeof tokens.borderRadius): number => {
    return tokens.borderRadius[key];
  };

  /**
   * Get gradient by path (supports dot notation)
   * @param key - Gradient path (e.g., 'primary.default', 'mesh.hero')
   * @returns Gradient value as string
   */
  const getGradient = (key: string): string => {
    const keys = key.split(".");
    let value: NestedObject | string | number = tokens.gradients;

    for (const k of keys) {
      if (typeof value === "object" && value !== null && k in value) {
        value = value[k];
      } else {
        return tokens.gradients.primary.default;
      }
    }

    return typeof value === "string" ? value : String(value);
  };

  /**
   * Get z-index value
   * @param key - Z-index key
   * @returns Z-index value
   */
  const getZIndex = (key: keyof typeof tokens.zIndex): number | string => {
    return tokens.zIndex[key];
  };

  /**
   * Get typography style by path
   * @param path - Typography path (e.g., 'heading.h1', 'body.base')
   * @returns Typography style object or value
   */
  const getTypography = (
    path: string
  ): Record<string, unknown> | string | number => {
    const keys = path.split(".");
    let value: NestedObject | string | number = tokens.typography;

    for (const key of keys) {
      if (typeof value === "object" && value !== null && key in value) {
        value = value[key];
      } else {
        return tokens.typography.body.base;
      }
    }

    return value;
  };

  /**
   * Get transition value
   * @param type - Transition type
   * @returns Transition value as string or object
   */
  const getTransition = (
    type: keyof typeof tokens.transitions
  ): string | Record<string, unknown> => {
    return tokens.transitions[type] as string | Record<string, unknown>;
  };

  /**
   * Add opacity to a color
   * @param color - Hex color string
   * @param opacity - Opacity value (0-1)
   * @returns Hex color with opacity
   * @example withOpacity('#3b82f6', 0.5) → '#3b82f680'
   */
  const withOpacity = (color: string, opacity: number): string => {
    return tokens.withOpacity(color, opacity);
  };

  /**
   * Create a custom gradient
   * @param color1 - Start color
   * @param color2 - End color
   * @param angle - Gradient angle in degrees (default: 135)
   * @returns CSS gradient string
   * @example createGradient('#3b82f6', '#9333ea') → 'linear-gradient(135deg, ...)'
   */
  const createGradient = (
    color1: string,
    color2: string,
    angle?: number
  ): string => {
    return tokens.createGradient(color1, color2, angle);
  };

  /**
   * Create a glow effect
   * @param color - Glow color
   * @param intensity - Intensity (0-1, default: 0.4)
   * @returns CSS box-shadow string
   * @example createGlow('#3b82f6', 0.5) → '0 0 20px rgba(...)'
   */
  const createGlow = (color: string, intensity?: number): string => {
    return tokens.createGlow(color, intensity);
  };

  /**
   * Get glass morphism style
   * @param variant - Glass variant ('light', 'medium', 'strong', 'dark')
   * @returns Glass morphism style object
   * @example getGlassStyle('light') → { background: '...', border: '...', ... }
   */
  const getGlassStyle = (
    variant: "light" | "medium" | "strong" | "dark" = "light"
  ) => {
    return {
      background: tokens.glass[variant].background,
      border: tokens.glass[variant].border,
      backdropFilter: tokens.glass[variant].backdropFilter,
      boxShadow: tokens.glass[variant].boxShadow,
    };
  };

  /**
   * Get focus ring style
   * @param variant - Focus variant
   * @returns Focus ring style object
   * @example getFocusRing('primary') → { outline: 'none', boxShadow: '...' }
   */
  const getFocusRing = (
    variant:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "error" = "default"
  ) => {
    return {
      outline: "none",
      boxShadow: `${tokens.focus.ring[variant]}, ${tokens.focus.offset}`,
    };
  };

  return {
    // Raw token values (direct access) with backward compatibility
    colors: tokens.colors,
    spacing: { ...tokens.spacing, ...tokens.spacingScale, ...tokens.spacingCompat },
    typography: tokens.typography,
    componentSizes: tokens.componentSizesCompat,
    shadows: tokens.shadows,
    borderRadius: tokens.borderRadius,
    gradients: tokens.gradients,
    transitions: tokens.transitions,
    zIndex: tokens.zIndex,
    glass: tokens.glass,
    focus: tokens.focus,
    breakpoints: tokens.breakpoints,
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize,
    fontWeight: tokens.fontWeight,
    lineHeight: tokens.lineHeight,
    letterSpacing: tokens.letterSpacing,
    duration: tokens.duration,
    easing: tokens.easing,

    // Material-UI theme
    muiTheme,

    // Helper functions
    getColor,
    getSpacing,
    getComponentSize,
    getShadow,
    getBorderRadius,
    getGradient,
    getZIndex,
    getTypography,
    getTransition,
    withOpacity,
    createGradient,
    createGlow,
    getGlassStyle,
    getFocusRing,
  };
};

/**
 * Type-safe design system return type
 */
export type DesignSystem = ReturnType<typeof useDesignSystem>;

/**
 * Export individual utilities for convenience
 */
export {
  colors,
  spacing,
  spacingScale,
  typography,
  componentSizes,
  shadows,
  borderRadius,
  gradients,
  transitions,
  zIndex,
  glass,
  focus,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  duration,
  easing,
  breakpoints,
  withOpacity,
  createGradient,
  createGlow,
  designTokens,
} from "../design-system/tokens";

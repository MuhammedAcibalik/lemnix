/**
 * @fileoverview useDesignSystem Hook v3.0
 * @module shared/hooks
 * @version 3.0.0 - Enhanced UI/UX Modernization
 *
 * Modern design system hook with v3 design tokens
 */

import { useTheme } from "@mui/material";
import * as DS from "@/App/theme/designSystem.v3";

// Helper type for nested object access
type NestedObject = {
  [key: string]: string | number | NestedObject;
};

/**
 * Design System Hook v3.0
 *
 * Provides type-safe access to all modern design system v3 values
 *
 * @example
 * ```tsx
 * const ds = useDesignSystem();
 *
 * <Box sx={{
 *   backgroundColor: ds.colors.primary.main,
 *   padding: ds.spacing['4'],
 *   borderRadius: ds.borderRadius.lg,
 *   boxShadow: ds.shadows.soft.md,
 *   transition: ds.transitions.base,
 * }} />
 * ```
 */
export const useDesignSystem = () => {
  const muiTheme = useTheme();

  /**
   * Get color by path (supports dot notation)
   * @example getColor('primary.600') → '#2563eb'
   */
  const getColor = (path: string): string => {
    const keys = path.split(".");
    let value: NestedObject | string | number = DS.colors;

    for (const key of keys) {
      if (typeof value === "object" && value !== null && key in value) {
        const nextValue: NestedObject | string | number | undefined =
          value[key];
        if (nextValue === undefined) {
          console.warn(`Color path "${path}" not found in design system`);
          return "#000000";
        }
        value = nextValue;
      } else {
        console.warn(`Color path "${path}" not found in design system`);
        return "#000000";
      }
    }

    return typeof value === "string" ? value : String(value);
  };

  /**
   * Get spacing value
   * @example getSpacing('4') → 16
   */
  const getSpacing = (size: keyof typeof DS.spacing): number => {
    return DS.spacing[size];
  };

  /**
   * Get component size
   */
  const getComponentSize = <T extends keyof typeof DS.componentSizes>(
    component: T,
    size: keyof (typeof DS.componentSizes)[T],
  ) => {
    return DS.componentSizes[component][size];
  };

  /**
   * Get shadow
   * @example getShadow('soft.md')
   */
  const getShadow = (path: string): string => {
    const keys = path.split(".");
    let value: NestedObject | string | number = DS.shadows;

    for (const key of keys) {
      if (typeof value === "object" && value !== null && key in value) {
        const nextValue: NestedObject | string | number | undefined =
          value[key];
        if (nextValue === undefined) {
          console.warn(`Shadow path "${path}" not found`);
          return "none";
        }
        value = nextValue;
      } else {
        console.warn(`Shadow path "${path}" not found`);
        return "none";
      }
    }

    return typeof value === "string" ? value : String(value);
  };

  /**
   * Get border radius
   */
  const getBorderRadius = (key: keyof typeof DS.borderRadius): number => {
    return DS.borderRadius[key];
  };

  /**
   * Get gradient
   */
  const getGradient = (key: string): string => {
    const keys = key.split(".");
    let value: NestedObject | string | number = DS.gradients;

    for (const k of keys) {
      if (typeof value === "object" && value !== null && k in value) {
        const nextValue: NestedObject | string | number | undefined = value[k];
        if (nextValue === undefined) {
          return DS.gradients.primary.default;
        }
        value = nextValue;
      } else {
        return DS.gradients.primary.default;
      }
    }

    return typeof value === "string" ? value : String(value);
  };

  /**
   * Get z-index
   */
  const getZIndex = (key: keyof typeof DS.zIndex): number | string => {
    return DS.zIndex[key];
  };

  /**
   * Get typography style
   */
  const getTypography = (
    path: string,
  ): Record<string, unknown> | string | number => {
    const keys = path.split(".");
    let value: NestedObject | string | number = DS.typography;

    for (const key of keys) {
      if (typeof value === "object" && value !== null && key in value) {
        const nextValue: NestedObject | string | number | undefined =
          value[key];
        if (nextValue === undefined) {
          return DS.typography.body.base;
        }
        value = nextValue;
      } else {
        return DS.typography.body.base;
      }
    }

    return value;
  };

  /**
   * Get transition
   */
  const getTransition = (
    type: keyof typeof DS.transitions,
  ): string | Record<string, string | number> => {
    return DS.transitions[type];
  };

  /**
   * Add opacity to color
   */
  const withOpacity = (color: string, opacity: number): string => {
    return DS.withOpacity(color, opacity);
  };

  /**
   * Create custom gradient
   */
  const createGradient = (
    color1: string,
    color2: string,
    angle?: number,
  ): string => {
    return DS.createGradient(color1, color2, angle);
  };

  /**
   * Create glow effect
   */
  const createGlow = (color: string, intensity?: number): string => {
    return DS.createGlow(color, intensity);
  };

  /**
   * Get glass morphism style
   */
  const getGlassStyle = (
    variant: "light" | "medium" | "strong" | "dark" = "light",
  ) => {
    return {
      background: DS.glass[variant].background,
      border: DS.glass[variant].border,
      backdropFilter: DS.glass[variant].backdropFilter,
      boxShadow: DS.glass[variant].boxShadow,
    };
  };

  /**
   * Get focus ring style
   */
  const getFocusRing = (
    variant:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "error" = "default",
  ) => {
    return {
      outline: "none",
      boxShadow: `${DS.focus.ring[variant]}, ${DS.focus.offset}`,
    };
  };

  return {
    // Raw values (direct access)
    colors: DS.colors,
    spacing: { ...DS.spacing, ...DS.spacingScale },
    typography: DS.typography,
    componentSizes: DS.componentSizes,
    shadows: DS.shadows,
    borderRadius: DS.borderRadius,
    gradients: DS.gradients,
    transitions: DS.transitions,
    zIndex: DS.zIndex,
    glass: DS.glass,
    focus: DS.focus,
    breakpoints: DS.breakpoints,
    fontFamily: DS.fontFamily,
    fontSize: DS.fontSize,
    fontWeight: DS.fontWeight,
    lineHeight: DS.lineHeight,
    letterSpacing: DS.letterSpacing,

    // MUI theme
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
 * Type-safe design system
 */
export type DesignSystemV3 = ReturnType<typeof useDesignSystem>;

/**
 * Export individual utilities
 */
export {
  colors,
  spacing,
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
  withOpacity,
  createGradient,
  createGlow,
} from "@/App/theme/designSystem.v3";

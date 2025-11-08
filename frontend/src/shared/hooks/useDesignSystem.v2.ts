/**
 * @fileoverview useDesignSystem Hook v2.0
 * @module shared/hooks
 * @version 2.0.0 - Full Transform
 * 
 * Modern design system hook with enhanced functionality
 */

import { useTheme } from '@mui/material';
import * as DS from '@/App/theme/designSystem.v2';

// Helper type for nested object access
type NestedObject = {
  [key: string]: string | number | NestedObject;
};

/**
 * Design System Hook v2.0
 * 
 * Provides type-safe access to all modern design system values
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
    const keys = path.split('.');
    let value: NestedObject | string | number = DS.colors;
    
    for (const key of keys) {
      if (typeof value === 'object' && value !== null && key in value) {
        value = value[key];
      } else {
        console.warn(`Color path "${path}" not found in design system`);
        return '#000000';
      }
    }
    
    return typeof value === 'string' ? value : String(value);
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
  const getComponentSize = (
    component: keyof typeof DS.componentSizes,
    size: 'small' | 'medium' | 'large'
  ) => {
    return DS.componentSizes[component][size];
  };

  /**
   * Get shadow
   * @example getShadow('soft.md')
   */
  const getShadow = (path: string): string => {
    const keys = path.split('.');
    let value: NestedObject | string | number = DS.shadows;
    
    for (const key of keys) {
      if (typeof value === 'object' && value !== null && key in value) {
        value = value[key];
      } else {
        console.warn(`Shadow path "${path}" not found`);
        return 'none';
      }
    }
    
    return typeof value === 'string' ? value : String(value);
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
    const keys = key.split('.');
    let value: NestedObject | string | number = DS.gradients;
    
    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = value[k];
      } else {
        return DS.gradients.primary;
      }
    }
    
    return typeof value === 'string' ? value : String(value);
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
  const getTypography = (path: string): Record<string, unknown> | string | number => {
    const keys = path.split('.');
    let value: NestedObject | string | number = DS.typography;
    
    for (const key of keys) {
      if (typeof value === 'object' && value !== null && key in value) {
        value = value[key];
      } else {
        return DS.typography.body.base;
      }
    }
    
    return value;
  };

  /**
   * Get transition
   */
  const getTransition = (type: keyof typeof DS.transitions): string | Record<string, string> => {
    return DS.transitions[type];
  };

  /**
   * Create responsive spacing
   */
  const getResponsiveSpacing = (
    xs: keyof typeof DS.spacing,
    md?: keyof typeof DS.spacing,
    lg?: keyof typeof DS.spacing
  ) => {
    return DS.responsive.spacing(xs, md, lg);
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
  const createGradient = (color1: string, color2: string, angle?: number): string => {
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
  const getGlassStyle = () => {
    return {
      background: DS.glass.background,
      border: DS.glass.border,
      backdropFilter: DS.glass.backdropFilter,
      boxShadow: DS.glass.boxShadow,
    };
  };

  /**
   * Get focus ring style
   */
  const getFocusRing = (variant: 'default' | 'error' | 'success' = 'default') => {
    const rings = {
      default: DS.focus.ring,
      error: DS.focus.ringError,
      success: DS.focus.ringSuccess,
    };
    
    return {
      outline: 'none',
      boxShadow: `${rings[variant]}, ${DS.focus.ringOffset}`,
    };
  };

  return {
    // Raw values (direct access)
    colors: DS.colors,
    spacing: { ...DS.spacing, ...DS.spacingLegacy }, // Merge modern + legacy
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
    getResponsiveSpacing,
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
export type DesignSystemV2 = ReturnType<typeof useDesignSystem>;

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
  withOpacity,
  createGradient,
  createGlow,
} from '@/App/theme/designSystem.v2';


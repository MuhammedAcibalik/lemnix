/**
 * @fileoverview Shared Hooks - Barrel Export
 * @module shared/hooks
 * @version 3.0.0
 */

// Export new canonical design system hook (v3.0)
export { useDesignSystem } from "./useDesignSystem";
export type { DesignSystem } from "./useDesignSystem";

// Export design system tokens from new location
export {
  colors,
  spacing,
  spacingScale,
  typography,
  componentSizes,
  shadows,
  borderRadius,
  gradients,
  zIndex,
  transitions,
  glass,
  focus,
  breakpoints,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  duration,
  easing,
  withOpacity,
  createGradient,
  createGlow,
} from "../design-system";

// Export responsive utilities from theme (backward compatibility)
export {
  responsive,
  gridSpacing,
  gridSizes,
  containerSizes,
  container,
  mediaQuery,
  layouts,
  componentVariants,
  animations,
} from "@/App/theme";

// Export permission hooks
export {
  usePermissions,
  useHasPermission,
  useIsAdmin,
  useIsPlanner,
  useIsViewer,
  Permission,
  UserRole,
} from "./usePermissions";
export type { User, UsePermissionsReturn } from "./usePermissions";

// Export animation hooks
export { useReducedMotion } from "./useReducedMotion";

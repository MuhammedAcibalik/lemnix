/**
 * @fileoverview Shared Hooks - Barrel Export
 * @module shared/hooks
 */

// Export v3 as default (modern)
export { useDesignSystem } from "./useDesignSystem.v3";
export type { DesignSystemV3 as DesignSystem } from "./useDesignSystem.v3";
export {
  colors,
  spacing,
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

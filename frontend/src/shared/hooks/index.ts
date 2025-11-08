/**
 * @fileoverview Shared Hooks - Barrel Export
 * @module shared/hooks
 */

// Export v2 as default (modern)
export { useDesignSystem } from './useDesignSystem.v2';
export type { DesignSystemV2 as DesignSystem } from './useDesignSystem.v2';
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
  responsive,
  gridSpacing,
  gridSizes,
  containerSizes,
  container,
  mediaQuery,
  layouts,
  componentVariants,
  animations,
} from '@/App/theme';
export { usePermissions, useHasPermission, useIsAdmin, useIsPlanner, useIsViewer, Permission, UserRole } from './usePermissions';
export type { User, UsePermissionsReturn } from './usePermissions';


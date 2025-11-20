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

// Export performance hooks
export {
  debounce,
  throttle,
  measureRenderTime,
  scheduleIdleTask,
  cancelIdleTask,
  useDebounce,
  useDebouncedCallback,
  useThrottledCallback,
  useRenderPerformance,
  useIdleTask,
} from "./usePerformance";

// Export responsive hooks
export {
  useResponsive,
  useBreakpoint,
  useBreakpointDown,
  useBreakpointBetween,
} from "./useResponsive";
export type { ResponsiveState } from "./useResponsive";

// Export keyboard navigation hooks
export {
  useKeyboardNavigation,
  useArrowNavigation,
} from "./useKeyboardNavigation";
export type {
  KeyboardNavigationOptions,
  KeyboardNavigationResult,
} from "./useKeyboardNavigation";

// Export focus trap hooks
export {
  useFocusTrap,
  useFocusOnMount,
  useFocusWhen,
  useFocusManagement,
} from "./useFocusTrap";
export type { FocusTrapOptions } from "./useFocusTrap";

// Export adaptive UI hooks (Full Adaptive System)
export { useDeviceInfo } from "./useDeviceInfo";
export type { DeviceType, UIMode, DeviceInfo } from "./useDeviceInfo";

export { useAdaptiveUI, useAdaptiveVariant } from "./useAdaptiveUI";
export type { AdaptiveTokens, AdaptiveVariantOptions } from "./useAdaptiveUI";

// Export adaptive UI context (from contexts layer)
export { useAdaptiveUIContext } from "../contexts";

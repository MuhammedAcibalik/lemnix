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
} from "@/app/theme";

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
<<<<<<< HEAD
=======

// Export FSD responsive utilities (note: useBreakpoint also available from useResponsive)
export { useMediaQuery as useMediaQueryFSD } from "./useMediaQuery";
export { useBreakpoint as useBreakpointFSD } from "./useBreakpoint";

// Export new responsive hooks (v3.0)
export { useResponsiveValue, useResponsiveValues } from "./useResponsiveValue";
export { useContainerQuery, useContainerWidth } from "./useContainerQuery";
export type { ContainerSize, ContainerQueryOptions } from "./useContainerQuery";
export { useOrientation, useOrientationLock } from "./useOrientation";
export type { Orientation, OrientationState } from "./useOrientation";
export { useTouchDevice, useTouchTargetSize, useHoverCapability } from "./useTouchDevice";
export type { TouchDeviceState } from "./useTouchDevice";

// Export progressive upload hook
export { useProgressiveUpload } from "./useProgressiveUpload";
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce

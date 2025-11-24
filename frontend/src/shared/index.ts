/**
 * LEMNİX Shared Layer Public API
 * Central export point for all shared utilities
 *
 * @module shared
 * @version 1.0.0 - FSD Compliant
 *
 * @description
 * The shared layer contains technical primitives and utilities
 * that are used across all other layers. It has no dependencies
 * on any other layer and is the foundation of the application.
 */

// ============================================================================
// API
// ============================================================================

export { apiClient, api, handleApiResponse } from "./api";

// ============================================================================
// TYPES
// ============================================================================

export type {
  // API types
  ApiError,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  PaginationMeta,
  PaginatedResponse,
  SortOrder,
  SortCriteria,
  FilterOperator,
  FilterCriteria,
  ListQueryParams,

  // Common types
  ID,
  Timestamp,
  Email,
  URL,
  Metadata,
  Entity,
  LoadableState,
  Result,
  Option,
  NonEmptyArray,
  Coordinates,
  Dimensions,
  Range,
  Color,
  Percentage,
} from "./types";

// ============================================================================
// HOOKS
// ============================================================================

export { useDebounce, useLocalStorage, usePrevious } from "./lib/hooks";

// Validation (P0-6)
export { useValidation, ValidationAlert } from "./lib/validation";
export type {
  ValidationError,
  ValidationResult,
  ValidationSeverity,
} from "./lib/validation";

// Design System Hook (CRITICAL - Single Source of Truth)
export { useDesignSystem } from "./hooks";
export type { DesignSystem } from "./hooks";
export {
  colors,
  spacing,
  typography,
  componentSizes,
  shadows,
  borderRadius,
  gradients,
  zIndex,
} from "./hooks";

// Full Adaptive System (Device Detection + UI Mode)
export { useDeviceInfo, useAdaptiveUI, useAdaptiveVariant } from "./hooks";
export type {
  DeviceType,
  UIMode,
  DeviceInfo,
  AdaptiveTokens,
  AdaptiveVariantOptions,
} from "./hooks";

// Adaptive UI Context
export { AdaptiveUIProvider, useAdaptiveUIContext } from "./contexts";
export type { AdaptiveUIContextValue } from "./contexts";

// ============================================================================
// CONFIG
// ============================================================================

export {
  API_CONFIG,
  STORAGE_KEYS,
  PAGINATION,
  DEBOUNCE,
  HTTP_STATUS,
  DATE_FORMATS,
  REGEX,
} from "./config";

// ============================================================================
// UI COMPONENTS (Design System Compliant)
// ============================================================================

export {
  Button,
  PrimaryButton,
  SecondaryButton,
  TextButton,
  DangerButton,
  SuccessButton,
} from "./ui";
export type { ButtonProps } from "./ui";

export { TextField } from "./ui";
export type { TextFieldProps } from "./ui";

export { Select } from "./ui";
export type { SelectProps, SelectOption } from "./ui";

export { Card } from "./ui";
export type { CardProps } from "./ui";

export {
  LoadingSpinner,
  LoadingBar,
  LoadingSkeleton,
  LoadingContainer,
} from "./ui";
export type {
  LoadingSpinnerProps,
  LoadingBarProps,
  LoadingSkeletonProps,
  LoadingContainerProps,
} from "./ui";

// Motion Components v3.0 (Animations System)
export {
  FadeIn,
  ScaleIn,
  SlideIn,
  Stagger,
  AnimatedCounter,
  Shimmer,
  Pulse,
  PageTransition,
  HoverScale,
  HoverLift,
  TapShrink,
} from "./ui/Motion";
export type {
  FadeInProps,
  ScaleInProps,
  SlideInProps,
  StaggerProps,
  AnimatedCounterProps,
  ShimmerProps,
  PulseProps,
  PageTransitionProps,
  HoverScaleProps,
  HoverLiftProps,
  TapShrinkProps,
} from "./ui/Motion";
export {
  fadeInVariants,
  fadeInUpVariants,
  fadeInDownVariants,
  fadeInLeftVariants,
  fadeInRightVariants,
  scaleVariants,
  scaleInVariants,
  scaleOutVariants,
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  staggerContainerVariants,
  staggerItemVariants,
  fadeScaleVariants,
  slideScaleVariants,
  easings,
  defaultAnimationConfig,
} from "./ui/Motion";

// Animation Hooks
export { useReducedMotion } from "./hooks";

// Modern Components v2.0 (FAZ 3) - Backwards-compatible aliases to current design system
import type { ButtonProps } from "./ui/Button";
import type { CardProps } from "./ui/Card";
export type ButtonV2Props = ButtonProps;
export {
  Button as ButtonV2,
  PrimaryButton as PrimaryButtonV2,
  SecondaryButton as SecondaryButtonV2,
  GhostButton,
  GradientButton,
  SoftButton,
  LinkButton,
  DangerButton as DangerButtonV2,
  SuccessButton as SuccessButtonV2,
} from "./ui";

export type CardV2Props = CardProps;
export type CardVariant = CardProps["variant"];
export { Card as CardV2 } from "./ui";

export { Badge } from "./ui/Badge";
export type { BadgeProps, BadgeVariant, BadgeColor } from "./ui/Badge";

// Responsive Components (FAZ 5)
export { MobileOnly, DesktopOnly, ResponsiveStack } from "./ui/Responsive";
export type {
  MobileOnlyProps,
  DesktopOnlyProps,
  ResponsiveStackProps,
} from "./ui/Responsive";

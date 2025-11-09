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

// WebGPU (P0-7)
export { useWebGPU, useWebGPUStatus } from "./lib/webgpu";
export type { WebGPUStatus, WebGPUInfo } from "./lib/webgpu";

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

// GPU Status Badge (P0-7)
export { GPUStatusBadge } from "./ui/GPUStatusBadge";
export type { GPUStatusBadgeProps } from "./ui/GPUStatusBadge";

// Motion Components (FAZ 2 - Animations)
export { FadeIn, ScaleIn, Stagger } from "./ui/Motion";
export type { FadeInProps, ScaleInProps, StaggerProps } from "./ui/Motion";

// Modern Components v2.0 (FAZ 3)
export {
  ButtonV2,
  PrimaryButton as PrimaryButtonV2,
  SecondaryButton as SecondaryButtonV2,
  GhostButton,
  GradientButton,
  SoftButton,
  LinkButton,
  DangerButton as DangerButtonV2,
  SuccessButton as SuccessButtonV2,
} from "./ui/Button/Button.v2";
export type { ButtonV2Props } from "./ui/Button/Button.v2";

export { CardV2 } from "./ui/Card/Card.v2";
export type { CardV2Props, CardVariant } from "./ui/Card/Card.v2";

export { Badge } from "./ui/Badge";
export type { BadgeProps, BadgeVariant, BadgeColor } from "./ui/Badge";

// Responsive Components (FAZ 5)
export { MobileOnly, DesktopOnly, ResponsiveStack } from "./ui/Responsive";
export type {
  MobileOnlyProps,
  DesktopOnlyProps,
  ResponsiveStackProps,
} from "./ui/Responsive";

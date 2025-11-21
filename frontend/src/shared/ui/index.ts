/**
 * @fileoverview Shared UI Components - Barrel Export
 * @module shared/ui
 * @version 3.0.0
 *
 * Design system compliant UI primitives.
 * All components use useDesignSystem hook for consistency.
 */

// ============================================================================
// VERSION 3.0.0 COMPONENTS
// ============================================================================

// FORM COMPONENTS
export {
  Button,
  PrimaryButton,
  SecondaryButton,
  TextButton,
  DangerButton,
  SuccessButton,
  GhostButton,
  GradientButton,
  SoftButton,
  LinkButton,
} from "./Button";
export type { ButtonProps } from "./Button";

export { TextField, SearchField, PasswordField } from "./TextField";
export type { TextFieldProps } from "./TextField";

export { Select } from "./Select";
export type { SelectProps, SelectOption } from "./Select";

// LAYOUT COMPONENTS
export {
  Card,
  MetricCard,
  DashboardCard,
  FeatureCard,
  GlassCard,
} from "./Card";
export type { CardProps } from "./Card";

export { PageContainer, CardGrid } from "./layout";
export type { PageContainerProps, CardGridProps } from "./layout";

// FEEDBACK COMPONENTS
export { Badge, StatusBadge, MetricBadge } from "./Badge";
export type { BadgeProps } from "./Badge";

export {
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  DashboardSkeleton,
} from "./Skeleton";
export type { SkeletonProps } from "./Skeleton";

export {
  EmptyState,
  NoDataEmptyState,
  SearchEmptyState,
  ErrorEmptyState,
  OfflineEmptyState,
} from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

// OVERLAY COMPONENTS
export { Modal, ConfirmModal, FormModal } from "./Modal";
export type { ModalProps } from "./Modal";

export { Tooltip, InfoTooltip, HelpTooltip } from "./Tooltip";
export type { TooltipProps } from "./Tooltip";

// ============================================================================
// LOADING COMPONENTS
// ============================================================================

export {
  LoadingSpinner,
  LoadingBar,
  LoadingSkeleton,
  LoadingContainer,
} from "./Loading";
export type {
  LoadingSpinnerProps,
  LoadingBarProps,
  LoadingSkeletonProps,
  LoadingContainerProps,
} from "./Loading";

// ============================================================================
// ERROR HANDLING
// ============================================================================

export { ErrorBoundary } from "./ErrorBoundary";

// ============================================================================
// ACCESSIBILITY COMPONENTS
// ============================================================================

export { SkipLink } from "./SkipLink";
export type { SkipLinkProps } from "./SkipLink";

// ============================================================================
// LEGACY COMPONENTS (For backward compatibility)
// ============================================================================

export { ConfirmationDialog } from "./ConfirmationDialog";
export { YearWeekPicker } from "./YearWeekPicker";

// ============================================================================
// RESPONSIVE LAYOUT COMPONENTS (FSD)
// ============================================================================

export { Container } from "./Container";
export type { ContainerProps } from "./Container";

export { Grid } from "./Grid";
export type { GridProps } from "./Grid";

export { Stack } from "./Stack";
export type { StackProps } from "./Stack";

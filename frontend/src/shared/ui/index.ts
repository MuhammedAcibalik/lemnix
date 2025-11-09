/**
 * @fileoverview Shared UI Components - Barrel Export
 * @module shared/ui
 *
 * Design system compliant UI primitives.
 * All components use useDesignSystem hook for consistency.
 */

// ============================================================================
// FORM COMPONENTS
// ============================================================================

export {
  Button,
  PrimaryButton,
  SecondaryButton,
  TextButton,
  DangerButton,
  SuccessButton,
} from "./Button";
export type { ButtonProps } from "./Button";

export { TextField } from "./TextField";
export type { TextFieldProps } from "./TextField";

export { Select } from "./Select";
export type { SelectProps, SelectOption } from "./Select";

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export { Card } from "./Card";
export type { CardProps } from "./Card";

export { CardV2 } from "./Card/Card.v2";
export type { CardV2Props } from "./Card/Card.v2";

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
// FEEDBACK COMPONENTS
// ============================================================================

export { EmptyState } from "./EmptyState";
export { ConfirmationDialog } from "./ConfirmationDialog";
export { YearWeekPicker } from "./YearWeekPicker";

// ============================================================================
// TBD (To Be Migrated)
// ============================================================================

// Modal - TBD
// Tabs - TBD

/**
 * Error Boundary - Public API
 *
 * @module shared/ui/ErrorBoundary
 * @version 2.0.0 - Granular Widget Boundaries (P2-6)
 */

// App-level error boundary (full-page errors)
export { ErrorBoundary } from "./ErrorBoundary";

// Widget-level error boundary (component-level isolation)
export {
  WidgetErrorBoundary,
  withWidgetErrorBoundary,
  type WidgetErrorBoundaryProps,
} from "./WidgetErrorBoundary";

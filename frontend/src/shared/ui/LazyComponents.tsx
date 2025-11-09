/**
 * @fileoverview Lazy Loaded Components
 * @module LazyComponents
 * @version 1.0.0
 */

import React, { lazy } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Box, CircularProgress, Typography } from "@mui/material";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Base component props
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Specific component prop types with flexible typing for lazy loading
interface EnterpriseOptimizationResultsProps {
  result?: Record<string, unknown> | null;
  cuttingList?: Array<Record<string, unknown>>;
  onNewOptimization?: () => void;
  onExport?: () => void;
}

interface ModernCuttingPlanProps {
  cuts?: Array<{
    id: string;
    stockLength: number;
    usedLength: number;
    remainingLength: number;
    segmentCount?: number;
    segments: Array<Record<string, unknown>>;
  }>;
}

interface ModernCuttingPlanVisualizationProps {
  optimizationResult?: Record<string, unknown>;
  stockLength?: number;
  title?: string;
  showStatistics?: boolean;
  showExportOptions?: boolean;
  onExport?: (format: string) => void;
}

interface ProfileOptimizationResultsProps {
  result?: Record<string, unknown> | null;
  onNewOptimization?: () => void;
  onExport?: () => void;
}

interface OptimizationInfoDialogProps {
  open?: boolean;
  onClose?: () => void;
}

interface SmartAutoCompleteProps {
  type?: "product" | "size" | "profile" | "color" | "measurement";
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  size?: "small" | "medium";
  productName?: string;
  sizeName?: string;
  showConfidence?: boolean;
  showFrequency?: boolean;
  showPreview?: boolean;
  minConfidence?: number;
  maxSuggestions?: number;
}

// Union type for all possible component props
type ComponentProps =
  | EnterpriseOptimizationResultsProps
  | ModernCuttingPlanProps
  | ModernCuttingPlanVisualizationProps
  | ProfileOptimizationResultsProps
  | OptimizationInfoDialogProps
  | SmartAutoCompleteProps
  | BaseComponentProps;

// Loading component
const LoadingSpinner = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "200px",
      gap: 2,
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Yükleniyor...
    </Typography>
  </Box>
);

// Error component
const ErrorComponent = ({
  error,
  retry,
}: {
  error?: Error;
  retry?: () => void;
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "200px",
      gap: 2,
      p: 3,
      textAlign: "center",
    }}
  >
    <Typography variant="h6" color="error">
      Yükleme Hatası
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {error?.message || "Bilinmeyen hata oluştu"}
    </Typography>
  </Box>
);

// Lazy loaded components with proper error handling
const LazyHomePageComponent = lazy(() => import("../../pages/home-page"));
const LazyDashboardPageComponent = lazy(
  () => import("../../pages/DashboardPage"),
);
const LazyCuttingListBuilderComponent = lazy(() =>
  import("../../widgets/cutting-list-builder").then((module) => ({
    default: module.CuttingListBuilder,
  })),
);
const LazyEnterpriseOptimizationWizardComponent = lazy(
  () => import("../../widgets/enterprise-optimization-wizard"),
);
const LazyStatisticsPageComponent = lazy(
  () => import("../../pages/statistics-page"),
);
const LazyProductionPlanLayoutComponent = lazy(
  () => import("../../pages/production-plan-layout"),
);
const LazyProductionPlanListPageComponent = lazy(
  () => import("../../pages/production-plan-list-page"),
);
const LazyBackorderPageComponent = lazy(
  () => import("../../pages/production-plan-backorder-page"),
);
const LazyProductionPlanStatisticsPageComponent = lazy(
  () => import("../../pages/production-plan-statistics-page"),
);
const LazyAuditPageComponent = lazy(() => import("../../pages/audit-page"));
const LazyProfileManagementPageComponent = lazy(() =>
  import("../../pages/ProfileManagementPage").then((module) => ({
    default: module.default,
  })),
);
const LazyEnterpriseOptimizationResultsComponent = lazy(
  () => import("../../widgets/enterprise-optimization-results"),
);
const LazyModernCuttingPlanComponent = lazy(() =>
  import("./ModernCuttingPlan").then((module) => ({ default: module.default })),
);
const LazyModernCuttingPlanVisualizationComponent = lazy(
  () => import("../../widgets/modern-cutting-plan-visualization"),
);
const LazyProfileOptimizationResultsComponent = lazy(
  () => import("../../widgets/profile-optimization-results"),
);
const LazyOptimizationInfoDialogComponent = lazy(
  () => import("../../widgets/optimization-info-dialog"),
);
const LazySmartAutoCompleteComponent = lazy(() =>
  import("./SmartAutoComplete").then((module) => ({ default: module.default })),
);

// Generic wrapper component for lazy loading with error boundary
interface LazyWrapperProps {
  children: React.ReactNode;
}

const LazyWrapper: React.FC<LazyWrapperProps> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <ErrorComponent
        error={new Error("Component failed to load")}
        retry={() => window.location.reload()}
      />
    }
  >
    <React.Suspense fallback={<LoadingSpinner />}>{children}</React.Suspense>
  </ErrorBoundary>
);

// ============================================================================
// TYPED LAZY COMPONENT EXPORTS
// ============================================================================

// Individual lazy components with proper typing and safe type assertions
export const LazyHomePage: React.FC<Record<string, unknown>> = (props) => (
  <LazyWrapper>
    <LazyHomePageComponent {...props} />
  </LazyWrapper>
);

export const LazyDashboardPage: React.FC<Record<string, unknown>> = (props) => (
  <LazyWrapper>
    <LazyDashboardPageComponent {...props} />
  </LazyWrapper>
);

export const LazyCuttingListBuilder: React.FC<Record<string, unknown>> = (
  props,
) => (
  <LazyWrapper>
    <LazyCuttingListBuilderComponent {...props} />
  </LazyWrapper>
);

export const LazyEnterpriseOptimizationWizard: React.FC<
  Record<string, unknown>
> = (props) => (
  <LazyWrapper>
    <LazyEnterpriseOptimizationWizardComponent {...props} />
  </LazyWrapper>
);

export const LazyStatisticsPage: React.FC<Record<string, unknown>> = (
  props,
) => (
  <LazyWrapper>
    <LazyStatisticsPageComponent {...props} />
  </LazyWrapper>
);

export const LazyProductionPlanLayout: React.FC<Record<string, unknown>> = (
  props,
) => (
  <LazyWrapper>
    <LazyProductionPlanLayoutComponent {...props} />
  </LazyWrapper>
);

export const LazyProductionPlanListPage: React.FC<Record<string, unknown>> = (
  props,
) => (
  <LazyWrapper>
    <LazyProductionPlanListPageComponent {...props} />
  </LazyWrapper>
);

export const LazyBackorderPage: React.FC<Record<string, unknown>> = (props) => (
  <LazyWrapper>
    <LazyBackorderPageComponent {...props} />
  </LazyWrapper>
);

export const LazyProductionPlanStatisticsPage: React.FC<
  Record<string, unknown>
> = (props) => (
  <LazyWrapper>
    <LazyProductionPlanStatisticsPageComponent {...props} />
  </LazyWrapper>
);

export const LazyAuditPage: React.FC<Record<string, unknown>> = (props) => (
  <LazyWrapper>
    <LazyAuditPageComponent {...props} />
  </LazyWrapper>
);

export const LazyEnterpriseOptimizationResults: React.FC<
  Record<string, unknown>
> = (props) => (
  <LazyWrapper>
    {React.createElement(
      LazyEnterpriseOptimizationResultsComponent as unknown as React.ComponentType<
        Record<string, unknown>
      >,
      props,
    )}
  </LazyWrapper>
);

export const LazyModernCuttingPlan: React.FC<Record<string, unknown>> = (
  props,
) => (
  <LazyWrapper>
    {React.createElement(
      LazyModernCuttingPlanComponent as unknown as React.ComponentType<
        Record<string, unknown>
      >,
      props,
    )}
  </LazyWrapper>
);

export const LazyModernCuttingPlanVisualization: React.FC<
  Record<string, unknown>
> = (props) => (
  <LazyWrapper>
    {React.createElement(
      LazyModernCuttingPlanVisualizationComponent as unknown as React.ComponentType<
        Record<string, unknown>
      >,
      props,
    )}
  </LazyWrapper>
);

export const LazyProfileOptimizationResults: React.FC<
  Record<string, unknown>
> = (props) => (
  <LazyWrapper>
    {React.createElement(
      LazyProfileOptimizationResultsComponent as unknown as React.ComponentType<
        Record<string, unknown>
      >,
      props,
    )}
  </LazyWrapper>
);

export const LazyOptimizationInfoDialog: React.FC<Record<string, unknown>> = (
  props,
) => (
  <LazyWrapper>
    {React.createElement(
      LazyOptimizationInfoDialogComponent as unknown as React.ComponentType<
        Record<string, unknown>
      >,
      props,
    )}
  </LazyWrapper>
);

export const LazySmartAutoComplete: React.FC<Record<string, unknown>> = (
  props,
) => (
  <LazyWrapper>
    {React.createElement(
      LazySmartAutoCompleteComponent as unknown as React.ComponentType<
        Record<string, unknown>
      >,
      props,
    )}
  </LazyWrapper>
);

export const LazyProfileManagementPage: React.FC<Record<string, unknown>> = (
  props,
) => (
  <LazyWrapper>
    <LazyProfileManagementPageComponent {...props} />
  </LazyWrapper>
);

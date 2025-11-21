/**
 * Enterprise Controller Request Types
 *
 * @module enterprise/types
 * @version 1.0.0
 */

import { OptimizationItem, MaterialStockLength } from "../index";
import {
  AlgorithmLabel,
  EnhancedConstraints,
  OptimizationObjective,
  PerformanceSettings,
  CostModel,
} from "../../services/optimization/types";

/**
 * Enterprise optimization request
 */
export interface EnterpriseOptimizationRequest {
  readonly items: OptimizationItem[];
  readonly algorithm: AlgorithmLabel;
  readonly objectives: OptimizationObjective[];
  readonly constraints: EnhancedConstraints;
  readonly performance: PerformanceSettings;
  readonly costModel: CostModel;
  readonly materialStockLengths?: MaterialStockLength[];
  readonly profileParams?: {
    readonly workOrderId: string;
    readonly profileType: string;
    readonly weekNumber?: number;
    readonly year?: number;
  };
}

/**
 * Enterprise result export request
 */
export interface ExportRequest {
  readonly format: "pdf" | "excel" | "json" | "csv";
  readonly includeCharts: boolean;
  readonly includeDetails: boolean;
  readonly language: "tr" | "en";
  readonly resultId?: string;
}

/**
 * Performance analytics request
 */
export interface AnalyticsRequest {
  readonly timeRange: "hour" | "day" | "week" | "month";
  readonly metrics: string[];
  readonly algorithm?: AlgorithmLabel;
}

/**
 * Audit log query parameters
 */
export interface AuditLogQuery {
  readonly userId?: string;
  readonly action?: string;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly limit: number;
}

/**
 * Optimization history query
 */
export interface OptimizationHistoryQuery {
  readonly userId?: string;
  readonly algorithm?: AlgorithmLabel;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly limit: number;
}

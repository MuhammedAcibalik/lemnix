/**
 * Results Component Types
 * Type definitions for results visualization components
 *
 * @module enterprise-optimization-wizard/components/results
 * @version 2.0.0 - Type-safe, no any
 */

import type { OptimizationResult, Cut } from "../../types";

/**
 * Props for Results components
 */
export interface ResultsComponentProps {
  readonly result: OptimizationResult;
  readonly loading?: boolean;
}

/**
 * Export format
 */
export type ExportFormat =
  | "pdf"
  | "excel"
  | "json"
  | "cutting-instructions"
  | "work-order-labels"
  | "production-schedule";

/**
 * Export action
 */
export interface ExportAction {
  readonly format: ExportFormat;
  readonly label: string;
  readonly icon: React.ComponentType;
  readonly color: string;
  readonly description: string;
}

/**
 * Detailed tab type
 */
export type DetailedTabType =
  | "cutting-plan"
  | "waste-analysis"
  | "cost-analysis"
  | "quality-metrics";

/**
 * Visualization mode
 */
export type VisualizationMode = "2d" | "3d";

/**
 * Stock filter
 */
export interface StockFilter {
  readonly workOrderId?: string;
  readonly profileType?: string;
  readonly wasteCategory?: string;
  readonly minWaste?: number;
  readonly maxWaste?: number;
}

/**
 * Segment table row (for DataGrid)
 */
export interface SegmentTableRow {
  readonly id: string;
  readonly stockIndex: number;
  readonly segmentIndex: number;
  readonly profileType: string;
  readonly length: number;
  readonly quantity: number;
  readonly workOrderId: string;
  readonly startPosition: number;
  readonly endPosition: number;
  readonly waste: number;
  readonly color?: string;
}

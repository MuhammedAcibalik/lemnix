/**
 * Export Service Types
 * Type definitions for export services
 * 
 * @module services/export
 * @version 1.0.0
 */

import type { OptimizationResult, Cut, CuttingSegment } from '../../types';

/**
 * Export format type
 */
export type ExportFormat = 
  | 'pdf' 
  | 'excel' 
  | 'json' 
  | 'cutting-instructions' 
  | 'work-order-labels' 
  | 'production-schedule';

/**
 * Cutting instruction data
 */
export interface CuttingInstructionData {
  readonly result: OptimizationResult;
  readonly companyName?: string;
  readonly projectName?: string;
  readonly generatedAt: Date;
  readonly operatorNotes?: string;
}

/**
 * Work order label data
 */
export interface WorkOrderLabelData {
  readonly segmentId: string;
  readonly stockIndex: number;
  readonly segmentIndex: number;
  readonly profileType: string;
  readonly length: number;
  readonly quantity: number;
  readonly workOrderId: string;
  readonly position: number;
  readonly qrCodeData: string;
}

/**
 * Production schedule data
 */
export interface ProductionScheduleData {
  readonly result: OptimizationResult;
  readonly startDate: Date;
  readonly setupTimePerStock: number; // minutes
  readonly cuttingTimePerSegment: number; // minutes
}

/**
 * Export options
 */
export interface ExportOptions {
  readonly format: ExportFormat;
  readonly includeQRCodes?: boolean;
  readonly includeDiagrams?: boolean;
  readonly paperSize?: 'A4' | 'Letter';
  readonly orientation?: 'portrait' | 'landscape';
}


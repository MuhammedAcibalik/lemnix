/**
 * @fileoverview Types for Enterprise Optimization Results
 * @module EnterpriseOptimizationResultsTypes
 * @version 1.0.0
 */

// Modern utility types for better type safety
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface StockSummary {
  stockLength: number;
  cutCount: number;
  patterns: ReadonlyArray<{ readonly pattern: string; readonly count: number }>;
  avgWaste: number;
  totalWaste: number;
  efficiency: number;
}

export interface OptimizationResult {
  id?: string;
  cuts: Cut[];
  efficiency: number;
  wastePercentage: number;
  totalCost: number;
  totalWaste: number;
  stockCount: number;
  totalSegments?: number;
  confidence: number;
  costBreakdown?: Record<string, number>;
  costPerMeter?: number;
  recommendations?: Array<{
    severity?: string;
    message: string;
    description?: string;
    suggestion?: string;
    expectedImprovement?: number;
  }>;
  executionTimeMs: number;
  algorithm?: string;
  performanceMetrics?: {
    algorithmComplexity?: string;
    convergenceRate?: number;
    cpuUsage?: number;
    memoryUsage?: number;
    scalability?: number;
  };
  // Advanced optimization specific fields
  paretoFrontier?: Array<{
    waste: number;
    cost: number;
    time: number;
    efficiency: number;
  }>;
  totalKerfLoss?: number;
  totalSafetyReserve?: number;
  stockSummary?: ReadonlyArray<StockSummary>;
}

// Modern interface with utility types
export interface CuttingListItem {
  id: string;
  workOrderId: string;
  color: string;
  version: string;
  size: string;
  profileType: string;
  length: number;
  quantity: number;
  cuttingPattern: string;
}

export interface OptimizationResultsProps {
  result: OptimizationResult | null;
  cuttingList?: CuttingListItem[];
  onNewOptimization?: ActionCallback;
  onExport?: ActionCallback;
}

export interface OptimizationMetrics {
  efficiency: number;
  wastePercentage: number;
  costSavings: number;
  timeSavings: number;
  materialUtilization: number;
}

export interface ProfileOptimizationResult {
  profileType: string;
  originalCuts: number;
  optimizedCuts: number;
  efficiencyGain: number;
  wasteReduction: number;
  costSavings: number;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Modern callback types with specific format constraints
export type ExportCallback = (format: ExportFormat) => void;
export type ActionCallback = () => void;

export interface OptimizationResultProps {
  result: OptimizationResult;
  onBack: ActionCallback;
  onExport?: ExportCallback;
  onShare?: ActionCallback;
  onPrint?: ActionCallback;
  showProfileOptimization?: boolean;
  useProfileOptimization?: boolean;
}

// Modern type definitions with union types
export type ExportFormat = "pdf" | "excel" | "json" | "csv";
export type Language = "tr" | "en";

export interface ExportOptions {
  format: ExportFormat;
  includeCharts: boolean;
  includeDetails: boolean;
  language: Language;
}

export interface WorkOrder {
  workOrderId: string | number;
  algorithm?: string;
  stockCount: number;
  totalSegments: number;
  efficiency?: number;
  totalWaste?: number;
  cuts: Cut[];
}

export interface Pool {
  poolKey: string;
  profileType: string;
  workOrderCount: number;
  stockCount: number;
  totalSegments: number;
  efficiency: number;
  cuts: Cut[];
}

export interface DuplicateProfileTypes {
  hasDuplicates: boolean;
  duplicates: Array<{
    profileType: string;
    count: number;
  }>;
}

// Modal State Types
export interface CuttingPlanModalState {
  open: boolean;
  stock: Cut | null;
}

export interface KesimDetaylariModalState {
  open: boolean;
  workOrder: WorkOrder | null;
}

// Group Data Types
export interface StockGroup {
  stockLength: number;
  cuts: Cut[];
  totalPieces: number;
}

export interface GroupData {
  totalPieces: number;
  barCount: number;
  avgRemaining: number;
  groupEfficiency: number;
}

// Segment Types
export interface Segment {
  id: string;
  length: number;
  quantity: number;
  workOrderId?: string;
  workOrderItemId?: string;
  profileType: string;
}

// Cut Types - Unified interface
export interface Cut {
  id?: string;
  stockLength: number;
  segments?: Segment[];
  usedLength: number;
  remainingLength: number;
  segmentCount?: number;
  planLabel?: string;
  isReclaimable?: boolean;
  workOrderId?: string | number;
  profileType?: string;
  quantity?: number;
  workOrderBreakdown?: Array<{ workOrderId: string | number; count: number }>;
  isMixed?: boolean;
  poolKey?: string;
  // Additional fields for compatibility
  length?: number;
  count?: number;
  used?: number;
  waste?: number;
  algorithmName?: string;
  totalPieces?: number;
}

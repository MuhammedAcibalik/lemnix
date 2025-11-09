/**
 * @fileoverview Type definitions for Modern Cutting Plan Visualization
 * @module ModernCuttingPlanVisualizationTypes
 * @version 1.0.0
 */

import { OptimizationResult } from "@/shared/types/legacy";

// ============================================================================
// MAIN COMPONENT PROPS
// ============================================================================

export interface ModernCuttingPlanProps {
  optimizationResult: OptimizationResult;
  stockLength?: number;
  title?: string;
  showStatistics?: boolean;
  showExportOptions?: boolean;
  onExport?: (format: ExportFormat) => void;
}

// ============================================================================
// DATA STRUCTURES
// ============================================================================

export interface CuttingStock {
  id: number;
  cuts: CuttingPiece[];
  wasteLength: number;
  efficiency: number;
  utilization: number;
  stockLength: number;
  stockCount?: number;
  totalStockLength?: number;
  usedLength?: number;
}

export interface CuttingPiece {
  id: string;
  length: number;
  quantity: number;
  profileType: string;
  color?: string;
  workOrderId?: string;
  productName?: string;
  priority?: "high" | "medium" | "low";
  totalLength: number; // Toplam uzunluk (length × quantity)
  size?: string;
  note?: string;
  stockIds?: Set<number>;
  workOrderIds?: Set<string>;
  colors?: Set<string>;
  sizes?: Set<string>;
  notes?: Set<string>;
}

// ============================================================================
// SETTINGS & CONFIGURATION
// ============================================================================

export interface VisualizationSettings {
  viewMode: "detailed" | "compact" | "timeline";
  showLabels: boolean;
  showMeasurements: boolean;
  showColors: boolean;
  showWaste: boolean;
  zoomLevel: number;
  colorScheme: "material" | "rainbow" | "monochrome" | "productivity";
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export interface OverallStatistics {
  totalStocks: number;
  totalWaste: number;
  averageEfficiency: number;
  overallEfficiency: number;
  totalPieces: number;
  totalUsedLength: number;
  totalStockLength: number;
  wastePercentage: number;
  materialCost: number;
  wasteCost: number;
  usedCost: number;
  costEfficiency: number;
}

export interface PaginatedData {
  data: CuttingStock[];
  totalPages: number;
  totalStocks: number;
  showingCount: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ExportFormat = "pdf" | "excel" | "image" | "json";

export type ViewMode = "detailed" | "compact" | "timeline";

export type ColorScheme =
  | "material"
  | "rainbow"
  | "monochrome"
  | "productivity";

export type Priority = "high" | "medium" | "low";

// ============================================================================
// COMPONENT STATE TYPES
// ============================================================================

export interface ComponentState {
  settings: VisualizationSettings;
  selectedStock: number | null;
  showSettingsDialog: boolean;
  showStatsDialog: boolean;
  isFullscreen: boolean;
  hoveredPiece: string | null;
  quickMenuAnchor: HTMLElement | null;
  stocksPerPage: number;
  currentPage: number;
}

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type ZoomDirection = "in" | "out";

export type SettingsUpdateHandler = (
  updates: Partial<VisualizationSettings>,
) => void;

export type StockClickHandler = (stockId: number) => void;

export type ExportHandler = (format: ExportFormat) => void;

// ============================================================================
// UTILITY FUNCTION TYPES
// ============================================================================

export type ColorGenerator = (profileType: string) => string;

export type PriorityDeterminer = (length: number) => Priority;

export type EfficiencyColorGetter = (efficiency: number) => string;

export type LengthFormatter = (length: number) => string;

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface StockVisualizationProps {
  stock: CuttingStock;
  settings: VisualizationSettings;
  selectedStock: number | null;
  hoveredPiece: string | null;
  onStockClick: StockClickHandler;
  onPieceHover: (pieceId: string | null) => void;
  onPieceLeave: () => void;
}

export interface StatisticsDisplayProps {
  statistics: OverallStatistics;
}

export interface ControlsPanelProps {
  settings: VisualizationSettings;
  onZoom: (direction: ZoomDirection) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSettingsOpen: () => void;
  onFullscreenToggle: () => void;
  onPageChange: (page: number) => void;
  onExport: ExportHandler;
  showExportOptions: boolean;
  currentPage: number;
  totalPages: number;
  stocksPerPage: number;
}

export interface SettingsDialogProps {
  open: boolean;
  settings: VisualizationSettings;
  onClose: () => void;
  onSettingsChange: SettingsUpdateHandler;
}

export interface QuickActionsMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onExport: ExportHandler;
  onCopy: () => void;
  optimizationResult: OptimizationResult;
}

// ============================================================================
// COMPUTED DATA TYPES
// ============================================================================

export interface ProcessedSegmentData {
  stockIndex: number;
  stockId: number;
  profileType: string;
  length: number;
  quantity: number;
  workOrderId?: string;
  workOrderItemId?: string;
  color?: string;
  size?: string;
  note?: string;
}

export interface GroupedSegmentData {
  id: string;
  length: number;
  quantity: number;
  profileType: string;
  color: string;
  workOrderId: string;
  productName: string;
  priority: Priority;
  totalLength: number;
  stockIds: Set<number>;
  workOrderIds: Set<string>;
  colors: Set<string>;
  sizes: Set<string>;
  notes: Set<string>;
}

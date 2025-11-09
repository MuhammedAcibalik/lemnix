/**
 * @fileoverview Utility functions for Modern Cutting Plan Visualization
 * @module ModernCuttingPlanVisualizationUtils
 * @version 1.0.0
 */

import {
  ColorGenerator,
  PriorityDeterminer,
  EfficiencyColorGetter,
  LengthFormatter,
  CuttingStock,
  OverallStatistics,
  PaginatedData,
  ProcessedSegmentData,
  GroupedSegmentData,
  CuttingPiece,
  VisualizationSettings,
} from "../types";

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Generate color based on profile type
 */
export const generateColorFromProfile: ColorGenerator = (
  profileType: string,
): string => {
  const colorMap = {
    "KAPALI ALT": "#1e40af", // Deep Industrial Blue
    "AÇIK ALT": "#059669", // Precision Green
    L: "#f59e0b", // Efficiency Orange
    U: "#7c3aed", // Tech Purple
    KARE: "#ef4444", // Error Red
    YUVARLAK: "#64748b", // Professional Gray
    DEFAULT: "#64748b", // Professional Gray
  };

  return colorMap[profileType as keyof typeof colorMap] || colorMap.DEFAULT;
};

/**
 * Get efficiency color based on percentage
 */
export const getEfficiencyColor: EfficiencyColorGetter = (
  efficiency: number,
): string => {
  const efficiencyThresholds = [
    { threshold: 90, color: "#4caf50" }, // Green
    { threshold: 80, color: "#ff9800" }, // Orange
    { threshold: 70, color: "#ff5722" }, // Red-Orange
    { threshold: 0, color: "#f44336" }, // Red
  ];

  return (
    efficiencyThresholds.find(({ threshold }) => efficiency >= threshold)
      ?.color || "#f44336"
  );
};

// ============================================================================
// PRIORITY UTILITIES
// ============================================================================

/**
 * Determine priority based on length
 */
export const determinePriority: PriorityDeterminer = (length: number) => {
  const priorityThresholds = [
    { threshold: 4000, priority: "high" as const },
    { threshold: 2000, priority: "medium" as const },
    { threshold: 0, priority: "low" as const },
  ];

  return (
    priorityThresholds.find(({ threshold }) => length > threshold)?.priority ||
    "low"
  );
};

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format length for display
 */
export const formatLength: LengthFormatter = (length: number): string => {
  return `${length}mm`;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return `₺${amount.toFixed(0)}`;
};

/**
 * Format percentage for display
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1,
): string => {
  return `${value.toFixed(decimals)}%`;
};

// ============================================================================
// DATA PROCESSING UTILITIES
// ============================================================================

/**
 * Process optimization result into segments with stock information
 */
export const processOptimizationSegments = (
  optimizationResult: {
    cuts?: Array<{ segments?: Array<Record<string, unknown>> }>;
  },
  stockLength: number,
): ProcessedSegmentData[] => {
  if (!optimizationResult?.cuts) return [];

  return optimizationResult.cuts.flatMap(
    (stock, stockIndex) =>
      stock.segments?.map((segment) => ({
        stockIndex,
        stockId: stockIndex,
        profileType: String(segment.profileType || "Unknown"),
        length: Number(segment.length || 0),
        quantity: Number(segment.quantity || 1),
        workOrderId: segment.workOrderId
          ? String(segment.workOrderId)
          : undefined,
        workOrderItemId: segment.workOrderItemId
          ? String(segment.workOrderItemId)
          : undefined,
        color: segment.color ? String(segment.color) : undefined,
        size: segment.size ? String(segment.size) : undefined,
        note: segment.note ? String(segment.note) : undefined,
      })) || [],
  );
};

/**
 * Group segments by profile type and length
 */
export const groupSegmentsByProfileAndLength = (
  segments: ProcessedSegmentData[],
): Record<string, GroupedSegmentData> => {
  return segments.reduce(
    (acc, segment) => {
      const key = `${segment.profileType}-${segment.length}`;

      if (!acc[key]) {
        acc[key] = {
          id: key,
          length: segment.length,
          quantity: 0,
          profileType: segment.profileType,
          color: generateColorFromProfile(segment.profileType),
          workOrderId: "Bilinmeyen",
          productName: "Ürün",
          priority: determinePriority(segment.length),
          totalLength: 0,
          stockIds: new Set<number>(),
          workOrderIds: new Set<string>(),
          colors: new Set<string>(),
          sizes: new Set<string>(),
          notes: new Set<string>(),
        };
      }

      const group = acc[key];
      group.quantity += segment.quantity;
      group.totalLength += segment.length * segment.quantity;
      group.stockIds.add(segment.stockIndex);

      if (segment.workOrderId || segment.workOrderItemId) {
        group.workOrderIds.add(segment.workOrderId || segment.workOrderItemId!);
      }

      if (segment.color) group.colors.add(segment.color);
      if (segment.size) group.sizes.add(segment.size);
      if (segment.note) group.notes.add(segment.note);

      return acc;
    },
    {} as Record<string, GroupedSegmentData>,
  );
};

/**
 * Convert grouped segments to cutting stocks
 */
export const convertToCuttingStocks = (
  groupedSegments: Record<string, GroupedSegmentData>,
  stockLength: number,
): CuttingStock[] => {
  return Object.values(groupedSegments).map((group, index) => {
    const stockCount = group.stockIds.size;
    const totalStockLength = stockCount * stockLength;
    const usedLength = group.totalLength;
    const wasteLength = Math.max(0, totalStockLength - usedLength);
    const efficiency =
      totalStockLength > 0 ? (usedLength / totalStockLength) * 100 : 0;

    // Format work order display
    const workOrderIds = Array.from(group.workOrderIds);
    const workOrderDisplay =
      workOrderIds.length === 0
        ? "Bilinmeyen"
        : workOrderIds.length === 1
          ? workOrderIds[0]
          : `Çoklu İş Emri (${workOrderIds.length})`;

    // Format color display
    const colors = Array.from(group.colors);
    const colorDisplay = colors.length > 0 ? colors[0] : undefined;

    // Format size display
    const sizes = Array.from(group.sizes);
    const sizeDisplay = sizes.length > 0 ? sizes[0] : undefined;

    // Format note display
    const notes = Array.from(group.notes);
    const noteDisplay = notes.length > 0 ? notes[0] : undefined;

    return {
      id: index,
      cuts: [
        {
          id: group.id,
          length: group.length,
          quantity: group.quantity,
          profileType: group.profileType,
          color: colorDisplay,
          workOrderId: workOrderDisplay,
          productName: group.productName,
          priority: group.priority,
          totalLength: group.totalLength,
          size: sizeDisplay,
          note: noteDisplay,
        },
      ],
      wasteLength,
      efficiency: Math.min(100, Math.max(0, efficiency)),
      utilization: Math.min(100, Math.max(0, efficiency)),
      stockLength,
      stockCount,
      totalStockLength,
      usedLength,
    };
  });
};

// ============================================================================
// STATISTICS UTILITIES
// ============================================================================

/**
 * Calculate overall statistics from cutting stocks
 */
export const calculateOverallStatistics = (
  stocks: CuttingStock[],
  stockLength: number,
): OverallStatistics => {
  const totalStocks = stocks.reduce(
    (sum, stock) => sum + (stock.stockCount || 1),
    0,
  );
  const totalWaste = stocks.reduce((sum, stock) => sum + stock.wasteLength, 0);
  const totalUsedLength = stocks.reduce(
    (sum, stock) => sum + (stock.usedLength || 0),
    0,
  );
  const totalStockLength = stocks.reduce(
    (sum, stock) => sum + (stock.totalStockLength || 0),
    0,
  );

  const overallEfficiency =
    totalStockLength > 0 ? (totalUsedLength / totalStockLength) * 100 : 0;

  const weightedEfficiency =
    stocks.length > 0
      ? stocks.reduce(
          (sum, stock) => sum + stock.efficiency * (stock.stockCount || 1),
          0,
        ) / totalStocks
      : 0;

  const totalPieces = stocks.reduce(
    (sum, stock) => sum + (stock.cuts[0]?.quantity || 0),
    0,
  );
  const wastePercentage =
    totalStockLength > 0 ? (totalWaste / totalStockLength) * 100 : 0;

  // Cost calculation (example price: 45.50 TL/m)
  const materialCost = (totalStockLength / 1000) * 45.5;
  const wasteCost = (totalWaste / 1000) * 45.5;
  const usedCost = (totalUsedLength / 1000) * 45.5;

  return {
    totalStocks,
    totalWaste,
    averageEfficiency: weightedEfficiency,
    overallEfficiency,
    totalPieces,
    totalUsedLength,
    totalStockLength,
    wastePercentage,
    materialCost,
    wasteCost,
    usedCost,
    costEfficiency: materialCost > 0 ? (usedCost / materialCost) * 100 : 0,
  };
};

/**
 * Create paginated data from stocks
 */
export const createPaginatedData = (
  stocks: CuttingStock[],
  stocksPerPage: number,
  currentPage: number,
): PaginatedData => {
  const totalPages = Math.ceil(stocks.length / stocksPerPage);
  const startIndex = currentPage * stocksPerPage;
  const paginatedData = stocks.slice(startIndex, startIndex + stocksPerPage);

  return {
    data: paginatedData,
    totalPages,
    totalStocks: stocks.length,
    showingCount: paginatedData.length,
  };
};

// ============================================================================
// SETTINGS UTILITIES
// ============================================================================

/**
 * Get default visualization settings
 */
export const getDefaultSettings = (): VisualizationSettings => ({
  viewMode: "detailed",
  showLabels: true,
  showMeasurements: true,
  showColors: true,
  showWaste: true,
  zoomLevel: 1,
  colorScheme: "material",
});

/**
 * Update zoom level
 */
export const updateZoomLevel = (
  currentLevel: number,
  direction: "in" | "out",
): number => {
  const factor = direction === "in" ? 1.2 : 1 / 1.2;
  const newLevel = currentLevel * factor;

  return direction === "in" ? Math.min(newLevel, 3) : Math.max(newLevel, 0.5);
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate optimization result
 */
export const isValidOptimizationResult = (result: unknown): boolean => {
  return (
    result !== null &&
    typeof result === "object" &&
    "cuts" in result &&
    Array.isArray((result as { cuts: unknown }).cuts)
  );
};

/**
 * Validate cutting piece data
 */
export const isValidCuttingPiece = (piece: unknown): piece is CuttingPiece => {
  return (
    typeof piece === "object" &&
    piece !== null &&
    "id" in piece &&
    "length" in piece &&
    "quantity" in piece &&
    "profileType" in piece
  );
};

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

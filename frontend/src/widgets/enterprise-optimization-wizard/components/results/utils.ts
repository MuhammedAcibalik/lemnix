/**
 * Results Data Transformation Utilities
 * Transform backend optimization results for UI display
 *
 * @module enterprise-optimization-wizard/components/results
 * @version 2.0.0 - Type-safe, no any
 */

import type { OptimizationResult } from "../../types";

// Backend Cut type (aligned with backend/src/types/index.ts)
export interface BackendCut {
  readonly id: string;
  readonly stockLength: number; // Backend uses stockLength
  readonly usedLength: number;
  readonly remainingLength: number;
  readonly segments: ReadonlyArray<{
    readonly length: number;
    readonly quantity?: number | undefined;
    readonly workOrderId?: string | undefined;
    readonly id?: string | undefined;
    readonly position?: number | undefined;
    readonly endPosition?: number | undefined;
    readonly profileType?: string | undefined;
  }>;
  readonly segmentCount: number;
  readonly efficiency?: number;
  readonly wasteCategory?: string;
  readonly isReclaimable?: boolean;
}

// Use backend Cut type
type Cut = BackendCut;

/**
 * Waste distribution interface
 */
export interface WasteDistribution {
  readonly minimal: number;
  readonly small: number;
  readonly medium: number;
  readonly large: number;
  readonly excessive: number;
  readonly reclaimable: number;
  readonly totalPieces: number;
}

/**
 * Stock breakdown data for visualization
 */
export interface StockBreakdownData {
  readonly stockIndex: number;
  readonly stockLength: number;
  readonly segments: ReadonlyArray<SegmentVisualizationData>;
  readonly usedLength: number;
  readonly wasteLength: number;
  readonly wasteCategory: string;
  readonly usedPercentage: number;
  readonly segmentCount: number;
  readonly workOrderIds: ReadonlyArray<string>;
}

/**
 * Segment data for visualization
 */
export interface SegmentVisualizationData {
  readonly id: string;
  readonly profileType: string;
  readonly length: number;
  readonly quantity: number;
  readonly startPosition: number;
  readonly endPosition: number;
  readonly workOrderId: string;
  readonly color: string;
  readonly tooltipText: string;
}

/**
 * Aggregated metrics
 */
export interface AggregatedMetrics {
  readonly totalSegments: number;
  readonly totalStocks: number;
  readonly averageSegmentsPerStock: number;
  readonly totalUsedLength: number;
  readonly totalWasteLength: number;
  readonly reclaimableStocks: number;
  readonly uniqueWorkOrders: number;
  readonly uniqueProfiles: number;
}

/**
 * Cost breakdown for charts
 */
export interface CostBreakdownData {
  readonly materialCost: number;
  readonly laborCost: number;
  readonly wasteCost: number;
  readonly setupCost: number;
  readonly cuttingCost: number;
  readonly timeCost: number;
  readonly totalCost: number;
  readonly costPerMeter: number;
  readonly materialSavings?: number;
  readonly laborSavings?: number;
}

/**
 * Transform cuts to stock breakdown data
 */
export function transformCutsToStockBreakdown(
  cuts: ReadonlyArray<Cut>,
): ReadonlyArray<StockBreakdownData> {
  return cuts.map((cut: Cut, index: number) => {
    const segments = cut.segments.map((segment, segIndex: number) => {
      const startPosition = segment.position || 0;
      const endPosition = segment.endPosition || startPosition + segment.length;
      const profileType = segment.profileType || "Unknown";

      return {
        id: segment.id || `seg-${index}-${segIndex}`,
        profileType,
        length: segment.length,
        quantity: segment.quantity || 1,
        startPosition,
        endPosition,
        workOrderId: segment.workOrderId || "N/A",
        color: getWorkOrderColor(segment.workOrderId || ""),
        tooltipText: `${profileType} - ${segment.length}mm × ${segment.quantity || 1} adet`,
      };
    });

    const usedLength =
      cut.usedLength || segments.reduce((sum: number, s) => sum + s.length, 0);
    const wasteLength = cut.remainingLength || cut.stockLength - usedLength;
    const usedPercentage = (usedLength / cut.stockLength) * 100;

    const workOrderIds = Array.from(
      new Set(segments.map((s) => s.workOrderId).filter((id) => id !== "N/A")),
    );

    return {
      stockIndex: index + 1,
      stockLength: cut.stockLength,
      segments,
      usedLength,
      wasteLength,
      wasteCategory: cut.wasteCategory || "unknown",
      usedPercentage,
      segmentCount: segments.length,
      workOrderIds,
    };
  });
}

/**
 * Calculate aggregated metrics from cuts
 */
export function calculateStockMetrics(
  cuts: ReadonlyArray<Cut>,
): AggregatedMetrics {
  const totalSegments = cuts.reduce(
    (sum: number, cut: Cut) => sum + (cut.segments?.length || 0),
    0,
  );
  const totalStocks = cuts.length;
  const averageSegmentsPerStock =
    totalStocks > 0 ? totalSegments / totalStocks : 0;

  const totalUsedLength = cuts.reduce(
    (sum: number, cut: Cut) => sum + (cut.usedLength || 0),
    0,
  );
  const totalWasteLength = cuts.reduce(
    (sum: number, cut: Cut) => sum + (cut.remainingLength || 0),
    0,
  );

  const reclaimableStocks = cuts.filter((cut: Cut) => cut.isReclaimable).length;

  const allWorkOrders = new Set<string>();
  const allProfiles = new Set<string>();

  cuts.forEach((cut: Cut) => {
    const segments = cut.segments;
    if (segments) {
      segments.forEach((segment) => {
        if (segment.workOrderId) allWorkOrders.add(segment.workOrderId);
      });
    }
  });

  return {
    totalSegments,
    totalStocks,
    averageSegmentsPerStock,
    totalUsedLength,
    totalWasteLength,
    reclaimableStocks,
    uniqueWorkOrders: allWorkOrders.size,
    uniqueProfiles: allProfiles.size,
  };
}

/**
 * Aggregate waste by category
 */
export function aggregateWasteByCategory(
  wasteDistribution: WasteDistribution,
): Array<{
  category: string;
  count: number;
  percentage: number;
  color: string;
}> {
  const total = wasteDistribution.totalPieces || 1;

  return [
    {
      category: "Minimal (<50mm)",
      count: wasteDistribution.minimal || 0,
      percentage: ((wasteDistribution.minimal || 0) / total) * 100,
      color: "#10b981", // success
    },
    {
      category: "Small (50-150mm)",
      count: wasteDistribution.small || 0,
      percentage: ((wasteDistribution.small || 0) / total) * 100,
      color: "#3b82f6", // primary
    },
    {
      category: "Medium (150-300mm)",
      count: wasteDistribution.medium || 0,
      percentage: ((wasteDistribution.medium || 0) / total) * 100,
      color: "#f59e0b", // warning
    },
    {
      category: "Large (300-500mm)",
      count: wasteDistribution.large || 0,
      percentage: ((wasteDistribution.large || 0) / total) * 100,
      color: "#ef4444", // error
    },
    {
      category: "Excessive (>500mm)",
      count: wasteDistribution.excessive || 0,
      percentage: ((wasteDistribution.excessive || 0) / total) * 100,
      color: "#dc2626", // error dark
    },
  ];
}

/**
 * Build cost breakdown from result
 */
export function buildCostBreakdown(
  result: OptimizationResult,
): CostBreakdownData {
  const costBreakdown = (
    result as {
      costBreakdown?: {
        materialCost?: number;
        laborCost?: number;
        wasteCost?: number;
        setupCost?: number;
        cuttingCost?: number;
        timeCost?: number;
        totalCost?: number;
      };
    }
  ).costBreakdown;

  if (costBreakdown) {
    const cuts = (result as { cuts?: ReadonlyArray<Cut> }).cuts || [];
    const totalUsedLength = cuts.reduce(
      (sum: number, c: Cut) => sum + (c.usedLength || 0),
      0,
    );
    const totalUsedMeters = totalUsedLength / 1000 || 1;

    return {
      materialCost: costBreakdown.materialCost || 0,
      laborCost: costBreakdown.laborCost || 0,
      wasteCost: costBreakdown.wasteCost || 0,
      setupCost: costBreakdown.setupCost || 0,
      cuttingCost: costBreakdown.cuttingCost || 0,
      timeCost: costBreakdown.timeCost || 0,
      totalCost: costBreakdown.totalCost || result.totalCost || 0,
      costPerMeter:
        (costBreakdown.totalCost || result.totalCost || 0) / totalUsedMeters,
    };
  }

  // Fallback: Use top-level cost fields
  const cuts = (result as { cuts?: ReadonlyArray<Cut> }).cuts || [];
  const totalUsedLength = cuts.reduce(
    (sum: number, c: Cut) => sum + (c.usedLength || 0),
    0,
  );
  const totalUsedMeters = totalUsedLength / 1000 || 1;

  return {
    materialCost: result.totalCost ? result.totalCost * 0.6 : 0,
    laborCost: result.totalCost ? result.totalCost * 0.25 : 0,
    wasteCost: result.totalCost ? result.totalCost * 0.1 : 0,
    setupCost: result.totalCost ? result.totalCost * 0.05 : 0,
    cuttingCost: 0,
    timeCost: 0,
    totalCost: result.totalCost || 0,
    costPerMeter: (result.totalCost || 0) / totalUsedMeters,
  };
}

/**
 * Get consistent color for workOrderId
 */
const workOrderColorCache = new Map<string, string>();
const WORK_ORDER_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // orange
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange-red
  "#14b8a6", // teal
];

export function getWorkOrderColor(workOrderId: string | undefined): string {
  if (!workOrderId || workOrderId === "N/A") {
    return "#94a3b8"; // neutral gray
  }

  // At this point, workOrderId is guaranteed to be a non-empty string
  // Use type assertion to help TypeScript understand the control flow
  const validWorkOrderId = workOrderId as string;

  if (workOrderColorCache.has(validWorkOrderId)) {
    return workOrderColorCache.get(validWorkOrderId)!;
  }

  const colorIndex = workOrderColorCache.size % WORK_ORDER_COLORS.length;
  const color = WORK_ORDER_COLORS[colorIndex];
  if (color) {
    workOrderColorCache.set(validWorkOrderId, color);
    return color;
  }
  // Fallback (should never happen)
  return "#94a3b8";
}

/**
 * Format length with unit
 */
export function formatLength(lengthMm: number): string {
  if (lengthMm >= 1000) {
    return `${(lengthMm / 1000).toFixed(2)}m`;
  }
  return `${lengthMm.toFixed(0)}mm`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get waste category color
 */
export function getWasteCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    minimal: "#10b981",
    small: "#3b82f6",
    medium: "#f59e0b",
    large: "#ef4444",
    excessive: "#dc2626",
  };
  return colors[category] || "#94a3b8";
}

/**
 * Get waste category label
 */
export function getWasteCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    minimal: "Minimal (<50mm)",
    small: "Küçük (50-150mm)",
    medium: "Orta (150-300mm)",
    large: "Büyük (300-500mm)",
    excessive: "Aşırı (>500mm)",
  };
  return labels[category] || category;
}

/**
 * Stock length group interface
 */
export interface StockLengthGroup {
  readonly stockLength: number;
  readonly plans: ReadonlyArray<StockPlan>;
  readonly totalPieces: number;
  readonly totalStocks: number;
  readonly avgEfficiency: number;
}

/**
 * Stock plan interface (grouped by work order)
 */
export interface StockPlan {
  readonly stockLength: number;
  readonly planId: string;
  readonly workOrderId: string;
  readonly algorithm: string;
  readonly stockCount: number; // Bu iş emri için kullanılan toplam stok sayısı
  readonly totalPieces: number; // Bu iş emrinden kesilen toplam parça sayısı
  readonly efficiency: number; // Bu iş emrinin ortalama verimliliği
  readonly totalWaste: number; // Bu iş emrinin toplam atığı
  readonly workOrderCount?: number | undefined; // ✅ FIX: Number of work orders in pooled results
  readonly cuts: ReadonlyArray<{
    readonly cutId: string;
    readonly segments: ReadonlyArray<CutSegment>;
    readonly waste: number;
    readonly efficiency: number;
  }>; // Bu iş emrine ait tüm kesim planları
}

/**
 * Cut segment interface
 */
export interface CutSegment {
  readonly length: number;
  readonly quantity: number;
  readonly workOrderId?: string | undefined; // ✅ FIX: Add workOrderId to CutSegment
  readonly profileType?: string | undefined; // ✅ FIX: Add profileType to CutSegment
}

/**
 * Group cuts by stock length - Simplified version
 */
export function groupCutsByStockLength(
  cuts: ReadonlyArray<Cut>,
  algorithm?: string,
): ReadonlyArray<StockLengthGroup> {
  if (!cuts || cuts.length === 0) {
    return [];
  }

  // Debug logging removed for performance

  // Group cuts by stock length
  const byStockLength: Record<string, Cut[]> = {};

  for (const cut of cuts) {
    const key = String(cut.stockLength);
    if (!byStockLength[key]) {
      byStockLength[key] = [];
    }
    byStockLength[key].push(cut);
  }

  // Transform to StockLengthGroup
  return Object.entries(byStockLength)
    .map(([stockLengthStr, stockCuts]) => {
      const stockLength = Number(stockLengthStr);

      // Calculate aggregates
      const totalWaste = stockCuts.reduce(
        (sum, cut) => sum + cut.remainingLength,
        0,
      );
      const avgEfficiency =
        stockCuts.reduce((sum, cut) => {
          const eff = (cut.usedLength / cut.stockLength) * 100;
          return sum + eff;
        }, 0) / stockCuts.length;

      // Create plans (one plan per cut)
      const plans: StockPlan[] = stockCuts.map((cut) => {
        // Extract work orders from segments
        const workOrderIds = Array.from(
          new Set(
            cut.segments
              .map((s) => s.workOrderId)
              .filter(
                (id) =>
                  id !== undefined && id !== null && id !== "" && id !== "N/A",
              ),
          ),
        );

        // Use first work order ID if available, otherwise N/A
        const workOrderId =
          workOrderIds.length > 0 ? workOrderIds[0] || "N/A" : "N/A";

        return {
          stockLength: cut.stockLength,
          planId: cut.id,
          workOrderId: workOrderId,
          ...(workOrderIds.length > 1
            ? { workOrderCount: workOrderIds.length }
            : {}),
          algorithm: algorithm || "Unknown",
          stockCount: 1, // Each cut = 1 stock
          totalPieces: cut.segmentCount,
          efficiency: (cut.usedLength / cut.stockLength) * 100,
          totalWaste: cut.remainingLength,
          cuts: [
            {
              cutId: cut.id,
              segments: cut.segments.map((s) => ({
                length: s.length,
                quantity: s.quantity || 1,
                workOrderId: s.workOrderId, // ✅ FIX: Preserve workOrderId in segments
                profileType: s.profileType, // ✅ FIX: Preserve profileType in segments
              })),
              waste: cut.remainingLength,
              efficiency: (cut.usedLength / cut.stockLength) * 100,
            },
          ],
        };
      });

      // Calculate totals for this stock length
      const totalPieces = plans.reduce((sum, p) => sum + p.totalPieces, 0);
      const totalStocks = plans.reduce((sum, p) => sum + p.stockCount, 0);

      return {
        stockLength,
        plans,
        totalPieces,
        totalStocks,
        avgEfficiency,
      };
    })
    .sort((a, b) => a.stockLength - b.stockLength); // Sort by stock length ascending
}

/**
 * Format cutting pattern
 */
export function formatCuttingPattern(
  segments: ReadonlyArray<CutSegment>,
  waste: number,
): string {
  // "4x992mm + 3x1200mm + 2x850mm (Atık: 166mm)" formatı
  const parts = segments.map((s) => `${s.quantity}x${s.length}mm`).join(" + ");
  return `${parts} (Atık: ${waste}mm)`;
}

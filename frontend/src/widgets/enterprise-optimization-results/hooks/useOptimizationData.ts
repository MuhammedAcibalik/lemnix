/**
 * @fileoverview Custom hook for optimization data management
 * @module useOptimizationData
 * @version 1.0.0
 */

import React, { useMemo } from "react";
import {
  OptimizationResult,
  WorkOrder,
  Pool,
  Segment,
  Cut,
  StockGroup,
  GroupData,
  DuplicateProfileTypes,
} from "../types";

export const useOptimizationData = (result: OptimizationResult | null) => {
  // Process cutting list from result.cuts
  const processedCuttingList = useMemo(() => {
    if (!result?.cuts) return [];

    const items: Array<{
      id: string;
      workOrderId: string;
      version: string;
      color: string;
      size: string;
      profileType: string;
      length: number;
      quantity: number;
      cuttingPattern: string;
    }> = [];

    result.cuts.forEach((cut) => {
      cut.segments?.forEach((segment) => {
        const workOrderId =
          segment.workOrderId ||
          segment.workOrderItemId ||
          cut.id ||
          "DEFAULT_WORK_ORDER";

        workOrderId &&
          items.push({
            id: `${workOrderId}-${segment.profileType}-${segment.length}`,
            workOrderId: workOrderId,
            version: "V1.0",
            color: "Eloksal",
            size: "40x40",
            profileType: segment.profileType,
            length: segment.length,
            quantity: segment.quantity || 1,
            cuttingPattern: "Standart",
          });
      });
    });

    // Remove duplicates and group
    const uniqueItems = items.reduce(
      (acc, item) => {
        const key = `${item.workOrderId}-${item.profileType}-${item.length}`;
        acc[key] = acc[key]
          ? { ...acc[key], quantity: acc[key].quantity + item.quantity }
          : item;
        return acc;
      },
      {} as Record<string, (typeof items)[0]>,
    );

    return Object.values(uniqueItems);
  }, [result?.cuts]);

  // Check for duplicate profile types
  const checkDuplicateProfileTypes = useMemo(() => {
    if (!result?.cuts) return { hasDuplicates: false, duplicates: [] };

    const profileTypeCount = new Map();
    result.cuts.forEach((cut) => {
      cut.segments?.forEach((segment) => {
        const profileType = segment.profileType;
        profileTypeCount.set(
          profileType,
          (profileTypeCount.get(profileType) || 0) + 1,
        );
      });
    });

    const duplicates = Array.from(profileTypeCount.entries())
      .filter(([_, count]) => count > 1)
      .map(([profileType, count]) => ({ profileType, count }));

    return {
      hasDuplicates: duplicates.length > 0,
      duplicates,
    };
  }, [result?.cuts]);

  // Check if result uses pooling optimization
  const isPoolingOptimization = useMemo(() => {
    return result?.cuts?.some((cut) => cut.poolKey) || false;
  }, [result?.cuts]);

  // Safe "has results" detection
  const hasResults = useMemo(() => {
    return Array.isArray(result?.cuts) && result.cuts.length > 0;
  }, [result?.cuts]);

  // Build enterprise rows
  const aggregatedWorkOrders = useMemo(() => {
    if (!hasResults) return [];
    return buildEnterpriseRows(result).workOrders;
  }, [result, hasResults]);

  // Build pool-based rows
  const aggregatedPools = useMemo(() => {
    if (!hasResults || !isPoolingOptimization) return [];
    return buildPoolRows(result).pools;
  }, [result, hasResults, isPoolingOptimization]);

  // Get work order cutting details
  const getWorkOrderCuttingDetails = (workOrderId: string) => {
    if (!result?.cuts) return [];

    const stockGroups: Record<number, StockGroup> = {};

    result.cuts.forEach((cut) => {
      // Modern functional approach with optional chaining
      const hasWorkOrderSegments =
        cut.segments?.some(
          (segment: Segment) =>
            segment.workOrderId === workOrderId ||
            segment.workOrderItemId === workOrderId,
        ) || false;

      // Modern conditional execution with logical AND
      hasWorkOrderSegments &&
        (() => {
          const stockLength = cut.stockLength;
          // Modern object initialization with logical OR
          stockGroups[stockLength] = stockGroups[stockLength] || {
            stockLength,
            cuts: [],
            totalPieces: 0,
          };
          stockGroups[stockLength].cuts.push(cut);
          stockGroups[stockLength].totalPieces += cut.segmentCount || 0;
        })();
    });

    return Object.values(stockGroups);
  };

  // Get profile type icon
  const getProfileTypeIcon = (profileType: string): React.ReactElement => {
    // This would contain the profile type icon logic
    // For now, return a simple div
    return React.createElement("div", null, profileType);
  };

  // Get algorithm profile - Modern object mapping
  const getAlgorithmProfile = (
    algorithm?: string,
  ): { icon: React.ReactElement; label: string } => {
    const algorithmMap: Record<
      string,
      { icon: React.ReactElement; label: string }
    > = {
      ffd: {
        icon: React.createElement("div", null, "F"),
        label: "FFD",
      },
      bfd: {
        icon: React.createElement("div", null, "B"),
        label: "BFD",
      },
      default: {
        icon: React.createElement("div", null, "?"),
        label: "Bilinmeyen",
      },
    };

    return (
      algorithmMap[algorithm?.toLowerCase() || "default"] ||
      algorithmMap.default
    );
  };

  // Get severity color - Modern pattern matching
  const getSeverityColor = (
    value: number,
    thresholds: { good: number; warning: number },
  ): "success" | "warning" | "error" => {
    const severityMap = [
      { condition: value >= thresholds.good, result: "success" as const },
      { condition: value >= thresholds.warning, result: "warning" as const },
      { condition: true, result: "error" as const },
    ];

    return severityMap.find(({ condition }) => condition)?.result || "error";
  };

  // Get recommendation icon - Modern object mapping
  const getRecommendationIcon = (severity: string): React.ReactElement => {
    const iconMap: Record<string, React.ReactElement> = {
      critical: React.createElement("div", null, "Error"),
      error: React.createElement("div", null, "Error"),
      warning: React.createElement("div", null, "Warning"),
      info: React.createElement("div", null, "Info"),
    };

    return iconMap[severity.toLowerCase()] || iconMap.info;
  };

  // Generate cutting pattern explanation
  const generateCuttingPatternExplanation = (
    group: { cuts: Cut[] },
    groupData: GroupData,
  ): string => {
    const { totalPieces, barCount, avgRemaining, groupEfficiency } = groupData;
    const stockLength = group.cuts[0]?.stockLength || 6100;
    const profileType = group.cuts[0]?.profileType || "Bilinmeyen";

    let explanation = `📊 **${profileType} Profil Tipi Kesim Analizi**\n\n`;
    explanation += `🔹 **Stok Uzunluğu:** ${stockLength} mm\n`;
    explanation += `🔹 **Kullanılan Profil Sayısı:** ${barCount} adet\n`;
    explanation += `🔹 **Toplam Kesilen Parça:** ${totalPieces} adet\n`;
    explanation += `🔹 **Ortalama Atık:** ${avgRemaining} mm\n`;
    explanation += `🔹 **Verimlilik Oranı:** %${groupEfficiency.toFixed(1)}\n\n`;

    return explanation;
  };

  // Format mm
  const fmtMm = (n: number): string =>
    Number.isFinite(n) ? `${Math.round(n)} mm` : "—";

  // Format plan label from segments
  const formatPlanLabelFromSegments = (
    segments: Array<{ length: number }>,
  ): string => {
    if (!segments || segments.length === 0) return "Plan yok";
    const count = new Map<number, number>();
    segments.forEach((s) =>
      count.set(s.length, (count.get(s.length) ?? 0) + 1),
    );
    return [...count.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([L, n]) => `${n} × ${L} mm`)
      .join(" + ");
  };

  return {
    processedCuttingList,
    checkDuplicateProfileTypes,
    aggregatedWorkOrders,
    aggregatedPools,
    isPoolingOptimization,
    hasResults,
    getWorkOrderCuttingDetails,
    getProfileTypeIcon,
    getAlgorithmProfile,
    getSeverityColor,
    getRecommendationIcon,
    generateCuttingPatternExplanation,
    fmtMm,
    formatPlanLabelFromSegments,
  };
};

// Helper functions
function buildEnterpriseRows(result: OptimizationResult | null): {
  workOrders: WorkOrder[];
} {
  const cuts: Cut[] = Array.isArray(result?.cuts)
    ? (result.cuts.map((c) => ({
        ...c,
        segmentCount: c.segmentCount || 0,
      })) as Cut[])
    : [];

  const validCuts = cuts
    .filter(
      (c): c is Cut =>
        c &&
        Number.isFinite(c.stockLength) &&
        Number.isFinite(c.usedLength) &&
        Number.isFinite(c.remainingLength),
    )
    .map((c) => ({ ...c, segmentCount: c.segmentCount || 0 })) as Cut[];

  const defaultWO: string | number | undefined = undefined; // No workOrderId at result level
  const grouped = new Map<string | number, Cut[]>();

  for (const c of validCuts) {
    let wo: string | number | undefined = undefined;

    if (c.segments && c.segments.length > 0) {
      const segmentWithWO = c.segments.find((s: Segment) =>
        Boolean(s.workOrderId || s.workOrderItemId),
      );
      wo = segmentWithWO?.workOrderId || segmentWithWO?.workOrderItemId;
    }

    // Modern null coalescing with fallback chain
    wo = wo || c.workOrderId || defaultWO || "DEFAULT_WORK_ORDER";

    const key = typeof wo === "number" ? wo : String(wo);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(c);
  }

  const workOrders = [...grouped.entries()].map(([wo, list]) => {
    const stockCount = list.length;
    const totalSegments = list.reduce((s, x) => s + (x.segmentCount || 0), 0);
    const efficiencyResult = calculateWorkOrderEfficiency(list);

    return {
      workOrderId: wo,
      algorithm: result?.algorithm,
      stockCount,
      totalSegments,
      efficiency: efficiencyResult.efficiency,
      totalWaste: efficiencyResult.totalWaste,
      cuts: list.map((cut) => ({
        ...cut,
        segmentCount: cut.segmentCount || 0,
      })) as Cut[],
    };
  });

  return { workOrders };
}

function buildPoolRows(result: OptimizationResult | null): {
  pools: Array<{
    poolKey: string;
    profileType: string;
    workOrderCount: number;
    stockCount: number;
    totalSegments: number;
    efficiency: number;
    cuts: Cut[];
  }>;
} {
  const cuts: Cut[] = Array.isArray(result?.cuts)
    ? (result.cuts.map((c) => ({
        ...c,
        segmentCount: c.segmentCount || 0,
      })) as Cut[])
    : [];

  const poolMap = new Map<string, Cut[]>();

  cuts.forEach((cut) => {
    const poolKey = cut.poolKey || "default";
    // Modern Map handling with logical OR
    poolMap.has(poolKey) || poolMap.set(poolKey, []);
    poolMap.get(poolKey)!.push(cut);
  });

  const pools = Array.from(poolMap.entries()).map(([poolKey, poolCuts]) => {
    const stockCount = poolCuts.length;
    const totalSegments = poolCuts.reduce(
      (sum, cut) => sum + (cut.segmentCount || 0),
      0,
    );

    const workOrderIds = new Set<string>();
    poolCuts.forEach((cut) => {
      // Modern conditional execution with optional chaining
      cut.workOrderBreakdown?.forEach(
        (breakdown: { workOrderId: string | number }) => {
          workOrderIds.add(String(breakdown.workOrderId));
        },
      );

      // Modern conditional with logical AND
      cut.workOrderId &&
        cut.workOrderId !== "MIXED" &&
        workOrderIds.add(String(cut.workOrderId));
    });

    return {
      poolKey,
      profileType: poolCuts[0]?.segments?.[0]?.profileType || "Unknown",
      workOrderCount: workOrderIds.size,
      stockCount,
      totalSegments,
      efficiency: result?.efficiency || 0,
      cuts: poolCuts.map((cut) => ({
        ...cut,
        segmentCount: cut.segmentCount || 0,
      })) as Cut[],
    };
  });

  return { pools };
}

function calculateWorkOrderEfficiency(cuts: Cut[]): {
  efficiency: number;
  totalStockLength: number;
  totalUsedLength: number;
  totalWaste: number;
  isValid: boolean;
  errors: string[];
} {
  if (!cuts || !Array.isArray(cuts) || cuts.length === 0) {
    return {
      efficiency: 0,
      totalStockLength: 0,
      totalUsedLength: 0,
      totalWaste: 0,
      isValid: true,
      errors: [],
    };
  }

  const errors: string[] = [];
  let totalStockLength = 0;
  let totalUsedLength = 0;
  let totalWaste = 0;

  for (const cut of cuts) {
    if (!cut || typeof cut !== "object") {
      errors.push(`Invalid cut object: ${JSON.stringify(cut)}`);
      continue;
    }

    const stockLength = Number(cut.stockLength);
    const usedLength = Number(cut.usedLength);
    const remainingLength = Number(cut.remainingLength);

    if (!isFinite(stockLength) || stockLength <= 0) {
      errors.push(`Invalid stockLength: ${cut.stockLength} for cut ${cut.id}`);
      continue;
    }

    if (!isFinite(usedLength) || usedLength < 0) {
      errors.push(`Invalid usedLength: ${cut.usedLength} for cut ${cut.id}`);
      continue;
    }

    if (!isFinite(remainingLength) || remainingLength < 0) {
      errors.push(
        `Invalid remainingLength: ${cut.remainingLength} for cut ${cut.id}`,
      );
      continue;
    }

    const tolerance = 1e-9;
    const sum = usedLength + remainingLength;
    if (Math.abs(sum - stockLength) > tolerance) {
      errors.push(
        `Invariant violation: usedLength (${usedLength}) + remainingLength (${remainingLength}) !== stockLength (${stockLength}) for cut ${cut.id}`,
      );
      continue;
    }

    totalStockLength += stockLength;
    totalUsedLength += usedLength;
    totalWaste += remainingLength;
  }

  if (totalStockLength <= 0) {
    errors.push(`Total stock length is zero or negative: ${totalStockLength}`);
    return {
      efficiency: 0,
      totalStockLength: 0,
      totalUsedLength: 0,
      totalWaste: 0,
      isValid: false,
      errors,
    };
  }

  const efficiency = (totalUsedLength / totalStockLength) * 100;

  if (!isFinite(efficiency) || efficiency < 0 || efficiency > 100) {
    errors.push(`Invalid efficiency calculated: ${efficiency}`);
    return {
      efficiency: 0,
      totalStockLength,
      totalUsedLength,
      totalWaste,
      isValid: false,
      errors,
    };
  }

  const precision = 100;
  const roundedEfficiency = Math.round(efficiency * precision) / precision;
  const finalEfficiency = Math.max(0, Math.min(100, roundedEfficiency));

  return {
    efficiency: finalEfficiency,
    totalStockLength,
    totalUsedLength,
    totalWaste,
    isValid: errors.length === 0,
    errors,
  };
}

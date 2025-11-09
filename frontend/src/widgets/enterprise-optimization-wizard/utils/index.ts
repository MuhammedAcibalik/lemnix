/**
 * @fileoverview Enterprise Optimization Wizard Utilities
 * @module EnterpriseOptimizationWizard/Utils
 * @version 1.0.0
 */

import {
  LengthUnit,
  PreviewMetrics,
  OptimizationRequest,
  OptimizationItem,
} from "../types";
import { PERFORMANCE_CONFIG, COST_MODEL } from "../constants";

// Unit conversion utilities
export const convertUnit = (
  value: number,
  from: LengthUnit,
  to: LengthUnit,
): number => {
  if (from === to) return value;

  // Convert to mm first
  let mmValue = value;
  if (from === "cm") mmValue = value * 10;
  if (from === "m") mmValue = value * 1000;

  // Convert from mm to target
  if (to === "mm") return mmValue;
  if (to === "cm") return mmValue / 10;
  if (to === "m") return mmValue / 1000;

  return value;
};

// Format value with unit
export const formatWithUnit = (value: number, unit: LengthUnit): string => {
  const precision = unit === "mm" ? 0 : unit === "cm" ? 1 : 2;
  return `${value.toFixed(precision)} ${unit}`;
};

// Calculate preview metrics
export const calculatePreviewMetrics = (
  cuttingList: Array<{ length: number; quantity: number }>,
  stockLengths: number[],
): PreviewMetrics => {
  const totalLength = cuttingList.reduce(
    (sum, item) => sum + item.length * item.quantity,
    0,
  );
  const totalPieces = cuttingList.reduce((sum, item) => sum + item.quantity, 0);
  const avgLength = totalPieces > 0 ? totalLength / totalPieces : 0;
  const stockNeeded = Math.ceil(totalLength / Math.min(...stockLengths));

  return {
    totalItems: cuttingList.length,
    totalLength,
    totalPieces,
    avgLength,
    estimatedStock: stockNeeded,
    stockNeeded,
    estimatedWaste: stockNeeded * Math.min(...stockLengths) - totalLength,
    estimatedTime: totalPieces * 0.5, // 0.5 minutes per piece
    estimatedCost: totalLength * 0.1, // 0.1 cost per mm
    algorithmComplexity: "medium" as const,
    expectedEfficiency: 85,
  };
};

// Transform cutting list to optimization items
export const transformToOptimizationItems = (
  cuttingList: Array<{
    profileType: string;
    length: number;
    quantity: number;
    workOrderId: string;
    color: string;
    version: string;
    size: string;
    cuttingPattern: string;
  }>,
  unit: LengthUnit,
): OptimizationItem[] => {
  return cuttingList.map((item, index) => ({
    id: (item as any).id || `${item.workOrderId}-${index}`,
    profileType: item.profileType,
    length: convertUnit(item.length, unit, "mm"),
    quantity: item.quantity,
    totalLength: convertUnit(item.length, unit, "mm") * item.quantity,
    workOrderId: item.workOrderId,
    color: item.color,
    version: item.version,
    size: item.size,
    cuttingPattern: item.cuttingPattern || "Düz",
  }));
};

// Build optimization request
export const buildOptimizationRequest = (
  items: OptimizationItem[],
  params: {
    algorithm: string;
    objectives: Array<{ type: string; weight: number; priority: string }>;
    constraints: {
      kerfWidth: number;
      startSafety: number;
      endSafety: number;
      minScrapLength: number;
      maxWastePercentage: number;
      maxCutsPerStock: number;
    };
    stockLengths: number[];
    unit: LengthUnit;
  },
): OptimizationRequest => {
  return {
    items,
    algorithm: params.algorithm as "ffd" | "bfd" | "genetic" | "pooling",
    objectives: params.objectives.map((obj) => ({
      type: obj.type as
        | "minimize-waste"
        | "maximize-efficiency"
        | "minimize-cost"
        | "minimize-time"
        | "maximize-quality",
      weight: obj.weight,
      priority: obj.priority as "low" | "medium" | "high",
      target: (obj as any).target,
      tolerance: (obj as any).tolerance,
    })),
    constraints: {
      ...params.constraints,
      kerfWidth: convertUnit(params.constraints.kerfWidth, params.unit, "mm"),
      startSafety: convertUnit(
        params.constraints.startSafety,
        params.unit,
        "mm",
      ),
      endSafety: convertUnit(params.constraints.endSafety, params.unit, "mm"),
      minScrapLength: convertUnit(
        params.constraints.minScrapLength,
        params.unit,
        "mm",
      ),
    },
    stockLengths: params.stockLengths,
    unit: params.unit,
  };
};

// Validation utilities
export const validateCuttingList = (
  cuttingList: Array<{ length: number; quantity: number }>,
): boolean => {
  return (
    cuttingList.length > 0 &&
    cuttingList.every((item) => item.length > 0 && item.quantity > 0)
  );
};

export const validateOptimizationParams = (params: {
  algorithm: string;
  objectives: Array<{ weight: number }>;
  constraints: {
    kerfWidth: number;
    maxWastePercentage: number;
  };
  stockLengths: number[];
}): boolean => {
  const objectivesValid =
    params.objectives.length > 0 &&
    params.objectives.every((obj) => obj.weight >= 0);
  const constraintsValid =
    params.constraints.kerfWidth >= 0 &&
    params.constraints.maxWastePercentage >= 0 &&
    params.constraints.maxWastePercentage <= 100;
  const stockValid =
    params.stockLengths.length > 0 &&
    params.stockLengths.every((length) => length > 0);

  return objectivesValid && constraintsValid && stockValid;
};

// Debug logging utility
export const debugLog = (message: string, data?: unknown): void => {
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
  ) {
    console.log(`🔍 ${message}`, data);
  }
};

// Error handling utility
export const handleApiError = (
  error: unknown,
  defaultMessage: string,
): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return defaultMessage;
};

// Array utilities
export const generateUniqueId = (): string => {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const normalizeWeights = (
  objectives: Array<{ weight: number }>,
): Array<{ weight: number }> => {
  const totalWeight = objectives.reduce((sum, obj) => sum + obj.weight, 0);
  if (totalWeight > 0) {
    return objectives.map((obj) => ({
      ...obj,
      weight: obj.weight / totalWeight,
    }));
  }
  return objectives;
};

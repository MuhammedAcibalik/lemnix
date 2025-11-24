/**
 * LEMNİX Optimization Entity DTOs
 * Data Transfer Object transformations for backend-frontend alignment
 *
 * @module entities/optimization/api/dto
 * @version 2.0.0 - Backend Response Normalization + Zod Validation
 */

import type {
  OptimizationResult,
  Cut,
  CuttingSegment,
  WasteDistribution,
  OptimizationRecommendation,
  AlgorithmMetadata,
  CostBreakdown,
} from "../model/types";
import type { Timestamp, ID } from "@/shared";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface BackendCut {
  readonly id: string;
  readonly stockLength: number;
  readonly usedLength: number;
  readonly remainingLength: number;
  readonly segments: readonly BackendSegment[];
}

interface BackendSegment {
  readonly id: string;
  readonly workOrderId: string;
  readonly profileType: string;
  readonly length: number;
  readonly quantity: number;
}

interface OptimizationConstraints {
  readonly maxWastePercentage: number;
  readonly minEfficiency: number;
  readonly maxStockCount: number;
  readonly kerfWidth: number;
  readonly startSafety: number;
  readonly endSafety: number;
  readonly minScrapLength: number;
}

interface BackendWasteDistribution {
  readonly minimal?: number;
  readonly small?: number;
  readonly medium?: number;
  readonly large?: number;
  readonly excessive?: number;
}

interface BackendRecommendation {
  readonly type?: string;
  readonly priority?: string;
  readonly message?: string;
  readonly impact?: number;
  readonly actionable?: boolean;
}

interface BackendAlgorithmMetadata {
  readonly effectiveComplexity?: string;
  readonly actualGenerations?: number;
  readonly convergenceReason?: string;
  readonly bestFitness?: number;
  readonly executionTimeMs?: number;
  readonly deterministicSeed?: boolean;
}

interface BackendCostBreakdown {
  readonly materialCost?: number;
  readonly laborCost?: number;
  readonly wasteCost?: number;
  readonly setupCost?: number;
  readonly totalCost?: number;
  readonly cuttingCost?: number;
}
import { validateOptimizationResult as zodValidate } from "../model/responseSchemas";

/**
 * Backend response type (as returned by API)
 * Handles naming inconsistencies between backend and frontend
 */
interface BackendOptimizationResult {
  readonly cuts: ReadonlyArray<BackendCut>;
  readonly totalWaste: number;
  readonly efficiency: number; // Backend uses 'efficiency' instead of 'totalEfficiency'
  readonly stockCount: number; // Backend uses 'stockCount' instead of 'totalStocks'
  readonly totalSegments?: number;
  readonly wastePercentage: number;
  readonly averageCutsPerStock?: number;
  readonly totalLength?: number;
  readonly setupTime?: number;
  readonly materialUtilization?: number;
  readonly cuttingComplexity?: number;
  readonly cuttingTime?: number;
  readonly totalTime?: number;
  readonly materialCost?: number;
  readonly wasteCost?: number;
  readonly laborCost?: number;
  readonly totalCost?: number;
  readonly costPerMeter?: number;
  readonly qualityScore?: number;
  readonly reclaimableWastePercentage?: number;
  readonly algorithm: string;
  readonly executionTimeMs: number;
  readonly wasteDistribution?: WasteDistribution;
  readonly constraints?: OptimizationConstraints;
  readonly recommendations?: ReadonlyArray<OptimizationRecommendation>;
  readonly algorithmMetadata?: AlgorithmMetadata;
  readonly costBreakdown?: CostBreakdown;
  readonly optimizationScore?: number;
  readonly confidence?: number;
}

/**
 * Normalize backend OptimizationResult to frontend type
 * Handles field name differences and missing fields
 */
export function normalizeOptimizationResult(
  backendResult: BackendOptimizationResult,
): OptimizationResult {
  // Normalize algorithm type
  const algorithm = normalizeAlgorithmType(backendResult.algorithm);

  // Normalize cuts
  const cuts = backendResult.cuts.map(normalizeCut);

  // Calculate totalStocks from cuts if stockCount is missing
  const totalStocks = backendResult.stockCount ?? cuts.length;

  // Normalize efficiency field name
  const totalEfficiency = backendResult.efficiency;

  // Normalize waste distribution
  const wasteDistribution = backendResult.wasteDistribution
    ? normalizeWasteDistribution(backendResult.wasteDistribution)
    : undefined;

  // Normalize recommendations
  const recommendations = (backendResult.recommendations ?? []).map(
    normalizeRecommendation,
  );

  // Normalize algorithm metadata
  const algorithmMetadata = backendResult.algorithmMetadata
    ? normalizeAlgorithmMetadata(
        backendResult.algorithmMetadata as unknown as BackendAlgorithmMetadata,
      )
    : undefined;

  // Normalize cost breakdown
  const costBreakdown = backendResult.costBreakdown
    ? normalizeCostBreakdown(backendResult.costBreakdown)
    : undefined;

  const result: OptimizationResult = {
    cuts,
    totalStocks,
    totalWaste: backendResult.totalWaste,
    totalEfficiency,
    totalCost: backendResult.totalCost ?? 0,
    wastePercentage: backendResult.wastePercentage,
    algorithm,
    executionTime: backendResult.executionTimeMs,
    timestamp: new Date().toISOString() as unknown as Timestamp,
    wasteDistribution: wasteDistribution || {
      minimal: 0,
      small: 0,
      medium: 0,
      large: 0,
      excessive: 0,
      reclaimable: 0,
      totalPieces: 0,
    },
    recommendations,
    ...(backendResult.qualityScore !== undefined
      ? { qualityScore: backendResult.qualityScore }
      : {}),
    ...(backendResult.confidence !== undefined
      ? { confidence: backendResult.confidence }
      : {}),
    ...(backendResult.optimizationScore !== undefined
      ? { optimizationScore: backendResult.optimizationScore }
      : {}),
    ...(backendResult.materialUtilization !== undefined
      ? { materialUtilization: backendResult.materialUtilization }
      : {}),
    ...(backendResult.reclaimableWastePercentage !== undefined
      ? { reclaimableWastePercentage: backendResult.reclaimableWastePercentage }
      : {}),
    ...(algorithmMetadata ? { algorithmMetadata } : {}),
    ...(costBreakdown ? { costBreakdown } : {}),
  };

  return result;
}

/**
 * Normalize algorithm type string to AlgorithmType
 */
function normalizeAlgorithmType(algorithm: string): "bfd" | "genetic" {
  const normalized = algorithm.toLowerCase();

  // Handle various backend naming variations
  switch (normalized) {
    case "bfd":
    case "best-fit-decreasing":
    case "best_fit_decreasing":
      return "bfd";

    case "genetic":
    case "genetic-algorithm":
    case "genetic_algorithm":
    case "ga":
      return "genetic";

    default:
      console.warn(
        `Unknown algorithm type: ${algorithm}, defaulting to 'genetic'`,
      );
      return "genetic";
  }
}

/**
 * Normalize backend Cut to frontend type
 */
function normalizeCut(backendCut: BackendCut): Cut {
  // Handle both 'materialType' and 'profileType' fields from backend
  const profileType =
    (backendCut as { profileType?: string; materialType?: string })
      .profileType ??
    (backendCut as { profileType?: string; materialType?: string })
      .materialType;

  const cut: Cut = {
    id: (backendCut.id ??
      `cut-${Math.random().toString(36).substr(2, 9)}`) as unknown as ID,
    stockLength: backendCut.stockLength,
    segments: (backendCut.segments ?? []).map(normalizeSegment),
    usedLength: backendCut.usedLength,
    remainingLength: backendCut.remainingLength,
    wasteCategory: normalizeWasteCategory(
      (backendCut as { wasteCategory?: string }).wasteCategory,
    ),
    isReclaimable:
      (backendCut as { isReclaimable?: boolean }).isReclaimable ?? false,
  };

  const workOrderId = (backendCut as { workOrderId?: string }).workOrderId;
  const quantity = (backendCut as { quantity?: number }).quantity;

  return {
    ...cut,
    ...(workOrderId ? { workOrderId } : {}),
    ...(profileType ? { profileType } : {}),
    ...(quantity !== undefined ? { quantity } : {}),
  };
}

/**
 * Normalize backend CuttingSegment to frontend type
 */
function normalizeSegment(backendSegment: BackendSegment): CuttingSegment {
  return {
    id: (backendSegment.id ??
      `segment-${Math.random().toString(36).substr(2, 9)}`) as unknown as ID,
    length: backendSegment.length,
    quantity: backendSegment.quantity ?? 1,
    position: (backendSegment as { position?: number }).position ?? 0,
    endPosition:
      (
        backendSegment as {
          endPosition?: number;
          position?: number;
          length: number;
        }
      ).endPosition ??
      ((backendSegment as { position?: number; length: number }).position ??
        0) + backendSegment.length,
    workOrderId: backendSegment.workOrderId,
    workOrderItemId:
      (backendSegment as { workOrderItemId?: string }).workOrderItemId ??
      backendSegment.workOrderId,
    profileType: backendSegment.profileType,
    color: (backendSegment as { color?: string }).color ?? "#000000",
    version: (backendSegment as { version?: string }).version ?? "1.0",
    ...((backendSegment as { note?: string }).note
      ? { note: (backendSegment as { note?: string }).note }
      : {}),
  };
}

/**
 * Normalize waste category string
 */
function normalizeWasteCategory(
  category: string | undefined,
): "minimal" | "small" | "medium" | "large" | "excessive" {
  const normalized = category?.toLowerCase() ?? "minimal";

  if (
    ["minimal", "small", "medium", "large", "excessive"].includes(normalized)
  ) {
    return normalized as "minimal" | "small" | "medium" | "large" | "excessive";
  }

  return "minimal";
}

/**
 * Normalize waste distribution
 */
function normalizeWasteDistribution(
  distribution: BackendWasteDistribution,
): WasteDistribution {
  return {
    minimal: distribution?.minimal ?? 0,
    small: distribution?.small ?? 0,
    medium: distribution?.medium ?? 0,
    large: distribution?.large ?? 0,
    excessive: distribution?.excessive ?? 0,
    reclaimable: (distribution as { reclaimable?: number }).reclaimable ?? 0,
    totalPieces: (distribution as { totalPieces?: number }).totalPieces ?? 0,
  };
}

/**
 * Normalize recommendation
 */
function normalizeRecommendation(
  rec: BackendRecommendation,
): OptimizationRecommendation {
  const recommendation: OptimizationRecommendation = {
    type:
      (rec.type as "performance" | "cost" | "quality" | "waste") ??
      "performance",
    priority: (rec.priority as "low" | "medium" | "high") ?? "medium",
    message: rec.message ?? "",
  };

  return {
    ...recommendation,
    ...(rec.impact !== undefined ? { impact: rec.impact } : {}),
    ...(rec.actionable !== undefined ? { actionable: rec.actionable } : {}),
  };
}

/**
 * Normalize algorithm metadata (GA telemetry)
 */
function normalizeAlgorithmMetadata(
  metadata: BackendAlgorithmMetadata,
): AlgorithmMetadata {
  const result: AlgorithmMetadata = {
    effectiveComplexity: metadata.effectiveComplexity ?? "N/A",
    actualGenerations: metadata.actualGenerations ?? 0,
    convergenceReason:
      (metadata.convergenceReason as
        | "early_stop"
        | "max_generations"
        | "stagnation") ?? "max_generations",
    bestFitness: metadata.bestFitness ?? 0,
    executionTimeMs: metadata.executionTimeMs ?? 0,
  };

  const deterministicSeed =
    typeof metadata.deterministicSeed === "number"
      ? metadata.deterministicSeed
      : undefined;
  const populationSize = (metadata as { populationSize?: number })
    .populationSize;
  const finalGeneration = (metadata as { finalGeneration?: number })
    .finalGeneration;

  return {
    ...result,
    ...(deterministicSeed !== undefined ? { deterministicSeed } : {}),
    ...(populationSize !== undefined ? { populationSize } : {}),
    ...(finalGeneration !== undefined ? { finalGeneration } : {}),
  };
}

/**
 * Normalize cost breakdown
 */
function normalizeCostBreakdown(
  breakdown: BackendCostBreakdown,
): CostBreakdown {
  const result: CostBreakdown = {
    materialCost: breakdown.materialCost ?? 0,
    laborCost: breakdown.laborCost ?? 0,
    wasteCost: breakdown.wasteCost ?? 0,
    setupCost: breakdown.setupCost ?? 0,
    totalCost: breakdown.totalCost ?? 0,
  };

  const cuttingCost = breakdown.cuttingCost;
  const timeCost = (breakdown as { timeCost?: number }).timeCost;

  return {
    ...result,
    ...(cuttingCost !== undefined ? { cuttingCost } : {}),
    ...(timeCost !== undefined ? { timeCost } : {}),
  };
}

/**
 * Type guard: Check if response is valid OptimizationResult
 */
export function isValidOptimizationResult(
  data: unknown,
): data is BackendOptimizationResult {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const result = data as BackendOptimizationResult;

  // Check required fields
  return (
    Array.isArray(result.cuts) &&
    typeof result.totalWaste === "number" &&
    (typeof result.efficiency === "number" ||
      typeof (result as { totalEfficiency?: number }).totalEfficiency ===
        "number") &&
    (typeof result.stockCount === "number" ||
      typeof (result as { totalStocks?: number }).totalStocks === "number") &&
    typeof result.wastePercentage === "number" &&
    typeof result.algorithm === "string"
  );
}

/**
 * Safe normalization with Zod validation + type guard
 * ✅ P2-5: Dual-layer validation (Zod + Type Guard)
 */
export function safeNormalizeOptimizationResult(
  data: unknown,
): OptimizationResult | null {
  // Layer 1: Zod validation
  const zodValidated = zodValidate(data);

  if (!zodValidated) {
    console.error("Zod validation failed for optimization result");
    return null;
  }

  // Layer 2: Type guard validation (backward compatibility)
  if (!isValidOptimizationResult(zodValidated)) {
    console.error("Type guard validation failed for optimization result");
    return null;
  }

  // Layer 3: Normalization
  try {
    return normalizeOptimizationResult(zodValidated);
  } catch (error) {
    console.error("Failed to normalize optimization result:", error);
    return null;
  }
}

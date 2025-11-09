/**
 * LEMNİX Optimization Entity Response Schemas
 * Zod schemas for backend response validation
 *
 * @module entities/optimization/model
 * @version 1.0.0 - Response Validation Layer
 */

import { z } from "zod";

/**
 * Algorithm type schema
 */
export const algorithmTypeSchema = z.enum(["ffd", "bfd", "genetic", "pooling"]);

/**
 * Waste category schema
 */
export const wasteCategorySchema = z.enum([
  "minimal",
  "small",
  "medium",
  "large",
  "excessive",
]);

/**
 * Cutting segment schema
 */
export const cuttingSegmentSchema = z.object({
  id: z.string(),
  length: z.number().positive(),
  quantity: z.number().int().positive(),
  position: z.number().nonnegative(),
  endPosition: z.number().nonnegative(),
  workOrderId: z.string().optional(),
  workOrderItemId: z.string().optional(),
  profileType: z.string(),
  color: z.string().optional(),
  version: z.string().optional(),
  note: z.string().optional(),
});

/**
 * Cut schema
 */
export const cutSchema = z.object({
  id: z.string(),
  stockLength: z.number().positive(),
  segments: z.array(cuttingSegmentSchema).readonly(),
  usedLength: z.number().nonnegative(),
  remainingLength: z.number().nonnegative(),
  wasteCategory: wasteCategorySchema,
  isReclaimable: z.boolean(),
  workOrderId: z.string().optional(),
  profileType: z.string().optional(),
  quantity: z.number().int().positive().optional(),
});

/**
 * Waste distribution schema
 */
export const wasteDistributionSchema = z.object({
  minimal: z.number().nonnegative(),
  small: z.number().nonnegative(),
  medium: z.number().nonnegative(),
  large: z.number().nonnegative(),
  excessive: z.number().nonnegative(),
  reclaimable: z.number().nonnegative(),
  totalPieces: z.number().int().nonnegative(),
});

/**
 * Optimization recommendation schema
 */
export const optimizationRecommendationSchema = z.object({
  type: z.enum(["performance", "cost", "quality", "waste"]),
  priority: z.enum(["low", "medium", "high"]),
  message: z.string(),
  impact: z.number().optional(),
  actionable: z.boolean().optional(),
});

/**
 * Algorithm metadata schema (GA telemetry)
 */
export const algorithmMetadataSchema = z
  .object({
    effectiveComplexity: z.string(),
    actualGenerations: z.number().int().nonnegative(),
    convergenceReason: z.enum(["early_stop", "max_generations", "stagnation"]),
    bestFitness: z.number().min(0).max(1),
    executionTimeMs: z.number().nonnegative(),
    deterministicSeed: z.number().optional(),
    populationSize: z.number().int().positive().optional(),
    finalGeneration: z.number().int().nonnegative().optional(),
  })
  .optional();

/**
 * Cost breakdown schema
 */
export const costBreakdownSchema = z
  .object({
    materialCost: z.number().nonnegative(),
    laborCost: z.number().nonnegative(),
    wasteCost: z.number().nonnegative(),
    setupCost: z.number().nonnegative(),
    totalCost: z.number().nonnegative(),
    cuttingCost: z.number().nonnegative().optional(),
    timeCost: z.number().nonnegative().optional(),
  })
  .optional();

/**
 * Pareto frontier schema
 */
export const paretoFrontierSchema = z
  .object({
    waste: z.number().nonnegative(),
    cost: z.number().nonnegative(),
    time: z.number().nonnegative(),
    efficiency: z.number().min(0).max(1),
  })
  .optional();

/**
 * Optimization result schema (backend response)
 * Validates all required and optional fields
 */
export const optimizationResultSchema = z.object({
  // Core fields
  cuts: z.array(cutSchema).readonly(),
  totalStocks: z.number().int().nonnegative().optional(), // Frontend field
  stockCount: z.number().int().nonnegative().optional(), // Backend field (legacy)
  totalWaste: z.number().nonnegative(),
  totalEfficiency: z.number().min(0).max(1).optional(), // Frontend field
  efficiency: z.number().min(0).max(1).optional(), // Backend field (legacy)
  totalCost: z.number().nonnegative(),
  wastePercentage: z.number().min(0).max(100),
  algorithm: algorithmTypeSchema.or(z.string()), // Allow string for normalization
  executionTime: z.number().nonnegative().optional(), // Frontend field
  executionTimeMs: z.number().nonnegative().optional(), // Backend field (legacy)
  timestamp: z.string().datetime(),
  wasteDistribution: wasteDistributionSchema,
  recommendations: z.array(optimizationRecommendationSchema).readonly(),

  // Optional enhanced fields
  id: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  algorithmMetadata: algorithmMetadataSchema,
  paretoFrontier: paretoFrontierSchema,
  costBreakdown: costBreakdownSchema,
  qualityScore: z.number().min(0).max(100).optional(),
  confidence: z.number().min(0).max(1).optional(),
  optimizationScore: z.number().min(0).max(100).optional(),
  materialUtilization: z.number().min(0).max(1).optional(),
  reclaimableWastePercentage: z.number().min(0).max(100).optional(),
});

/**
 * Validate optimization result from backend
 *
 * @param data - Backend response data
 * @returns Validated and typed result, or null if invalid
 */
export function validateOptimizationResult(data: unknown) {
  const result = optimizationResultSchema.safeParse(data);

  if (!result.success) {
    console.error(
      "Optimization result validation failed:",
      result.error.issues,
    );
    return null;
  }

  return result.data;
}

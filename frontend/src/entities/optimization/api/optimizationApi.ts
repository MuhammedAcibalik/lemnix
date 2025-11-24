/**
 * LEMNİX Optimization Entity API
 * Backend API calls for optimization operations
 *
 * @module entities/optimization/api
 * @version 2.0.0 - Enhanced for GA v1.7.1
 */

import { api } from "@/shared";
import type {
  OptimizationRequest,
  OptimizationResult,
  OptimizationHistoryEntry,
  AlgorithmInfo,
  ExportOptimizationRequest,
  ExportOptimizationResponse,
} from "../model/types";
import { ALGORITHM_CATALOG } from "../model/types";
import { validateOptimizationRequest as validateOptimizationRequestSchema } from "../model/schemas";
import {
  normalizeOptimizationResult,
  safeNormalizeOptimizationResult,
} from "./dto";

/**
 * API endpoints - Enhanced
 */
const ENDPOINTS = {
  OPTIMIZE: "/enterprise/optimize",
  VALIDATE: "/enterprise/validate", // NEW
  ESTIMATE: "/enterprise/estimate", // NEW
  ALGORITHMS: "/enterprise/algorithms", // NEW
  HISTORY: "/enterprise/history",
  METRICS: "/enterprise/metrics",
  HEALTH: "/enterprise/health",
  EXPORT: "/enterprise/export", // NEW: P0-3
  ANALYTICS: "/enterprise/analytics", // NEW
  OPTIMIZE_BY_PROFILE: "/enterprise/optimize-by-profile", // NEW: P0-5
} as const;

/**
 * Validate optimization request before submitting
 * Performs both client-side (Zod) and server-side validation
 */
export async function validateOptimizationRequest(
  request: OptimizationRequest,
): Promise<{
  readonly valid: boolean;
  readonly errors?: ReadonlyArray<string>;
  readonly warnings?: ReadonlyArray<string>;
}> {
  // Client-side validation first
  const clientValidation = validateOptimizationRequestSchema(request);

  if (!clientValidation.success) {
    return {
      valid: false,
      errors: clientValidation.error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`,
      ),
    };
  }

  // Server-side validation
  try {
    const response = await api.post<{
      readonly valid: boolean;
      readonly errors?: ReadonlyArray<string>;
      readonly warnings?: ReadonlyArray<string>;
    }>(ENDPOINTS.VALIDATE, request);
    return response.data;
  } catch (error) {
    // If validation endpoint doesn't exist, proceed with optimization
    console.warn(
      "Validation endpoint not available, skipping server-side validation",
    );
    return { valid: true };
  }
}

/**
 * Get optimization time/cost estimate
 */
export async function getOptimizationEstimate(
  request: OptimizationRequest,
): Promise<{
  readonly estimatedTime: number; // seconds
  readonly estimatedCost: number; // TRY
  readonly confidence: number; // 0-1
}> {
  try {
    const response = await api.post<{
      readonly estimatedTime: number;
      readonly estimatedCost: number;
      readonly confidence: number;
    }>(ENDPOINTS.ESTIMATE, request);
    return response.data;
  } catch (error) {
    // Fallback to basic estimation
    const itemCount = request.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const estimatedTime =
      request.params.algorithm === "genetic"
        ? Math.min(60, itemCount * 0.5)
        : Math.min(30, itemCount * 0.2);

    return {
      estimatedTime,
      estimatedCost: 0,
      confidence: 0.5,
    };
  }
}

/**
 * Get available algorithms with capabilities
 */
export async function getAvailableAlgorithms(): Promise<
  ReadonlyArray<AlgorithmInfo>
> {
  try {
    const response = await api.get<ReadonlyArray<AlgorithmInfo>>(
      ENDPOINTS.ALGORITHMS,
    );
    return response.data;
  } catch (error) {
    // Fallback to frontend-defined catalog
    console.warn("Algorithms endpoint not available, using frontend catalog");
    return Object.values(ALGORITHM_CATALOG);
  }
}

/**
 * Run optimization (enhanced with validation + DTO normalization)
 */
export async function runOptimization(
  request: OptimizationRequest,
): Promise<OptimizationResult> {
  // Client-side validation using Zod
  const validation = await validateOptimizationRequest(request);

  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors?.join(", ")}`);
  }

  // Calculate timeout based on performance settings
  const maxExecutionTime = request.params.performance?.maxExecutionTime ?? 60;
  const timeout = maxExecutionTime * 1000 + 10000; // +10s buffer for network

  const response = await api.post(ENDPOINTS.OPTIMIZE, request, {
    timeout,
    headers: {
      "X-Request-Timeout": maxExecutionTime.toString(),
    },
  });

  // ✅ Normalize backend response to frontend type
  const normalized = safeNormalizeOptimizationResult(response.data);

  if (!normalized) {
    throw new Error("Failed to normalize optimization result from backend");
  }

  return normalized;
}

/**
 * Get optimization result by ID
 * ✅ P3-11: Required for prefetching + DTO normalization
 */
export async function getOptimizationResult(
  id: string,
): Promise<OptimizationResult> {
  const response = await api.get(`/enterprise/results/${id}`);

  // ✅ Normalize backend response to frontend type
  const normalized = safeNormalizeOptimizationResult(response.data);

  if (!normalized) {
    throw new Error(
      `Failed to normalize optimization result ${id} from backend`,
    );
  }

  return normalized;
}

/**
 * Get optimization history
 */
export async function getOptimizationHistory(params?: {
  readonly page?: number;
  readonly pageSize?: number;
  readonly algorithm?: string;
}): Promise<ReadonlyArray<OptimizationHistoryEntry>> {
  const response = await api.get<ReadonlyArray<OptimizationHistoryEntry>>(
    ENDPOINTS.HISTORY,
    { params },
  );
  return response.data;
}

/**
 * Get optimization metrics
 */
export async function getOptimizationMetrics(): Promise<{
  readonly totalOptimizations: number;
  readonly averageEfficiency: number;
  readonly averageWaste: number;
  readonly averageCost: number;
  readonly totalSavings: number;
}> {
  const response = await api.get<{
    readonly totalOptimizations: number;
    readonly averageEfficiency: number;
    readonly averageWaste: number;
    readonly averageCost: number;
    readonly totalSavings: number;
  }>(ENDPOINTS.METRICS);
  return response.data;
}

/**
 * Health check for optimization service
 */
export async function checkOptimizationHealth(): Promise<{
  readonly status: "healthy" | "degraded" | "unhealthy";
  readonly details: Record<string, unknown>;
}> {
  const response = await api.get<{
    readonly status: "healthy" | "degraded" | "unhealthy";
    readonly details: Record<string, unknown>;
  }>(ENDPOINTS.HEALTH);
  return response.data;
}

/**
 * Export optimization result
 * NEW: P0-3 Feature
 */
export async function exportOptimizationResult(
  request: ExportOptimizationRequest,
): Promise<ExportOptimizationResponse> {
  const response = await api.post<ExportOptimizationResponse>(
    ENDPOINTS.EXPORT,
    request,
    {
      timeout: 30000, // 30 seconds for export
    },
  );
  return response.data;
}

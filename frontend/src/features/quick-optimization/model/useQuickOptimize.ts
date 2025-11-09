/**
 * Quick Optimize Hook
 *
 * @module features/quick-optimization
 * @version 1.0.0 - Quick Optimize Hook
 */

import { useState } from "react";

export interface OptimizationItem {
  readonly length: number;
  readonly quantity: number;
}

export interface QuickOptimizeParams {
  readonly algorithm: "ffd" | "bfd" | "genetic" | "pooling";
  readonly items: ReadonlyArray<OptimizationItem>;
}

export interface OptimizationResult {
  readonly id: string;
  readonly algorithm: string;
  readonly efficiency: number;
  readonly waste: number;
  readonly time: number;
}

export function useQuickOptimize() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimize = async (
    params: QuickOptimizeParams,
  ): Promise<OptimizationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Real API call to backend optimization service
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          algorithm: params.algorithm,
          items: params.items,
          stockLengths: [3000, 6000, 9000],
          constraints: {
            kerfWidth: 3.5,
            startSafety: 2,
            endSafety: 2,
            minScrapLength: 50,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setIsLoading(false);
      return {
        id: result.id || `opt-${Date.now()}`,
        algorithm: result.algorithm || params.algorithm,
        efficiency: result.efficiency || 0,
        waste: result.wastePercentage || 0,
        time: result.executionTimeMs || 0,
      };
    } catch (err) {
      setIsLoading(false);
      setError(
        err instanceof Error
          ? err.message
          : "Optimizasyon sırasında bir hata oluştu",
      );
      throw err;
    }
  };

  return {
    optimize,
    isLoading,
    error,
  };
}

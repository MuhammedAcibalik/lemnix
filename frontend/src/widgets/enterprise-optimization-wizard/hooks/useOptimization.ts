/**
 * @fileoverview Optimization logic hook
 * @module EnterpriseOptimizationWizard/Hooks/useOptimization
 * @version 1.0.0
 */

import { useCallback } from "react";
import { WizardState } from "../types";
import {
  buildOptimizationRequest,
  transformToOptimizationItems,
  debugLog,
  handleApiError,
} from "../utils";
import { API_ENDPOINTS } from "../constants";

export const useOptimization = () => {
  // Run single algorithm optimization
  const runOptimization = useCallback(
    async (state: WizardState): Promise<boolean> => {
      const { cuttingList, params } = state;

      try {
        // Transform cutting list to optimization items
        const items = transformToOptimizationItems(
          cuttingList as Array<{
            profileType: string;
            length: number;
            quantity: number;
            workOrderId: string;
            color: string;
            version: string;
            size: string;
            cuttingPattern: string;
          }>,
          params.unit,
        );

        // Build optimization request
        const request = buildOptimizationRequest(items, params);

        // Debug logging
        debugLog("Frontend: Selected algorithm", params.algorithm);
        debugLog("Frontend: Items count", items.length);
        debugLog(
          "Frontend: First 3 items",
          items
            .slice(0, 3)
            .map((i) => ({ length: i.length, quantity: i.quantity })),
        );

        // Call API
        const response = await fetch(API_ENDPOINTS.OPTIMIZE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        const result = await response.json();

        if (result.success) {
          debugLog("Backend response", result);
          debugLog("result.data", result.data);
          debugLog(
            "result.data.optimizationResult",
            result.data.optimizationResult,
          );
          return result.data.optimizationResult;
        } else {
          throw new Error(result.error || "Optimization failed");
        }
      } catch (error) {
        const errorMessage = handleApiError(
          error,
          "Error running optimization",
        );
        console.error("Error running optimization:", errorMessage);
        throw new Error(errorMessage);
      }
    },
    [],
  );

  // Compare multiple algorithms
  const compareAlgorithms = useCallback(
    async (state: WizardState): Promise<boolean> => {
      const { cuttingList, selectedAlgorithms } = state;

      try {
        const items = transformToOptimizationItems(
          cuttingList.map((item) => ({
            ...item,
            cuttingPattern: item.cuttingPattern || "Düz",
          })),
          state.params.unit,
        );

        const response = await fetch(API_ENDPOINTS.COMPARE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            algorithms: selectedAlgorithms,
          }),
        });

        const result = await response.json();

        if (result.success) {
          debugLog("Compare algorithms response", result);
          return result.data;
        } else {
          throw new Error(result.error || "Algorithm comparison failed");
        }
      } catch (error) {
        const errorMessage = handleApiError(
          error,
          "Error comparing algorithms",
        );
        console.error("Error comparing algorithms:", errorMessage);
        throw new Error(errorMessage);
      }
    },
    [],
  );

  return {
    runOptimization,
    compareAlgorithms,
  };
};

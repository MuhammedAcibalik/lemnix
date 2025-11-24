/**
 * @fileoverview Custom hook for managing visualization data processing
 * @module useVisualizationData
 * @version 1.0.0
 */

import { useMemo } from "react";
import { OptimizationResult } from "@/shared/types/legacy";
import { CuttingStock, OverallStatistics, PaginatedData } from "../types";
import {
  processOptimizationSegments,
  groupSegmentsByProfileAndLength,
  convertToCuttingStocks,
  calculateOverallStatistics,
  createPaginatedData,
  isValidOptimizationResult,
} from "../utils";

/**
 * Custom hook for processing optimization data into visualization format
 */
export const useVisualizationData = (
  optimizationResult: OptimizationResult,
  stockLength: number,
  stocksPerPage: number,
  currentPage: number,
) => {
  // Process the optimization result into cutting stocks
  const processedData = useMemo((): CuttingStock[] => {
    if (!isValidOptimizationResult(optimizationResult)) {
      return [];
    }

    try {
      // Step 1: Process segments from optimization result
      const segments = processOptimizationSegments(
        optimizationResult as unknown as {
          cuts?: Array<{ segments?: Array<Record<string, unknown>> }>;
        },
        stockLength,
      );

      // Step 2: Group segments by profile type and length
      const groupedSegments = groupSegmentsByProfileAndLength(segments);

      // Step 3: Convert to cutting stocks
      const cuttingStocks = convertToCuttingStocks(
        groupedSegments,
        stockLength,
      );

      return cuttingStocks;
    } catch (error) {
      console.error("Error processing optimization data:", error);
      return [];
    }
  }, [optimizationResult, stockLength]);

  // Calculate overall statistics
  const overallStatistics = useMemo((): OverallStatistics => {
    if (processedData.length === 0) {
      return {
        totalStocks: 0,
        totalWaste: 0,
        averageEfficiency: 0,
        overallEfficiency: 0,
        totalPieces: 0,
        totalUsedLength: 0,
        totalStockLength: 0,
        wastePercentage: 0,
        materialCost: 0,
        wasteCost: 0,
        usedCost: 0,
        costEfficiency: 0,
      };
    }

    return calculateOverallStatistics(processedData, stockLength);
  }, [processedData, stockLength]);

  // Create paginated data
  const paginatedData = useMemo((): PaginatedData => {
    return createPaginatedData(processedData, stocksPerPage, currentPage);
  }, [processedData, stocksPerPage, currentPage]);

  // Data validation
  const hasData = processedData.length > 0;
  const hasValidResult = isValidOptimizationResult(optimizationResult);
  const totalPages = paginatedData.totalPages;

  return {
    // Processed data
    processedData,
    overallStatistics,
    paginatedData,

    // Validation flags
    hasData,
    hasValidResult,
    totalPages,

    // Data counts
    totalStocks: processedData.length,
    showingCount: paginatedData.showingCount,
    currentPageData: paginatedData.data,
  };
};

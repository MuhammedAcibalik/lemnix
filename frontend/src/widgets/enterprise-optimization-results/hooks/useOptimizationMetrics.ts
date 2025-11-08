/**
 * @fileoverview Custom hook for optimization metrics calculation
 * @module useOptimizationMetrics
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { OptimizationResult } from '../types';

export const useOptimizationMetrics = (result: OptimizationResult | null) => {
  // Performance metrics calculation
  const performanceMetrics = useMemo(() => {
    if (!result) return null;

    const efficiency = result.efficiency || 0;
    const wastePercentage = result.wastePercentage || 0;
    const utilizationRate = 100 - wastePercentage;
    const costPerUnit = result.totalCost / (result.cuts?.length || 1);
    const savingsPercentage = (
      (1 - result.totalCost / (result.totalCost * 1.3)) *
      100
    ).toFixed(1);

    return {
      efficiency,
      wastePercentage,
      utilizationRate,
      costPerUnit,
      savingsPercentage,
      qualityScore: result.confidence || 95,
      performanceScore: ((efficiency + utilizationRate) / 2).toFixed(1),
    };
  }, [result]);

  // Waste analysis
  const wasteAnalysis = useMemo(() => {
    if (!result?.cuts) return null;

    const categories = {
      minimal: 0,
      small: 0,
      medium: 0,
      large: 0,
      excessive: 0,
      reclaimable: 0,
    };

    result.cuts.forEach((cut) => {
      const waste = cut.remainingLength || 0;
      if (waste < 50) categories.minimal++;
      else if (waste < 100) categories.small++;
      else if (waste < 200) categories.medium++;
      else if (waste < 500) categories.large++;
      else categories.excessive++;

      if (cut.isReclaimable) categories.reclaimable++;
    });

    return categories;
  }, [result]);

  return {
    performanceMetrics,
    wasteAnalysis
  };
};

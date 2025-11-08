/**
 * @fileoverview Custom hook for managing profile optimization state
 * @module useProfileOptimizationState
 * @version 1.0.0
 */

import { useState, useMemo, useCallback } from 'react';
import {
  ProfileOptimizationState,
  ProfileOptimizationHandlers,
  ProfileOptimizationResultsProps,
  CalculatedPerformanceMetrics,
  SeverityThresholds
} from '../types';

/**
 * Custom hook for managing profile optimization state
 */
export const useProfileOptimizationState = ({
  result,
  onNewOptimization,
  onExport
}: ProfileOptimizationResultsProps) => {
  // State
  const [tabValue, setTabValue] = useState(0);
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null);
  const [cuttingPlanModal, setCuttingPlanModal] = useState<{
    open: boolean;
    stock: Record<string, unknown> | null;
  }>({ open: false, stock: null });

  // Handlers
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const handleProfileClick = useCallback((profileType: string) => {
    setExpandedProfile(expandedProfile === profileType ? null : profileType);
  }, [expandedProfile]);

  const handleCuttingPlanDetails = useCallback((stock: Record<string, unknown>) => {
    setCuttingPlanModal({ open: true, stock });
  }, []);

  const handleCuttingPlanModalClose = useCallback(() => {
    setCuttingPlanModal({ open: false, stock: null });
  }, []);

  // Performance metrics calculation
  const performanceMetrics = useMemo((): CalculatedPerformanceMetrics | null => {
    if (!result) return null;

    const efficiency = result.optimizationResult.efficiency || 0;
    const wastePercentage = result.optimizationResult.wastePercentage || 0;
    const utilizationRate = 100 - wastePercentage;
    const costPerUnit = result.optimizationResult.totalCost / (result.optimizationResult.cuts?.length || 1);
    const savingsPercentage = (
      (1 - result.optimizationResult.totalCost / (result.optimizationResult.totalCost * 1.3)) *
      100
    ).toFixed(1);

    return {
      efficiency,
      wastePercentage,
      utilizationRate,
      costPerUnit,
      savingsPercentage,
      qualityScore: result.confidence || 95,
      performanceScore: ((efficiency + utilizationRate) / 2).toFixed(1)
    };
  }, [result]);

  // Utility functions
  const getSeverityColor = useCallback((
    value: number,
    thresholds: SeverityThresholds
  ): "success" | "warning" | "error" => {
    if (value >= thresholds.good) return "success";
    if (value >= thresholds.warning) return "warning";
    return "error";
  }, []);

  const getRecommendationIcon = useCallback((severity: string) => {
    switch (severity) {
      case "critical":
      case "error":
        return "error";
      case "warning":
        return "warning";
      default:
        return "info";
    }
  }, []);

  // State object
  const state: ProfileOptimizationState = {
    tabValue,
    expandedProfile,
    cuttingPlanModal
  };

  // Handlers object
  const handlers: ProfileOptimizationHandlers = {
    onTabChange: handleTabChange,
    onProfileClick: handleProfileClick,
    onCuttingPlanDetails: handleCuttingPlanDetails,
    onCuttingPlanModalClose: handleCuttingPlanModalClose,
    onNewOptimization,
    onExport
  };

  return {
    // State
    ...state,
    
    // Setters
    setTabValue,
    setExpandedProfile,
    setCuttingPlanModal,
    
    // Handlers
    ...handlers,
    
    // Calculated values
    performanceMetrics,
    
    // Utility functions
    getSeverityColor,
    getRecommendationIcon
  };
};

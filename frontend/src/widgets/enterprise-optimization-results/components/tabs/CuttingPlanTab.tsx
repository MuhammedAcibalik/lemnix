/**
 * @fileoverview Cutting Plan Tab Component
 * @module CuttingPlanTab
 * @version 1.0.0
 */

import React from "react";
import { Box, Alert, AlertTitle } from "@mui/material";
import { StockSummarySection } from "./StockSummarySection";
import { CuttingPlanTable } from "./CuttingPlanTable";
import {
  OptimizationResult,
  WorkOrder,
  Pool,
  Cut,
  GroupData,
} from "../../types";

interface StockSummaryItem {
  length: number;
  count: number;
  used: number;
  waste: number;
}

interface CuttingPlanTabProps {
  result: OptimizationResult;
  hasResults: boolean;
  isPoolingOptimization: boolean;
  aggregatedWorkOrders: WorkOrder[];
  aggregatedPools: Pool[];
  expandedWorkOrder: string | null;
  onWorkOrderClick: (workOrderId: string) => void;
  onCuttingPlanDetails: (stock: StockSummaryItem) => void;
  textExplanationOpen: { [key: string]: boolean };
  handleTextExplanation: (
    cardId: string,
    group: { cuts: Cut[] },
    groupData: GroupData,
  ) => void;
  explanationData: { [key: string]: string };
  getAlgorithmProfile: (algorithm?: string) => {
    icon: React.ReactNode;
    label: string;
  };
  getProfileTypeIcon: (profileType: string) => React.ReactNode;
}

export const CuttingPlanTab: React.FC<CuttingPlanTabProps> = ({
  result,
  hasResults,
  isPoolingOptimization,
  aggregatedWorkOrders,
  aggregatedPools,
  expandedWorkOrder,
  onWorkOrderClick,
  onCuttingPlanDetails,
  textExplanationOpen,
  handleTextExplanation,
  explanationData,
  getAlgorithmProfile,
  getProfileTypeIcon,
}) => {
  if (!hasResults) {
    return (
      <Alert severity="info">
        <AlertTitle>Veri Bulunamadı</AlertTitle>
        Optimizasyon sonuçları henüz mevcut değil. Lütfen önce bir optimizasyon
        çalıştırın.
      </Alert>
    );
  }

  return (
    <Box>
      <StockSummarySection
        result={result}
        onCuttingPlanDetails={onCuttingPlanDetails}
      />
      <CuttingPlanTable
        aggregatedWorkOrders={aggregatedWorkOrders}
        expandedWorkOrder={expandedWorkOrder}
        onWorkOrderClick={onWorkOrderClick}
        onCuttingPlanDetails={onCuttingPlanDetails}
        getAlgorithmProfile={getAlgorithmProfile}
        result={result}
      />
    </Box>
  );
};

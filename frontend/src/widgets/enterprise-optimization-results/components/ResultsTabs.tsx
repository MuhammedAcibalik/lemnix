/**
 * @fileoverview Results Tabs Component
 * @module ResultsTabs
 * @version 1.0.0
 */

import React from "react";
import { OptimizationResult, WorkOrder, Pool, Cut, GroupData } from "../types";
import { Card, CardContent, Tabs, Tab, Box, Button } from "@mui/material";
import {
  AccountTree as TreeIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  Settings as SettingsIcon,
  Insights as InsightsIcon,
  Refresh as RefreshIcon,
  Share as ShareIcon,
} from "@mui/icons-material";

// Import tab content components (these will be created separately)
import { CuttingPlanTab } from "./tabs/CuttingPlanTab";
import { CostAnalysisTab } from "./tabs/CostAnalysisTab";
import { WasteAnalysisTab } from "./tabs/WasteAnalysisTab";
import { PerformanceTab } from "./tabs/PerformanceTab";
import { AlgorithmTab } from "./tabs/AlgorithmTab";
import { RecommendationsTab } from "./tabs/RecommendationsTab";

interface ResultsTabsProps {
  tabValue: number;
  onTabChange: (value: number) => void;
  result: OptimizationResult;
  hasResults: boolean;
  isPoolingOptimization: boolean;
  aggregatedWorkOrders: WorkOrder[];
  aggregatedPools: Pool[];
  expandedWorkOrder: string | null;
  onWorkOrderClick: (workOrderId: string) => void;
  onCuttingPlanDetails: (stock: Cut) => void;
  textExplanationOpen: { [key: string]: boolean };
  handleTextExplanation: (
    cardId: string,
    group: { cuts: Cut[] },
    groupData: GroupData,
  ) => void;
  explanationData: { [key: string]: string };
  analytics: Record<string, unknown>;
  systemHealth: Record<string, unknown>;
  isLoadingAnalytics: boolean;
  isLoadingSystemHealth: boolean;
  useProfileOptimization: boolean;
  onProfileOptimizationToggle: (value: boolean) => void;
  profileOptimizationResult: Record<string, unknown>;
  fetchProfileOptimization: () => void;
  onNewOptimization?: () => void;
  getAlgorithmProfile: (algorithm?: string) => {
    icon: React.ReactNode;
    label: string;
  };
  getProfileTypeIcon: (profileType: string) => React.ReactNode;
  getRecommendationIcon: (severity: string) => React.ReactNode;
}

export const ResultsTabs: React.FC<ResultsTabsProps> = ({
  tabValue,
  onTabChange,
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
  analytics,
  systemHealth,
  isLoadingAnalytics,
  isLoadingSystemHealth,
  useProfileOptimization,
  onProfileOptimizationToggle,
  profileOptimizationResult,
  fetchProfileOptimization,
  onNewOptimization,
  getAlgorithmProfile,
  getProfileTypeIcon,
  getRecommendationIcon,
}) => {
  const renderTabContent = () => {
    switch (tabValue) {
      case 0:
        return (
          <CuttingPlanTab
            result={result}
            hasResults={hasResults}
            isPoolingOptimization={isPoolingOptimization}
            aggregatedWorkOrders={aggregatedWorkOrders}
            aggregatedPools={aggregatedPools}
            expandedWorkOrder={expandedWorkOrder}
            onWorkOrderClick={onWorkOrderClick}
            onCuttingPlanDetails={(stock) =>
              onCuttingPlanDetails(stock as unknown as Cut)
            }
            textExplanationOpen={textExplanationOpen}
            handleTextExplanation={handleTextExplanation}
            explanationData={explanationData}
            getAlgorithmProfile={getAlgorithmProfile}
            getProfileTypeIcon={getProfileTypeIcon}
          />
        );
      case 1:
        return <CostAnalysisTab result={result} />;
      case 2:
        return <WasteAnalysisTab result={result} />;
      case 3:
        return (
          <PerformanceTab
            result={result}
            analytics={analytics}
            systemHealth={systemHealth}
            isLoadingAnalytics={isLoadingAnalytics}
            isLoadingSystemHealth={isLoadingSystemHealth}
          />
        );
      case 4:
        return (
          <AlgorithmTab
            result={result}
            useProfileOptimization={useProfileOptimization}
            onProfileOptimizationToggle={onProfileOptimizationToggle}
            profileOptimizationResult={profileOptimizationResult}
          />
        );
      case 5:
        return <RecommendationsTab result={result} />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Tabs
          value={tabValue}
          onChange={(e, v) => {
            console.log("🔥 Tab changed to:", v);
            onTabChange(v);
          }}
        >
          <Tab icon={<TreeIcon />} label="Kesim Planı" />
          <Tab icon={<PieChartIcon />} label="Maliyet Analizi" />
          <Tab icon={<BarChartIcon />} label="Atık Analizi" />
          <Tab icon={<ShowChartIcon />} label="Performans" />
          <Tab icon={<SettingsIcon />} label="🔥 Algoritma ve Parametreler" />
          <Tab icon={<InsightsIcon />} label="Öneriler" />
        </Tabs>

        <Box sx={{ pt: 3 }}>{renderTabContent()}</Box>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={onNewOptimization}
            startIcon={<RefreshIcon />}
          >
            Yeni Optimizasyon
          </Button>
          <Button variant="outlined" size="large" startIcon={<ShareIcon />}>
            Paylaş
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

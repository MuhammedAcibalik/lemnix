/**
 * @fileoverview Profile Optimization Results - Main Component
 * @module ProfileOptimizationResults
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Stack,
} from "@mui/material";
import {
  Share as ShareIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

// Import modular components
import { TabPanel } from "./components/TabPanel";
import { HeaderSection } from "./components/HeaderSection";
import { KPICards } from "./components/KPICards";
import { ProfileGroupsTab } from "./components/ProfileGroupsTab";
import { CuttingPlanTab } from "./components/CuttingPlanTab";
import { CostAnalysisTab } from "./components/CostAnalysisTab";
import { WasteAnalysisTab } from "./components/WasteAnalysisTab";
import { PerformanceTab } from "./components/PerformanceTab";
import { RecommendationsTab } from "./components/RecommendationsTab";

// Import hooks
import { useProfileOptimizationState } from "./hooks/useProfileOptimizationState";

// Import types
import { ProfileOptimizationResultsProps } from "./types";

// Import constants
import { tabConfig, messages } from "./constants";

// Import CuttingPlanModal from enterprise-optimization-results
import { CuttingPlanModal } from "../enterprise-optimization-results/components/CuttingPlanModal";

/**
 * Profile Optimization Results Component
 *
 * Enterprise-grade profile optimization results with modular architecture
 */
export const ProfileOptimizationResults: React.FC<
  ProfileOptimizationResultsProps
> = ({ result, onNewOptimization, onExport }) => {
  // Custom hooks for state and functionality
  const {
    tabValue,
    expandedProfile,
    cuttingPlanModal,
    onTabChange,
    onProfileClick,
    onCuttingPlanDetails,
    onCuttingPlanModalClose,
    performanceMetrics,
    getSeverityColor,
    getRecommendationIcon,
  } = useProfileOptimizationState({
    result,
    ...(onNewOptimization !== undefined ? { onNewOptimization } : {}),
    ...(onExport !== undefined ? { onExport } : {}),
  });

  if (!result) return null;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header Section */}
      <HeaderSection
        result={result}
        performanceMetrics={performanceMetrics}
        {...(onExport ? { onExport } : {})}
      />

      {/* KPI Cards */}
      <KPICards result={result} performanceMetrics={performanceMetrics} />

      {/* Detailed Analysis Tabs */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={onTabChange}>
            {tabConfig.tabs.map((tab) => (
              <Tab key={tab.index} icon={tab.icon} label={tab.label} />
            ))}
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <ProfileGroupsTab
              result={result}
              expandedProfile={expandedProfile}
              onProfileClick={onProfileClick}
              onCuttingPlanDetails={onCuttingPlanDetails}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <CuttingPlanTab />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <CostAnalysisTab
              result={result}
              performanceMetrics={performanceMetrics}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <WasteAnalysisTab result={result} />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <PerformanceTab result={result} />
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <RecommendationsTab recommendations={result.recommendations} />
          </TabPanel>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}>
        <Button
          variant="contained"
          size="large"
          onClick={onNewOptimization}
          startIcon={<RefreshIcon />}
        >
          {messages.actions.newOptimization}
        </Button>
        <Button variant="outlined" size="large" startIcon={<ShareIcon />}>
          {messages.actions.share}
        </Button>
      </Box>

      {/* Cutting Plan Details Modal */}
      <CuttingPlanModal
        open={cuttingPlanModal.open}
        stock={cuttingPlanModal.stock}
        onClose={onCuttingPlanModalClose}
      />
    </Box>
  );
};

export default ProfileOptimizationResults;

/**
 * @fileoverview Main Enterprise Optimization Results Component
 * @module EnterpriseOptimizationResults
 * @version 1.0.0
 *
 * Enterprise-grade sonuç görselleştirme ve analiz komponenti
 */

import React, { useState, useMemo, useEffect } from "react";
import { Box, Stack, Paper } from "@mui/material";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";

// Import sub-components
import { ResultsHeader } from "./components/ResultsHeader";
import { ResultsKPIs } from "./components/ResultsKPIs";
import { ResultsTabs } from "./components/ResultsTabs";
import { CuttingPlanModal } from "./components/CuttingPlanModal";
import { KesimDetaylariDialog } from "./components/KesimDetaylariDialog";
import { TextExplanationModal } from "./components/TextExplanationModal";
import { ProfileInfoAlert } from "./components/ProfileInfoAlert";
import { GAMetricsCard } from "./components/GAMetricsCard";

// Import P0 features
import { ExportButton } from "@/features/export-results";

// Import hooks and utilities
import { useOptimizationData } from "./hooks/useOptimizationData";
import { useOptimizationMetrics } from "./hooks/useOptimizationMetrics";
import { useOptimizationAnalytics } from "./hooks/useOptimizationAnalytics";
import { useOptimizationState } from "./hooks/useOptimizationState";

// Import types
import { OptimizationResultsProps, Cut } from "./types";

export const EnterpriseOptimizationResults: React.FC<
  OptimizationResultsProps
> = ({ result, cuttingList = [], onNewOptimization, onExport }) => {
  // Custom hooks for data management
  const {
    processedCuttingList,
    checkDuplicateProfileTypes,
    aggregatedWorkOrders,
    aggregatedPools,
    isPoolingOptimization,
    hasResults,
    getWorkOrderCuttingDetails,
    getProfileTypeIcon,
    getAlgorithmProfile,
    getSeverityColor,
    getRecommendationIcon,
    generateCuttingPatternExplanation,
    fmtMm,
    formatPlanLabelFromSegments,
  } = useOptimizationData(result);

  const { performanceMetrics, wasteAnalysis } = useOptimizationMetrics(result);

  const { analytics, systemHealth, isLoadingAnalytics, isLoadingSystemHealth } =
    useOptimizationAnalytics();

  const {
    // State management
    tabValue,
    setTabValue,
    expandedWorkOrder,
    setExpandedWorkOrder,
    cuttingPlanModal,
    setCuttingPlanModal,
    kesimDetaylariModal,
    setKesimDetaylariModal,
    useProfileOptimization,
    setUseProfileOptimization,
    profileOptimizationResult,
    setProfileOptimizationResult,
    showProfileInfo,
    setShowProfileInfo,
    textExplanationOpen,
    setTextExplanationOpen,
    explanationData,
    setExplanationData,
    exportOptions,
    setExportOptions,
    isExporting,
    setIsExporting,

    // Actions
    handleWorkOrderClick,
    handleCuttingPlanDetails,
    handleTextExplanation,
    handleExport,
    fetchProfileOptimization,
  } = useOptimizationState(result, onExport);

  // ✅ FIX: Remove debug log causing console spam
  // console.log('🔍 EnterpriseOptimizationResults render - Modal state:', cuttingPlanModal);

  return (
    <ErrorBoundary>
      <Box sx={{ width: "100%" }}>
        {/* Profile Info Alert */}
        <ProfileInfoAlert
          show={showProfileInfo}
          duplicates={checkDuplicateProfileTypes.hasDuplicates}
          onClose={() => setShowProfileInfo(false)}
        />

        {/* No Results State */}
        {!result && (
          <ResultsHeader
            variant="no-results"
            result={undefined}
            onExport={handleExport}
            isExporting={isExporting}
          />
        )}

        {result && (
          <>
            {/* Results Header */}
            <ResultsHeader
              variant="with-results"
              result={result}
              performanceMetrics={performanceMetrics ?? undefined}
              onExport={handleExport}
              isExporting={isExporting}
            />

            {/* KPI Cards */}
            <ResultsKPIs
              result={result}
              performanceMetrics={performanceMetrics || {}}
              wasteAnalysis={wasteAnalysis || {}}
            />

            {/* Action Buttons - P0 Features */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                mt: 2,
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              <Stack direction="row" spacing={2} justifyContent="center">
                {/* P0-3: Export Button */}
                <ExportButton resultId={result?.id || "current"} />
              </Stack>
            </Paper>

            {/* GA Metrics Card (if genetic algorithm) */}
            <Box sx={{ mt: 2 }}>
              <GAMetricsCard
                algorithm={result.algorithm ?? undefined}
                executionTimeMs={result.executionTimeMs ?? 0}
                performanceMetrics={result.performanceMetrics ?? undefined}
              />
            </Box>

            {/* Main Results Tabs */}
            <ResultsTabs
              tabValue={tabValue}
              onTabChange={setTabValue}
              result={result}
              hasResults={hasResults}
              isPoolingOptimization={isPoolingOptimization}
              aggregatedWorkOrders={aggregatedWorkOrders}
              aggregatedPools={aggregatedPools}
              expandedWorkOrder={expandedWorkOrder}
              onWorkOrderClick={handleWorkOrderClick}
              onCuttingPlanDetails={(stock) => handleCuttingPlanDetails(stock)}
              textExplanationOpen={textExplanationOpen}
              handleTextExplanation={handleTextExplanation}
              explanationData={explanationData}
              analytics={analytics || {}}
              systemHealth={systemHealth || {}}
              isLoadingAnalytics={isLoadingAnalytics}
              isLoadingSystemHealth={isLoadingSystemHealth}
              useProfileOptimization={useProfileOptimization}
              onProfileOptimizationToggle={setUseProfileOptimization}
              profileOptimizationResult={profileOptimizationResult || {}}
              fetchProfileOptimization={() => {
                /* Placeholder for actual fetch */
              }}
              onNewOptimization={onNewOptimization}
              getAlgorithmProfile={getAlgorithmProfile}
              getProfileTypeIcon={getProfileTypeIcon}
              getRecommendationIcon={getRecommendationIcon}
            />
          </>
        )}

        {/* Cutting Plan Details Modal */}
        {cuttingPlanModal.stock && (
          <CuttingPlanModal
            open={cuttingPlanModal.open}
            stock={{
              ...cuttingPlanModal.stock,
              segmentCount: cuttingPlanModal.stock.segmentCount || 0,
            }}
            onClose={() => {
              console.log("🔍 Modal onClose called");
              setCuttingPlanModal({ open: false, stock: null });
            }}
          />
        )}

        {/* Kesim Detayları Dialog */}
        {kesimDetaylariModal.workOrder && (
          <KesimDetaylariDialog
            open={kesimDetaylariModal.open}
            workOrder={kesimDetaylariModal.workOrder}
            onClose={() => {
              console.log("🔍 KesimDetaylariDialog onClose called");
              setKesimDetaylariModal({ open: false, workOrder: null });
            }}
          />
        )}

        {/* Text Explanation Modals */}
        <TextExplanationModal
          explanationData={explanationData}
          textExplanationOpen={textExplanationOpen}
          onClose={(cardId: string) =>
            setTextExplanationOpen((prev: Record<string, boolean>) => ({
              ...prev,
              [cardId]: false,
            }))
          }
        />
      </Box>
    </ErrorBoundary>
  );
};

export default EnterpriseOptimizationResults;

/**
 * Results Step Component v3.0 - Comprehensive Results Display
 * Complete optimization results with 3D visualization and detailed analytics
 *
 * @module enterprise-optimization-wizard/components
 * @version 3.0.0 - Enterprise Results Redesign
 */

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Chip,
  ListItemIcon,
  ListItemText,
  Stack,
  alpha,
} from "@mui/material";
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Code as JsonIcon,
  Article as InstructionsIcon,
  Label as LabelIcon,
  Schedule as ScheduleIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  Visibility as VisibilityIcon,
  Inventory as InventoryIcon,
  PieChart as PieChartIcon,
  Speed as SpeedIcon,
  Lightbulb as LightbulbIcon,
  Recycling as RecyclingIcon,
  Analytics as AnalyticsIcon,
  HighQuality as HighQualityIcon,
  ArrowBack as ArrowBackIcon,
  Straighten as RulerIcon,
} from "@mui/icons-material";
import { useDesignSystem, useAdaptiveUIContext } from "@/shared/hooks";
import { CardV2 } from "@/shared/ui/Card/Card.v2";
import type {
  ResultsStepProps,
  OptimizationResult as WizardOptimizationResult,
  Cut,
} from "../types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface BackendCut {
  readonly id: string;
  readonly stockLength: number;
  readonly usedLength: number;
  readonly remainingLength: number;
  readonly segments: readonly BackendSegment[];
}

interface BackendSegment {
  readonly id: string;
  readonly workOrderId: string;
  readonly profileType: string;
  readonly length: number;
  readonly quantity: number;
}

// Import new results components
import {
  StockVisualization2D,
  StockBreakdownList,
  WasteDistributionChart,
  CostBreakdownChart,
  AlgorithmPerformanceCard,
  SmartRecommendations,
  CuttingPlanTable,
  WasteAnalysisTab,
  CostAnalysisTab,
  QualityMetricsTab,
  MetricCard,
  ProfileBadge, // ✅ Import ProfileBadge
  transformCutsToStockBreakdown,
  calculateStockMetrics,
  buildCostBreakdown,
  groupCutsByStockLength,
  StockLengthCard,
  CuttingPlanDataGrid,
  type BackendCut as ResultsBackendCut,
} from "./results";
import { StockLengthAccordion } from "./results/StockLengthAccordion";
import type { StockBreakdownData } from "./results/utils";

/**
 * Results Step v3
 * Comprehensive results display with all optimization data
 */
export const ResultsStep: React.FC<ResultsStepProps> = ({
  result,
  onNewOptimization,
  onExport,
  loading,
}) => {
  const ds = useDesignSystem();
  const { device, tokens } = useAdaptiveUIContext();
  const [globalUnit, setGlobalUnit] = useState<"mm" | "cm" | "m">("mm");

  // Unit converter helper
  const convertLength = (
    value: number,
    fromUnit: "mm" | "cm" | "m",
    toUnit: "mm" | "cm" | "m",
  ): number => {
    const conversions: Record<string, number> = {
      mm: 1,
      cm: 10,
      m: 1000,
    };

    const fromFactor = conversions[fromUnit] || 1;
    const toFactor = conversions[toUnit] || 1;

    return (value * fromFactor) / toFactor;
  };

  // Debug: Log result when it changes
  React.useEffect(() => {
    if (result) {
      console.log("[ResultsStep] 🔍 Result received:", {
        algorithm: result.algorithm,
        type: typeof result.algorithm,
        hasMetadata: !!(result as { metadata?: unknown }).metadata,
        metadata: (result as { metadata?: unknown }).metadata,
        fullResult: result,
      });
    }
  }, [result]);

  // UI State
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [resultsTab, setResultsTab] = useState(0); // 0: Kesim Planı, 1: Analiz Dashboard
  const [selectedStock, setSelectedStock] = useState<number | undefined>(
    undefined,
  );
  const [currentPage, setCurrentPage] = useState<
    | "overview"
    | "cutting-plan"
    | "stock-details"
    | "cost-distribution"
    | "algorithm-performance"
    | "smart-recommendations"
    | "waste-analysis"
    | "cost-analysis"
    | "quality-metrics"
  >("overview");

  // Transform data
  const stockBreakdown = useMemo(() => {
    if (!result?.cuts) return [];
    return transformCutsToStockBreakdown(
      result.cuts as unknown as ReadonlyArray<ResultsBackendCut>,
    );
  }, [result?.cuts]);

  const stockMetrics = useMemo(() => {
    if (!result?.cuts) return null;
    return calculateStockMetrics(
      result.cuts as unknown as ReadonlyArray<ResultsBackendCut>,
    );
  }, [result?.cuts]);

  const costBreakdown = useMemo(() => {
    if (!result) return null;
    return buildCostBreakdown(result);
  }, [result]);

  // Stock length groups for cutting plan
  const stockLengthGroups = useMemo(() => {
    if (!result?.cuts) {
      return [];
    }

    console.log("[ResultsStep] 🔍 Grouping cuts:", {
      totalCuts: result.cuts.length,
      sampleCut: result.cuts[0],
    });

    console.log("[ResultsStep] 🔍 Cuts before grouping:", {
      cutsCount: result.cuts.length,
      firstCut: result.cuts[0],
      firstCutSegments: result.cuts[0]?.segments,
      stockLengths: Array.from(
        new Set(result.cuts.map((c: BackendCut) => c.stockLength)),
      ),
      workOrdersInCuts: Array.from(
        new Set(
          result.cuts.flatMap((c: BackendCut) =>
            c.segments
              ?.map((s: BackendSegment) => s.workOrderId)
              .filter(Boolean),
          ),
        ),
      ),
    });

    const groups = groupCutsByStockLength(
      result.cuts as unknown as ReadonlyArray<ResultsBackendCut>,
      result?.algorithm || "Unknown Algorithm",
    ); // ✅ Sadece 2 parametre

    console.log("[ResultsStep] 🎯 Stock length groups:", {
      groupsCount: groups.length,
      groups: groups.map((g) => ({
        stockLength: g.stockLength,
        plansCount: g.plans.length,
        samplePlan: g.plans[0],
      })),
    });

    return groups;
  }, [result?.cuts, result?.algorithm]);

  // Profile information for ProfileBadge
  const metadata = result
    ? (
        result as {
          metadata?: {
            profile?: {
              profileId: string;
              profileCode: string;
              profileName: string;
              source: "mapping" | "fallback";
              stockLengths: number[];
            };
          };
        }
      ).metadata
    : undefined;
  const profileInfo = metadata?.profile;

  // Export menu handlers
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  // Navigation handlers
  const handlePageNavigation = (page: typeof currentPage) => {
    setCurrentPage(page);
  };

  const handleBackToOverview = () => {
    setCurrentPage("overview");
  };

  const handleExport = (format: string) => {
    onExport(format as "pdf" | "excel" | "json");
    handleExportMenuClose();
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          p: 0,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 500,
          width: "100%",
          maxWidth: "none",
          mx: 0,
        }}
      >
        <CircularProgress
          size={tokens.components.icon.xl}
          sx={{ mb: tokens.spacing.md, color: ds.colors.primary.main }}
        />
        <Typography
          sx={{
            fontSize: `${tokens.typography.lg}px`,
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
            mb: tokens.spacing.xs,
          }}
        >
          Optimizasyon Çalışıyor...
        </Typography>
        <Typography
          sx={{
            fontSize: `${tokens.typography.sm}px`,
            color: ds.colors.text.secondary,
          }}
        >
          Lütfen bekleyin, bu işlem birkaç dakika sürebilir
        </Typography>
      </Box>
    );
  }

  // Error state
  if (result && !result.success) {
    return (
      <Box
        sx={{
          p: tokens.components.card.padding,
          textAlign: "center",
          minHeight: 500,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "none",
          mx: 0,
        }}
      >
        <ErrorIcon
          sx={{
            fontSize: tokens.components.icon.xl,
            color: ds.colors.error.main,
            mb: tokens.spacing.md,
          }}
        />
        <Typography
          sx={{
            fontSize: `${tokens.typography.lg}px`,
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
            mb: tokens.spacing.sm,
          }}
        >
          Optimizasyon Başarısız Oldu
        </Typography>
        <Alert
          severity="error"
          sx={{
            borderRadius: `${tokens.borderRadius.lg}px`,
            maxWidth: 600,
            mb: tokens.spacing.md,
          }}
        >
          {result.message || "Bilinmeyen bir hata oluştu"}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onNewOptimization}
          sx={{
            minHeight: device.isTouch
              ? tokens.components.minTouchTarget
              : tokens.components.button.md,
          }}
        >
          Yeniden Dene
        </Button>
      </Box>
    );
  }

  // No result yet
  if (!result) {
    return (
      <Box
        sx={{
          p: 0,
          textAlign: "center",
          minHeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "none",
          mx: 0,
        }}
      >
        <Alert
          severity="info"
          sx={{ borderRadius: `${tokens.borderRadius.lg}px`, maxWidth: 500 }}
        >
          Optimizasyon sonucu bekleniyor. Lütfen önce optimizasyonu başlatın.
        </Alert>
      </Box>
    );
  }

  // Success state - Tab-based Results
  if (currentPage !== "overview") {
    // Render specific page components
    return (
      <Box
        sx={{
          px: {
            xs: tokens.spacing.md,
            sm: tokens.spacing.lg,
            md: tokens.spacing.xl,
            lg: tokens.spacing.xl * 1.5,
          },
          py: {
            xs: tokens.spacing.sm,
            md: tokens.spacing.md,
          },
          width: "100%",
          maxWidth: "none",
          mx: 0,
        }}
      >
        {/* Page Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: tokens.spacing.sm,
            mb: tokens.spacing.md,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToOverview}
            sx={{
              textTransform: "none",
              minHeight: device.isTouch
                ? tokens.components.minTouchTarget
                : tokens.components.button.md,
            }}
          >
            ← Geri
          </Button>
          <Typography
            sx={{ fontSize: `${tokens.typography.xl}px`, fontWeight: 600 }}
          >
            {currentPage === "cutting-plan" && "Kesim Planı Görselleştirme"}
            {currentPage === "stock-details" && "Stok Detayları"}
            {currentPage === "cost-distribution" && "Maliyet Dağılımı"}
            {currentPage === "algorithm-performance" && "Algoritma Performansı"}
            {currentPage === "smart-recommendations" && "Akıllı Öneriler"}
            {currentPage === "waste-analysis" && "Fire Analizi"}
            {currentPage === "cost-analysis" && "Maliyet Analizi"}
            {currentPage === "quality-metrics" && "Kalite Metrikleri"}
          </Typography>
        </Box>

        {/* Page Content */}
        {currentPage === "cutting-plan" && (
          <Box sx={{ width: "100%" }}>
            {/* Stok Boyu Kartları */}
            {stockLengthGroups.map((group) => (
              <Box key={group.stockLength}>
                <StockLengthCard group={group} />

                {/* Her stok boyu için tablo */}
                <Box sx={{ mb: tokens.spacing.md }}>
                  <CuttingPlanDataGrid plans={group.plans} />
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {currentPage === "stock-details" && (
          <Grid container spacing={tokens.layout.gridGap}>
            {/* Stock Metrics Grid */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Toplam Stok"
                value={stockBreakdown.length}
                color="primary"
                icon={
                  <InventoryIcon sx={{ fontSize: tokens.components.icon.sm }} />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Ortalama Kullanım"
                value={
                  stockBreakdown.length > 0
                    ? (
                        stockBreakdown.reduce(
                          (sum: number, s: StockBreakdownData) =>
                            sum + s.usedPercentage,
                          0,
                        ) / stockBreakdown.length
                      ).toFixed(1)
                    : 0
                }
                unit="%"
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="En Verimli Stok"
                value={
                  stockBreakdown.length > 0
                    ? Math.max(
                        ...stockBreakdown.map(
                          (s: StockBreakdownData) => s.usedPercentage,
                        ),
                      ).toFixed(1)
                    : 0
                }
                unit="%"
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="En Az Verimli"
                value={
                  stockBreakdown.length > 0
                    ? Math.min(
                        ...stockBreakdown.map(
                          (s: StockBreakdownData) => s.usedPercentage,
                        ),
                      ).toFixed(1)
                    : 0
                }
                unit="%"
                color="warning"
              />
            </Grid>

            {/* Stock Breakdown List */}
            <Grid item xs={12} md={4}>
              <StockBreakdownList
                stocks={stockBreakdown}
                onStockSelect={setSelectedStock}
              />
            </Grid>

            {/* Stock Visualization */}
            <Grid item xs={12} md={8}>
              <StockVisualization2D
                stocks={stockBreakdown}
                {...(selectedStock !== undefined
                  ? { selectedStockIndex: selectedStock }
                  : {})}
                onStockClick={setSelectedStock}
                maxVisibleStocks={15}
              />
            </Grid>
          </Grid>
        )}

        {currentPage === "cost-distribution" && (
          <Grid container spacing={tokens.layout.gridGap}>
            {/* Cost Breakdown Metrics */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Malzeme Maliyeti"
                value={(costBreakdown?.materialCost || 0).toFixed(2)}
                unit="₺"
                color="primary"
                icon={
                  <PieChartIcon sx={{ fontSize: tokens.components.icon.sm }} />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="İşçilik Maliyeti"
                value={(costBreakdown?.laborCost || 0).toFixed(2)}
                unit="₺"
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Fire Maliyeti"
                value={(costBreakdown?.wasteCost || 0).toFixed(2)}
                unit="₺"
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Toplam Maliyet"
                value={(costBreakdown?.totalCost || 0).toFixed(2)}
                unit="₺"
                color="error"
              />
            </Grid>

            {/* Cost Breakdown Chart */}
            <Grid item xs={12}>
              {costBreakdown && <CostBreakdownChart costData={costBreakdown} />}
            </Grid>
          </Grid>
        )}

        {currentPage === "algorithm-performance" && (
          <Grid container spacing={tokens.layout.gridGap}>
            {/* Performance Metrics */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Çalışma Süresi"
                value={(result as WizardOptimizationResult).executionTime || 0}
                unit="ms"
                color="info"
                icon={
                  <SpeedIcon sx={{ fontSize: tokens.components.icon.sm }} />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="İterasyon Sayısı"
                value={(result as WizardOptimizationResult).iterations || 0}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Yakınsama Oranı"
                value={((result as WizardOptimizationResult).iterations
                  ? ((result as WizardOptimizationResult).efficiency || 0) /
                    (result as WizardOptimizationResult).iterations!
                  : 0
                ).toFixed(2)}
                unit="%"
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Kalite Skoru"
                value={(
                  (result as WizardOptimizationResult).qualityScore || 0
                ).toFixed(1)}
                unit="/100"
                color="success"
              />
            </Grid>

            {/* Algorithm Performance Card */}
            <Grid item xs={12}>
              <AlgorithmPerformanceCard
                algorithm={(result as WizardOptimizationResult).algorithm!}
                executionTime={
                  (result as WizardOptimizationResult).executionTime || 0
                }
                {...(result.algorithmMetadata
                  ? {
                      metadata: result.algorithmMetadata as {
                        readonly effectiveComplexity?: string;
                        readonly actualGenerations?: number;
                        readonly convergenceReason?: string;
                        readonly bestFitness?: number;
                        readonly executionTimeMs?: number;
                        readonly deterministicSeed?: number;
                        readonly populationSize?: number;
                        readonly finalGeneration?: number;
                      },
                    }
                  : {})}
              />
            </Grid>
          </Grid>
        )}

        {currentPage === "smart-recommendations" && (
          <Grid container spacing={tokens.layout.gridGap}>
            {/* Recommendations Metrics */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Yüksek Öncelikli"
                value={
                  (
                    (result as WizardOptimizationResult).recommendations || []
                  ).filter(
                    (r: Record<string, unknown>) => r.priority === "high",
                  ).length
                }
                color="error"
                icon={
                  <LightbulbIcon sx={{ fontSize: tokens.components.icon.sm }} />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Orta Öncelikli"
                value={
                  (
                    (result as WizardOptimizationResult).recommendations || []
                  ).filter(
                    (r: Record<string, unknown>) => r.priority === "medium",
                  ).length
                }
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Düşük Öncelikli"
                value={
                  (
                    (result as WizardOptimizationResult).recommendations || []
                  ).filter((r: Record<string, unknown>) => r.priority === "low")
                    .length
                }
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Toplam Tasarruf"
                value={(
                  (result as WizardOptimizationResult).recommendations || []
                )
                  .reduce(
                    (
                      sum: number,
                      r: { estimatedSavings?: { cost?: number } },
                    ) => sum + (r.estimatedSavings?.cost || 0),
                    0,
                  )
                  .toFixed(2)}
                unit="₺"
                color="primary"
              />
            </Grid>

            {/* Smart Recommendations */}
            <Grid item xs={12}>
              <SmartRecommendations
                recommendations={(
                  (result as WizardOptimizationResult).recommendations || []
                ).map((rec) => ({
                  type:
                    (rec.type as
                      | "performance"
                      | "cost"
                      | "quality"
                      | "waste") || "performance",
                  priority:
                    (rec.priority as "low" | "medium" | "high") || "low",
                  message: (rec.message as string) || "No message",
                }))}
              />
            </Grid>
          </Grid>
        )}

        {currentPage === "waste-analysis" && (
          <Grid container spacing={tokens.layout.gridGap}>
            {/* Waste Metrics */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Toplam Fire"
                value={(
                  (result as WizardOptimizationResult).totalWaste || 0
                ).toFixed(2)}
                unit="mm"
                color="error"
                icon={
                  <RecyclingIcon sx={{ fontSize: tokens.components.icon.sm }} />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Fire Yüzdesi"
                value={(
                  (result as WizardOptimizationResult).wastePercentage || 0
                ).toFixed(1)}
                unit="%"
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Geri Kazanılabilir"
                value={
                  stockBreakdown.filter(
                    (s: StockBreakdownData) =>
                      s.wasteCategory === "reclaimable",
                  ).length
                }
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Fire Maliyeti"
                value={(costBreakdown?.wasteCost || 0).toFixed(2)}
                unit="₺"
                color="error"
              />
            </Grid>

            {/* Waste Distribution Chart */}
            <Grid item xs={12} md={6}>
              {(
                result as {
                  wasteDistribution?: {
                    minimal: number;
                    small: number;
                    medium: number;
                    large: number;
                    excessive: number;
                    reclaimable: number;
                    totalPieces: number;
                  };
                }
              ).wasteDistribution && (
                <WasteDistributionChart
                  wasteDistribution={
                    (
                      result as unknown as {
                        wasteDistribution: {
                          minimal: number;
                          small: number;
                          medium: number;
                          large: number;
                          excessive: number;
                          reclaimable: number;
                          totalPieces: number;
                        };
                      }
                    ).wasteDistribution
                  }
                />
              )}
            </Grid>

            {/* Waste Analysis Details */}
            <Grid item xs={12} md={6}>
              {(
                result as {
                  wasteDistribution?: {
                    minimal: number;
                    small: number;
                    medium: number;
                    large: number;
                    excessive: number;
                    reclaimable: number;
                    totalPieces: number;
                  };
                }
              ).wasteDistribution && (
                <WasteAnalysisTab
                  wasteDistribution={
                    (
                      result as unknown as {
                        wasteDistribution: {
                          minimal: number;
                          small: number;
                          medium: number;
                          large: number;
                          excessive: number;
                          reclaimable: number;
                          totalPieces: number;
                        };
                      }
                    ).wasteDistribution
                  }
                  totalWaste={
                    (result as WizardOptimizationResult).totalWaste || 0
                  }
                  wastePercentage={
                    (result as WizardOptimizationResult).wastePercentage || 0
                  }
                />
              )}
            </Grid>
          </Grid>
        )}

        {currentPage === "cost-analysis" && (
          <Grid container spacing={tokens.layout.gridGap}>
            {/* Cost Metrics */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Toplam Maliyet"
                value={(costBreakdown?.totalCost || 0).toFixed(2)}
                unit="₺"
                color="primary"
                icon={
                  <AnalyticsIcon sx={{ fontSize: tokens.components.icon.sm }} />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Birim Maliyet"
                value={(costBreakdown
                  ? costBreakdown.totalCost /
                    (result as WizardOptimizationResult).stockCount!
                  : 0
                ).toFixed(2)}
                unit="₺"
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Malzeme Tasarrufu"
                value={(costBreakdown?.materialSavings || 0).toFixed(2)}
                unit="₺"
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="İşçilik Tasarrufu"
                value={(costBreakdown?.laborSavings || 0).toFixed(2)}
                unit="₺"
                color="success"
              />
            </Grid>

            {/* Cost Analysis Details */}
            <Grid item xs={12}>
              {costBreakdown && <CostAnalysisTab costData={costBreakdown} />}
            </Grid>
          </Grid>
        )}

        {currentPage === "quality-metrics" && (
          <Grid container spacing={tokens.layout.gridGap}>
            {/* Quality Metrics */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Kalite Skoru"
                value={(
                  (result as WizardOptimizationResult).qualityScore || 0
                ).toFixed(1)}
                unit="/100"
                color="success"
                icon={
                  <HighQualityIcon
                    sx={{ fontSize: tokens.components.icon.sm }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Kesim Hassasiyeti"
                value={(
                  (result as WizardOptimizationResult).cuttingAccuracy || 0
                ).toFixed(1)}
                unit="%"
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Stok Kullanımı"
                value={(
                  (result as WizardOptimizationResult).stockUtilization || 0
                ).toFixed(1)}
                unit="%"
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <MetricCard
                label="Malzeme Verimliliği"
                value={(
                  (result as WizardOptimizationResult).efficiency || 0
                ).toFixed(1)}
                unit="%"
                color="success"
              />
            </Grid>

            {/* Quality Analysis Details */}
            <Grid item xs={12}>
              <QualityMetricsTab
                {...((result as WizardOptimizationResult).qualityScore !==
                undefined
                  ? {
                      qualityScore: (result as WizardOptimizationResult)
                        .qualityScore,
                    }
                  : {})}
                materialUtilization={
                  (result as WizardOptimizationResult).efficiency || 0
                }
                cuttingComplexity={
                  (result as WizardOptimizationResult).cuts
                    ? (result as WizardOptimizationResult).cuts!.reduce(
                        (sum: number, c: Cut) =>
                          sum +
                          ((c as unknown as { segments?: unknown[] }).segments
                            ?.length || 0),
                        0,
                      ) / (result as WizardOptimizationResult).cuts!.length
                    : 0
                }
                efficiency={
                  (result as WizardOptimizationResult).efficiency || 0
                }
              />
            </Grid>
          </Grid>
        )}
      </Box>
    );
  }

  // Success state - Main Results with Tabs
  return (
    <Box
      sx={{
        p: 0,
        width: "100%",
        maxWidth: "none",
        mx: 0,
        px: {
          xs: 0,
          sm: tokens.spacing.xs,
          md: tokens.spacing.sm,
          lg: tokens.spacing.md,
        },
      }}
    >
      {/* Results Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: ds.colors.background.paper,
          px: {
            xs: tokens.spacing.md,
            sm: tokens.spacing.lg,
            md: tokens.spacing.xl,
            lg: tokens.spacing.xl * 1.5,
          },
          py: tokens.spacing.xs,
        }}
      >
        <Tabs
          value={resultsTab}
          onChange={(_, newValue) => setResultsTab(newValue)}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: `${tokens.typography.base}px`,
              minHeight: device.isTouch
                ? tokens.components.minTouchTarget
                : undefined,
            },
          }}
        >
          <Tab
            label="Kesim Planı"
            icon={<VisibilityIcon />}
            iconPosition="start"
          />
          <Tab
            label="Analiz Dashboard"
            icon={<AnalyticsIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box
        sx={{
          px: {
            xs: tokens.spacing.md,
            sm: tokens.spacing.lg,
            md: tokens.spacing.xl,
            lg: tokens.spacing.xl * 1.5,
          },
          py: {
            xs: tokens.spacing.sm,
            md: tokens.spacing.md,
          },
        }}
      >
        {resultsTab === 0 && (
          <Box sx={{ width: "100%" }}>
            {stockLengthGroups.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 400,
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.lg}px`,
                    fontWeight: 600,
                    mb: tokens.spacing.sm,
                  }}
                >
                  Kesim Planı Verisi Bulunamadı
                </Typography>
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.text.secondary,
                    mb: tokens.spacing.md,
                  }}
                >
                  Optimizasyon sonucu henüz hazır değil veya veri yüklenemedi.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => window.location.reload()}
                  sx={{
                    textTransform: "none",
                    minHeight: device.isTouch
                      ? tokens.components.minTouchTarget
                      : tokens.components.button.md,
                  }}
                >
                  Sayfayı Yenile
                </Button>
              </Box>
            ) : (
              <>
                {/* Global Unit Converter */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: tokens.spacing.md,
                    p: tokens.spacing.sm,
                    backgroundColor: alpha(ds.colors.primary.main, 0.05),
                    borderRadius: `${tokens.borderRadius.lg}px`,
                    border: `1px solid ${alpha(ds.colors.primary.main, 0.1)}`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: tokens.spacing.sm,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: `${tokens.typography.sm}px`,
                        fontWeight: 600,
                        color: ds.colors.text.primary,
                      }}
                    >
                      Uzunluk Birimi:
                    </Typography>
                    <Box sx={{ display: "flex", gap: tokens.spacing.xs }}>
                      {["mm", "cm", "m"].map((unit) => (
                        <Chip
                          key={unit}
                          label={unit}
                          size="small"
                          onClick={() =>
                            setGlobalUnit(unit as "mm" | "cm" | "m")
                          }
                          sx={{
                            cursor: "pointer",
                            height: tokens.components.button.sm,
                            fontSize: `${tokens.typography.xs}px`,
                            backgroundColor:
                              globalUnit === unit
                                ? ds.colors.primary.main
                                : ds.colors.neutral[100],
                            color:
                              globalUnit === unit
                                ? "white"
                                : ds.colors.text.secondary,
                            fontWeight: 600,
                            minWidth: device.isTouch
                              ? tokens.components.minTouchTarget
                              : undefined,
                            "&:hover": !device.isTouch
                              ? {
                                  backgroundColor:
                                    globalUnit === unit
                                      ? ds.colors.primary[700]
                                      : ds.colors.neutral[200],
                                }
                              : {},
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* Profile Badge */}
                {profileInfo && (
                  <Box sx={{ mb: tokens.spacing.md }}>
                    <ProfileBadge
                      profileCode={profileInfo.profileCode}
                      profileName={profileInfo.profileName}
                      stockLengths={profileInfo.stockLengths}
                      source={profileInfo.source}
                    />
                  </Box>
                )}

                {/* Summary Metrics Cards - Single Row 5 Cards - Standard Spacing */}
                <Grid
                  container
                  spacing={tokens.layout.gridGap}
                  sx={{ mb: tokens.spacing.md }}
                >
                  <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <MetricCard
                      label="Toplam Profil"
                      value={result?.stockCount || 0}
                      unit="ADT"
                      icon={
                        <InventoryIcon
                          sx={{ fontSize: tokens.components.icon.md }}
                        />
                      }
                      color="primary"
                      subtitle="Stok"
                      detail={`${result?.cuts?.length || 0} kesim`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <MetricCard
                      label="Fire Oranı"
                      value={(result?.wastePercentage || 0).toFixed(1)}
                      unit="%"
                      icon={
                        <RecyclingIcon
                          sx={{ fontSize: tokens.components.icon.md }}
                        />
                      }
                      color={
                        (result?.wastePercentage || 0) < 10
                          ? "success"
                          : "warning"
                      }
                      subtitle="Atık"
                      detail={`${convertLength(result?.totalWaste || 0, "mm", globalUnit).toFixed(globalUnit === "mm" ? 0 : 1)}${globalUnit}`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <MetricCard
                      label="Verimlilik"
                      value={(result?.efficiency || 0).toFixed(1)}
                      unit="%"
                      icon={
                        <SpeedIcon
                          sx={{ fontSize: tokens.components.icon.md }}
                        />
                      }
                      color={
                        (result?.efficiency || 0) >= 90 ? "success" : "info"
                      }
                      subtitle="Kullanım"
                      detail={`${convertLength(result?.cuts?.reduce((sum, cut) => sum + (cut as BackendCut).usedLength, 0) || 0, "mm", globalUnit).toFixed(globalUnit === "mm" ? 0 : 1)}${globalUnit}`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <MetricCard
                      label="Kesim Sayısı"
                      value={result?.cuts?.length || 0}
                      unit="ADT"
                      icon={
                        <SpeedIcon
                          sx={{ fontSize: tokens.components.icon.md }}
                        />
                      }
                      color="success"
                      subtitle="Plan"
                      detail={`${result?.stockCount || 0} stok`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <MetricCard
                      label="Kullanılan Malzeme"
                      value={convertLength(
                        result?.cuts?.reduce(
                          (sum, cut) => sum + (cut as BackendCut).usedLength,
                          0,
                        ) || 0,
                        "mm",
                        globalUnit,
                      ).toFixed(globalUnit === "mm" ? 0 : 1)}
                      unit={globalUnit}
                      icon={
                        <InventoryIcon
                          sx={{ fontSize: tokens.components.icon.md }}
                        />
                      }
                      color="info"
                      subtitle="Uzunluk"
                      detail={`${result?.stockCount || 0} stok`}
                    />
                  </Grid>
                </Grid>

                {/* Stock Length Summary Cards */}
                <Box sx={{ mb: tokens.spacing.md }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: tokens.spacing.sm,
                      fontWeight: 600,
                      fontSize: `${tokens.typography.lg}px`,
                    }}
                  >
                    Kullanılan Stok Boyları
                  </Typography>
                  <Grid container spacing={tokens.layout.gridGap}>
                    {stockLengthGroups.map((group) => (
                      <Grid item xs={12} sm={6} md={4} key={group.stockLength}>
                        <CardV2
                          variant="elevated"
                          sx={{
                            p: tokens.components.card.padding,
                            height: "100%",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: tokens.spacing.sm,
                              mb: tokens.spacing.xs,
                            }}
                          >
                            <Box
                              sx={{
                                p: tokens.spacing.sm,
                                borderRadius: "50%",
                                backgroundColor: `${ds.colors.primary.main}15`,
                                color: ds.colors.primary.main,
                              }}
                            >
                              <RulerIcon
                                sx={{ fontSize: tokens.components.icon.md }}
                              />
                            </Box>
                            <Typography
                              variant="h5"
                              sx={{
                                fontWeight: 700,
                                color: ds.colors.text.primary,
                                fontSize: `${tokens.typography.xl}px`,
                              }}
                            >
                              {group.stockLength}mm
                            </Typography>
                          </Box>
                          <Stack spacing={tokens.spacing.xs}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: `${tokens.typography.sm}px` }}
                              >
                                Toplam Stok:
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ fontSize: `${tokens.typography.sm}px` }}
                              >
                                {group.totalStocks} Adet
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: `${tokens.typography.sm}px` }}
                              >
                                Toplam Parça:
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ fontSize: `${tokens.typography.sm}px` }}
                              >
                                {group.totalPieces}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: `${tokens.typography.sm}px` }}
                              >
                                Verimlilik:
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ fontSize: `${tokens.typography.sm}px` }}
                                color={
                                  group.avgEfficiency >= 90
                                    ? ds.colors.success.main
                                    : ds.colors.warning.main
                                }
                              >
                                {group.avgEfficiency.toFixed(1)}%
                              </Typography>
                            </Box>
                          </Stack>
                        </CardV2>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Stock Length Groups (Accordion) */}
                <Box sx={{ mb: tokens.spacing.md }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: tokens.spacing.sm,
                      fontWeight: 600,
                      fontSize: `${tokens.typography.lg}px`,
                    }}
                  >
                    Stok Boy Bazında Kesim Planları
                  </Typography>
                  <Stack spacing={tokens.spacing.md}>
                    {stockLengthGroups.map((group, idx) => (
                      <StockLengthAccordion
                        key={idx}
                        stockLength={group.stockLength}
                        algorithm={result?.algorithm || "Unknown"}
                        count={group.plans.length}
                        totalWaste={group.plans.reduce(
                          (sum, plan) => sum + (plan.totalWaste || 0),
                          0,
                        )}
                        cuts={group.plans.map((plan, planIdx) => ({
                          id: plan.planId || `cut-${idx}-${planIdx}`,
                          stockLength: plan.stockLength,
                          usedLength: plan.stockLength - (plan.totalWaste || 0),
                          remainingLength: plan.totalWaste || 0,
                          segmentCount: plan.totalPieces,
                          segments: plan.cuts[0]?.segments || [],
                          efficiency: plan.efficiency,
                          isReclaimable: (plan.totalWaste || 0) >= 50,
                        }))}
                        efficiency={group.avgEfficiency}
                      />
                    ))}
                  </Stack>
                </Box>
              </>
            )}
          </Box>
        )}

        {resultsTab === 1 && (
          <Grid container spacing={tokens.layout.gridGap}>
            {/* Kesim Planı Görselleştirme */}
            <Grid item xs={12} sm={6} md={6} lg={4}>
              <CardV2
                variant="glass"
                hoverable
                onClick={() => handlePageNavigation("cutting-plan")}
                sx={{
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: ds.transitions.base,
                  "&:hover": !device.isTouch
                    ? {
                        transform: "translateY(-4px)",
                        boxShadow: ds.shadows.soft.xl,
                      }
                    : {},
                }}
              >
                <VisibilityIcon
                  sx={{
                    fontSize: tokens.components.icon.xl,
                    color: ds.colors.primary.main,
                    mb: tokens.spacing.sm,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.lg}px`,
                    fontWeight: 600,
                    mb: tokens.spacing.xs,
                  }}
                >
                  Kesim Planı Görselleştirme
                </Typography>
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.text.secondary,
                  }}
                >
                  3D/2D kesim planı görselleştirmesi
                </Typography>
              </CardV2>
            </Grid>

            {/* Stok Detayları */}
            <Grid item xs={12} sm={6} md={6} lg={4}>
              <CardV2
                variant="glass"
                hoverable
                onClick={() => handlePageNavigation("stock-details")}
                sx={{
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: ds.transitions.base,
                  "&:hover": !device.isTouch
                    ? {
                        transform: "translateY(-4px)",
                        boxShadow: ds.shadows.soft.xl,
                      }
                    : {},
                }}
              >
                <InventoryIcon
                  sx={{
                    fontSize: tokens.components.icon.xl,
                    color: ds.colors.secondary.main,
                    mb: tokens.spacing.sm,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.lg}px`,
                    fontWeight: 600,
                    mb: tokens.spacing.xs,
                  }}
                >
                  Stok Detayları
                </Typography>
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.text.secondary,
                  }}
                >
                  Stok bazlı detaylı analiz
                </Typography>
              </CardV2>
            </Grid>

            {/* Maliyet Dağılımı */}
            <Grid item xs={12} sm={6} md={6} lg={4}>
              <CardV2
                variant="glass"
                hoverable
                onClick={() => handlePageNavigation("cost-distribution")}
                sx={{
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: ds.transitions.base,
                  "&:hover": !device.isTouch
                    ? {
                        transform: "translateY(-4px)",
                        boxShadow: ds.shadows.soft.xl,
                      }
                    : {},
                }}
              >
                <PieChartIcon
                  sx={{
                    fontSize: tokens.components.icon.xl,
                    color: ds.colors.warning.main,
                    mb: tokens.spacing.sm,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.lg}px`,
                    fontWeight: 600,
                    mb: tokens.spacing.xs,
                  }}
                >
                  Maliyet Dağılımı
                </Typography>
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.text.secondary,
                  }}
                >
                  Maliyet analizi ve dağılımı
                </Typography>
              </CardV2>
            </Grid>

            {/* Algoritma Performansı */}
            <Grid item xs={12} sm={6} md={6} lg={4}>
              <CardV2
                variant="glass"
                hoverable
                onClick={() => handlePageNavigation("algorithm-performance")}
                sx={{
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: ds.transitions.base,
                  "&:hover": !device.isTouch
                    ? {
                        transform: "translateY(-4px)",
                        boxShadow: ds.shadows.soft.xl,
                      }
                    : {},
                }}
              >
                <SpeedIcon
                  sx={{
                    fontSize: tokens.components.icon.xl,
                    color: ds.colors.info.main,
                    mb: tokens.spacing.sm,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.lg}px`,
                    fontWeight: 600,
                    mb: tokens.spacing.xs,
                  }}
                >
                  Algoritma Performansı
                </Typography>
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.text.secondary,
                  }}
                >
                  Algoritma telemetri ve performans
                </Typography>
              </CardV2>
            </Grid>

            {/* Akıllı Öneriler */}
            <Grid item xs={12} sm={6} md={6} lg={4}>
              <CardV2
                variant="glass"
                hoverable
                onClick={() => handlePageNavigation("smart-recommendations")}
                sx={{
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: ds.transitions.base,
                  "&:hover": !device.isTouch
                    ? {
                        transform: "translateY(-4px)",
                        boxShadow: ds.shadows.soft.xl,
                      }
                    : {},
                }}
              >
                <LightbulbIcon
                  sx={{
                    fontSize: tokens.components.icon.xl,
                    color: ds.colors.success.main,
                    mb: tokens.spacing.sm,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.lg}px`,
                    fontWeight: 600,
                    mb: tokens.spacing.xs,
                  }}
                >
                  Akıllı Öneriler
                </Typography>
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.text.secondary,
                  }}
                >
                  AI destekli optimizasyon önerileri
                </Typography>
              </CardV2>
            </Grid>

            {/* Fire Analizi */}
            <Grid item xs={12} sm={6} md={6} lg={4}>
              <CardV2
                variant="glass"
                hoverable
                onClick={() => handlePageNavigation("waste-analysis")}
                sx={{
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: ds.transitions.base,
                  "&:hover": !device.isTouch
                    ? {
                        transform: "translateY(-4px)",
                        boxShadow: ds.shadows.soft.xl,
                      }
                    : {},
                }}
              >
                <RecyclingIcon
                  sx={{
                    fontSize: tokens.components.icon.xl,
                    color: ds.colors.error.main,
                    mb: tokens.spacing.sm,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.lg}px`,
                    fontWeight: 600,
                    mb: tokens.spacing.xs,
                  }}
                >
                  Fire Analizi
                </Typography>
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.text.secondary,
                  }}
                >
                  Atık analizi ve geri dönüşüm
                </Typography>
              </CardV2>
            </Grid>

            {/* Maliyet Analizi */}
            <Grid item xs={12} sm={6} md={6} lg={4}>
              <CardV2
                variant="glass"
                hoverable
                onClick={() => handlePageNavigation("cost-analysis")}
                sx={{
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: ds.transitions.base,
                  "&:hover": !device.isTouch
                    ? {
                        transform: "translateY(-4px)",
                        boxShadow: ds.shadows.soft.xl,
                      }
                    : {},
                }}
              >
                <AnalyticsIcon
                  sx={{
                    fontSize: tokens.components.icon.xl,
                    color: ds.colors.warning.main,
                    mb: tokens.spacing.sm,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.lg}px`,
                    fontWeight: 600,
                    mb: tokens.spacing.xs,
                  }}
                >
                  Maliyet Analizi
                </Typography>
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.text.secondary,
                  }}
                >
                  Detaylı maliyet analizi
                </Typography>
              </CardV2>
            </Grid>

            {/* Kalite Metrikleri */}
            <Grid item xs={12} sm={6} md={6} lg={4}>
              <CardV2
                variant="glass"
                hoverable
                onClick={() => handlePageNavigation("quality-metrics")}
                sx={{
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: ds.transitions.base,
                  "&:hover": !device.isTouch
                    ? {
                        transform: "translateY(-4px)",
                        boxShadow: ds.shadows.soft.xl,
                      }
                    : {},
                }}
              >
                <HighQualityIcon
                  sx={{
                    fontSize: tokens.components.icon.xl,
                    color: ds.colors.success.main,
                    mb: tokens.spacing.sm,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.lg}px`,
                    fontWeight: 600,
                    mb: tokens.spacing.xs,
                  }}
                >
                  Kalite Metrikleri
                </Typography>
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.text.secondary,
                  }}
                >
                  Kalite skorları ve metrikleri
                </Typography>
              </CardV2>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default ResultsStep;

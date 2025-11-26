/**
 * @fileoverview Enterprise Optimization Wizard - Design System v2.0
 * @module EnterpriseOptimizationWizard
 * @version 2.0.0
 *
 * Modern tab-based wizard with clean architecture
 * - Tab navigation (non-linear)
 * - Design System v2.0 compliance
 * - Modular component structure
 * - Enterprise-grade state management
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, Chip, Stack, alpha, Tooltip } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  ChevronRight as ChevronRightIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import {
  useDesignSystem,
  useAdaptiveUIContext,
  useAdaptiveVariant,
} from "@/shared/hooks";
import { CardV2 } from "@/shared";
import { apiClient, getAuthToken } from "@/shared/api/client";
import { getCurrentISOWeek } from "@/shared/lib/dateUtils";

// Import step components (WizardHeader and WizardTabs no longer used - sidebar pattern)
import { CuttingListStep } from "./components/CuttingListStep";
import { ParametersStep } from "./components/ParametersStep";
import { ResultsStep } from "./components/ResultsStep";
import { DetailedSelectionDialog } from "./components/DetailedSelectionDialog";
import { StockLengthConfigDialog } from "./components/StockLengthConfigDialog";

// Import algorithm selector
import { AlgorithmModeSelector } from "@/widgets/algorithm-selector";
import type { AlgorithmMode } from "@/entities/algorithm";
import type { Cut, CutSegment } from "./types";

// Import types
import type {
  CuttingListData,
  CuttingListItem,
  OptimizationParams,
  OptimizationResult,
  ProfileSelectionMap,
} from "./types";

// Import constants
import { DEFAULT_PARAMS } from "./constants";

/**
 * Wizard Steps for Breadcrumb Navigation
 */
const STEPS = [
  { id: 0, label: "1. LİSTE SEÇİMİ", shortLabel: "Liste" },
  { id: 1, label: "2. YAPILANDIRMA", shortLabel: "Config" },
  { id: 2, label: "3. SONUÇLAR", shortLabel: "Sonuçlar" },
] as const;

/**
 * Enterprise Optimization Wizard - Main Component
 * Modern tab-based interface with Design System v2.0
 */
export const EnterpriseOptimizationWizard: React.FC = () => {
  const ds = useDesignSystem();
  const { device, tokens } = useAdaptiveUIContext();

  // Wizard navigation state
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Wizard data state
  const [cuttingLists, setCuttingLists] = useState<CuttingListData[]>([]);
  const [selectedCuttingList, setSelectedCuttingList] =
    useState<CuttingListData | null>(null);
  const [loadingLists, setLoadingLists] = useState(false);

  const [params, setParams] = useState<OptimizationParams>(DEFAULT_PARAMS);
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Algorithm mode state
  const [algorithmMode, setAlgorithmMode] = useState<AlgorithmMode>("standard");

  // Dialog state
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showDetailedSelection, setShowDetailedSelection] = useState(false);
  const [showStockLengthConfig, setShowStockLengthConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cutting lists on mount
  useEffect(() => {
    loadCuttingLists();
  }, []);

  /**
   * Load cutting lists from API
   * Enterprise pattern: Single responsibility, error handling
   */
  const loadCuttingLists = useCallback(async () => {
    setLoadingLists(true);
    try {
      const response = await apiClient.get<{
        success: boolean;
        data?: CuttingListData[];
      }>("/cutting-list");

      if (response.data.success && response.data.data) {
        const lists = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setCuttingLists(lists);
      } else {
        setCuttingLists([]);
      }
    } catch (error) {
      console.error("[EnterpriseWizard] Failed to load cutting lists:", error);
      setCuttingLists([]);
    } finally {
      setLoadingLists(false);
    }
  }, []);

  /**
   * Handle cutting list selection
   */
  const handleCuttingListSelect = useCallback(
    (list: CuttingListData) => {
      console.log("[EnterpriseWizard v2] 🎯 Cutting list selected:", list.id);
      setSelectedCuttingList(list);

      // Open detailed selection dialog
      console.log(
        "[EnterpriseWizard v2] 🔓 Opening detailed selection dialog...",
      );
      setShowDetailedSelection(true);

      if (!completedSteps.includes(0)) {
        setCompletedSteps((prev) => [...prev, 0]);
      }
    },
    [completedSteps],
  );

  /**
   * Handle add new list
   */
  const handleAddNewList = useCallback(() => {
    // Navigate to cutting list builder
    console.log("[EnterpriseWizard] Redirect to cutting list builder");
  }, []);

  /**
   * Handle parameters change
   */
  const handleParamsChange = useCallback(
    (newParams: OptimizationParams) => {
      setParams(newParams);
      if (!completedSteps.includes(1)) {
        setCompletedSteps((prev) => [...prev, 1]);
      }
    },
    [completedSteps],
  );

  /**
   * Handle start optimization
   */
  const handleStartOptimization = useCallback(async () => {
    if (!selectedCuttingList) {
      setOptimizationResult({
        success: false,
        message: "Lütfen önce bir kesim listesi seçin",
        error: "NO_LIST_SELECTED",
      });
      return;
    }

    if (!params.objectives || params.objectives.length === 0) {
      setOptimizationResult({
        success: false,
        message: "En az bir optimizasyon hedefi seçmelisiniz",
        error: "NO_OBJECTIVES",
      });
      return;
    }

    // Validate sections exist
    if (
      !selectedCuttingList.sections ||
      selectedCuttingList.sections.length === 0
    ) {
      setOptimizationResult({
        success: false,
        message:
          "Seçilen kesim listesinde ürün grubu bulunmuyor. Lütfen Kesim Listesi Oluşturucu sayfasından ürün ekleyin.",
        error: "NO_SECTIONS",
      });
      return;
    }

    // DEBUG: Log params.items state
    console.log("[EnterpriseWizard v2] 🔍 params.items state:", {
      hasParamsItems: !!params.items,
      paramsItemsLength: params.items?.length || 0,
      paramsItems: params.items,
      FULL_PARAMS: params, // Log entire params object to see all fields
    });

    // Use selected items from DetailedSelectionDialog if available, otherwise use all items
    const items =
      params.items && params.items.length > 0
        ? (() => {
            console.log(
              "[EnterpriseWizard v2] ✅ Using params.items for optimization",
            );
            console.log(
              "[EnterpriseWizard v2] 🔍 Sample params.items:",
              params.items.slice(0, 2),
            );
            return params.items.map((item) => {
              // ✅ FIX: Handle both DetailedSelectionDialog format (profile, measurement) and fallback format
              const profileType = item.profile || item.profileType || "Unknown";
              const length =
                typeof item.measurement === "string"
                  ? parseFloat(item.measurement.replace("mm", "")) || 0
                  : item.length || 0;
              const quantity = item.quantity || 0;

              console.log("[EnterpriseWizard v2] 🔍 Transforming item:", {
                profileType,
                measurement: item.measurement,
                length,
                quantity,
              });

              return {
                id: `${item.workOrderId}-${item.profileId || Math.random()}`,
                profileType,
                length,
                quantity,
                totalLength: length * quantity,
                workOrderId: item.workOrderId,
                color: item.workOrderItem?.color || "",
                version: item.workOrderItem?.version || "",
                size: item.workOrderItem?.size || "",
              };
            });
          })()
        : (() => {
            console.log(
              "[EnterpriseWizard v2] ⚠️ Falling back to all items from cutting list",
            );
            return (
              selectedCuttingList.sections?.flatMap((section) => {
                return (
                  section.items?.flatMap((item) => {
                    console.log("[DEBUG] Processing item:", {
                      id: item.id,
                      workOrderId: item.workOrderId,
                      hasWorkOrder: !!item.workOrderId,
                      profiles: item.profiles?.length || 0,
                    });

                    return (
                      item.profiles?.map((profile) => ({
                        id: `${item.id}-${profile.id}`,
                        profileType: profile.profile,
                        length: parseFloat(profile.measurement),
                        quantity: profile.quantity,
                        totalLength:
                          parseFloat(profile.measurement) * profile.quantity,
                        workOrderId: item.workOrderId,
                        color: item.color,
                        version: item.version,
                        size: item.size,
                      })) || []
                    );
                  }) || []
                );
              }) || []
            );
          })();

    if (items.length === 0) {
      setOptimizationResult({
        success: false,
        message:
          "Seçilen kesim listesinde hiç iş emri bulunmuyor. Lütfen Kesim Listesi Oluşturucu sayfasından iş emri ekleyin.",
        error: "NO_ITEMS",
      });
      return;
    }

    setIsOptimizing(true);
    setActiveStep(2); // Go to results step (step 3 merged into step 2)

    try {
      // Get current ISO week for profile resolution
      const { week, year } = getCurrentISOWeek();

      // Extract unique work order ID and profile type for profile params
      const workOrderIds = Array.from(
        new Set(items.map((item) => item.workOrderId).filter(Boolean)),
      );
      const profileTypes = Array.from(
        new Set(items.map((item) => item.profileType).filter(Boolean)),
      );

      const workOrderId = workOrderIds.length > 0 ? workOrderIds[0] : undefined;
      const profileType = profileTypes.length > 0 ? profileTypes[0] : undefined;

      console.log("[EnterpriseWizard] 🔍 Profile params debug:", {
        workOrderIds,
        profileTypes,
        workOrderId,
        profileType,
        conditionMet: !!(workOrderId && profileType),
      });

      // ✅ Select endpoint based on algorithm mode
      const endpoint = "/api/enterprise/optimize";

      const requestBody = {
        items: items,
        algorithm: params.algorithm,
        algorithmMode: algorithmMode,
        objectives: params.objectives,
        constraints: params.constraints,
        performance: {
          maxIterations: params.maxIterations,
          populationSize: params.populationSize,
          mutationRate: params.mutationRate,
          crossoverRate: params.crossoverRate,
          timeout: params.timeout,
        },
        costModel: {
          materialCost: 0,
          laborCost: 0,
          wasteCost: 0,
          setupCost: 0,
          transportCost: 0,
          overheadCost: 0,
        },
        materialStockLengths:
          params.stockLengths?.map((length) => ({
            profileType: "aluminum" as const,
            stockLength: length, // ← FIX: 'length' yerine 'stockLength'
            availability: 1000,
            costPerMm: 0,
            costPerStock: 0,
            materialGrade: "standard",
            weight: 0,
          })) || [],
        // ✅ Profile management parameters
        ...(workOrderId &&
          profileType && {
            profileParams: {
              workOrderId,
              profileType,
              weekNumber: week,
              year,
            },
          }),
      };

      console.log("[EnterpriseWizard] REQUEST BODY:", {
        itemsCount: requestBody.items.length,
        firstItem: requestBody.items[0],
        objectives: requestBody.objectives,
        algorithm: requestBody.algorithm,
        stockLengths: requestBody.materialStockLengths.map(
          (s) => s.stockLength,
        ),
        workOrderIds: requestBody.items
          .map((i) => i.workOrderId)
          .filter(Boolean),
        profileParams: (requestBody as { profileParams?: unknown })
          .profileParams,
        FULL_REQUEST: requestBody, // Full request body for debugging
      });

      // ✅ REAL API CALL: Enterprise optimization endpoint with mode support
      // Get auth token from client (handles mock token in dev if enabled)
      const authToken = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[EnterpriseWizard] HTTP Error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(
          `HTTP ${response.status} ${response.statusText} — ${errorText}`,
        );
      }

      const result = await response.json();

      // Debug API response
      console.log("[EnterpriseWizard] 🔍 API Response:", result);
      console.log("[EnterpriseWizard] 🔍 Response data:", result.data);
      console.log("[EnterpriseWizard] 🔍 Response cuts:", result.data?.cuts);
      console.log(
        "[EnterpriseWizard] 🔍 OptimizationResult:",
        result.data?.optimizationResult,
      );
      console.log(
        "[EnterpriseWizard] 🔍 OptimizationResult cuts:",
        result.data?.optimizationResult?.cuts,
      );
      console.log("[EnterpriseWizard] 🎯 Received cuts:", {
        cutsCount: result.data.cuts?.length,
        sampleCut: result.data.cuts?.[0],
        sampleSegment: result.data.cuts?.[0]?.segments?.[0],
        hasWorkOrder: !!result.data.cuts?.[0]?.segments?.[0]?.workOrderId,
      });

      console.log("[EnterpriseWizard] 🎯 Received cuts detail:", {
        cutsCount: result.data.cuts?.length,
        firstCut: result.data.cuts?.[0],
        firstCutSegments: result.data.cuts?.[0]?.segments,
        firstSegmentWorkOrder:
          result.data.cuts?.[0]?.segments?.[0]?.workOrderId,
        allStockLengths: Array.from(
          new Set(result.data.cuts?.map((c: Cut) => c.stockLength)),
        ),
        uniqueWorkOrders: Array.from(
          new Set(
            result.data.cuts?.flatMap((c: Cut) =>
              c.segments?.map((s: CutSegment) => s.workOrderId).filter(Boolean),
            ),
          ),
        ),
      });

      if (result.success && result.data) {
        // Standard result (single solution)
        console.log(
          "[EnterpriseWizard] 🎯 Setting algorithm from result.data.algorithm:",
          result.data.algorithm,
        );
        console.log(
          "[EnterpriseWizard] 🎯 Type:",
          typeof result.data.algorithm,
        );
        console.log(
          "[EnterpriseWizard] 🎯 Full data object keys:",
          Object.keys(result.data),
        );
        console.log(
          "[EnterpriseWizard] 🎯 FULL DATA:",
          JSON.stringify(result.data, null, 2).substring(0, 500),
        );

        console.log("[EnterpriseWizard] 🔍 Setting optimization result:", {
          hasMetadata: !!result.data.metadata,
          metadata: result.data.metadata,
          metadataKeys: result.data.metadata
            ? Object.keys(result.data.metadata)
            : [],
        });

        setOptimizationResult({
          success: true,
          message: "Optimization completed successfully",
          algorithm: result.data.algorithm, // ✅ FIX: Backend now sends display name directly
          efficiency: result.data.efficiency,
          wastePercentage: result.data.wastePercentage,
          stockCount: result.data.stockCount,
          totalCost: result.data.totalCost,
          totalWaste: result.data.totalWaste, // ✅ EKLE
          executionTime: result.data.executionTime,
          cuts: result.data.cuts || [], // Add cuts data from response
          metadata: result.data.metadata, // ✅ Profile badge için metadata
        });

        if (!completedSteps.includes(2)) {
          setCompletedSteps((prev) => [...prev, 2]);
        }
      } else {
        throw new Error(result.error || "Optimization failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[EnterpriseWizard] Optimization failed:", {
        error,
        message: errorMessage,
        type: typeof error,
        stack: error instanceof Error ? error.stack : undefined,
      });

      setOptimizationResult({
        success: false,
        message: `Optimizasyon başarısız oldu: ${errorMessage}`,
        error: "OPTIMIZATION_ERROR",
      });
    } finally {
      setIsOptimizing(false);
    }
  }, [selectedCuttingList, params, algorithmMode, completedSteps]);

  /**
   * Handle export
   */
  const handleExport = useCallback((format: "pdf" | "excel" | "json") => {
    console.log(`[EnterpriseWizard] Exporting as ${format}`);
    // TODO: Implement export logic
  }, []);

  /**
   * Handle new optimization
   */
  const handleNewOptimization = useCallback(() => {
    setActiveStep(0);
    setSelectedCuttingList(null);
    setParams(DEFAULT_PARAMS);
    setOptimizationResult(null);
    setCompletedSteps([]);
  }, []);

  /**
   * Handle step change
   */
  const handleStepChange = useCallback((newStep: number) => {
    setActiveStep(newStep);
  }, []);

  /**
   * Check if can start optimization
   */
  const canStartOptimization = useMemo(() => {
    return !!(
      selectedCuttingList &&
      params.objectives?.length > 0 &&
      !isOptimizing
    );
  }, [selectedCuttingList, params.objectives, isOptimizing]);

  /**
   * Adaptive button size for sticky optimize button
   */
  const stickyButtonSize = useAdaptiveVariant({
    mobile: tokens.components.button.lg,
    compact: tokens.components.button.lg,
    standard: tokens.components.button.lg,
    dense: tokens.components.button.lg,
    kiosk: tokens.components.button.lg * 1.2,
  });

  return (
    <Box
      sx={{
        background: ds.colors.background.default,
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: ds.zIndex.sticky,
          background: ds.colors.background.paper,
          borderBottom: `1px solid ${ds.colors.neutral[200]}`,
          backdropFilter: ds.glass.backdropFilter,
        }}
      >
        <Box
          sx={{
            maxWidth:
              typeof tokens.layout.maxWidth === "number"
                ? tokens.layout.maxWidth
                : tokens.layout.maxWidth === "none"
                  ? "none"
                  : 1800,
            mx: "auto",
            px: {
              xs: tokens.layout.containerPadding,
              md: tokens.spacing.md,
              lg: tokens.spacing.lg,
            },
            py: tokens.spacing.sm,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={tokens.spacing.xs}
            flexWrap="wrap"
            justifyContent="center"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            {STEPS.map((step, idx) => {
              const isCompleted = completedSteps.includes(step.id);
              const isActive = activeStep === step.id;
              const isClickable =
                isCompleted ||
                isActive ||
                (step.id === activeStep + 1 &&
                  completedSteps.includes(activeStep));

              return (
                <React.Fragment key={step.id}>
                  <Chip
                    label={step.label}
                    onClick={
                      isClickable ? () => handleStepChange(step.id) : undefined
                    }
                    color={
                      isActive ? "primary" : isCompleted ? "success" : "default"
                    }
                    variant={
                      isActive ? "filled" : isCompleted ? "filled" : "outlined"
                    }
                    {...(isCompleted ? { icon: <CheckCircleIcon /> } : {})}
                    sx={{
                      cursor: isClickable ? "pointer" : "default",
                      fontWeight: isActive
                        ? ds.typography.fontWeight.semibold
                        : isCompleted
                          ? ds.typography.fontWeight.medium
                          : ds.typography.fontWeight.normal,
                      fontSize: `${tokens.typography.sm}px`,
                      height: tokens.components.button.sm,
                      minHeight: device.isTouch
                        ? tokens.components.minTouchTarget
                        : tokens.components.button.sm,
                      transition: ds.transitions.fast,
                      opacity: isClickable ? 1 : 0.6,
                      width: { xs: "100%", sm: "auto" },
                      "&:hover":
                        isClickable && !device.isTouch
                          ? {
                              transform: "translateY(-1px)",
                              boxShadow: ds.shadows.soft.md,
                            }
                          : {},
                    }}
                  />
                  {idx < STEPS.length - 1 && (
                    <ChevronRightIcon
                      sx={{
                        fontSize: tokens.components.icon.xs,
                        color: ds.colors.text.secondary,
                        display: { xs: "none", sm: "block" },
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth:
            activeStep === 2
              ? tokens.layout.maxWidth === "none"
                ? "none"
                : typeof tokens.layout.maxWidth === "number"
                  ? tokens.layout.maxWidth
                  : "none"
              : typeof tokens.layout.maxWidth === "number"
                ? tokens.layout.maxWidth
                : 1800,
          mx: "auto",
          px:
            activeStep === 2
              ? {
                  xs: tokens.spacing.md,
                  sm: tokens.spacing.lg,
                  md: tokens.spacing.xl,
                  lg: tokens.spacing.xl * 1.5,
                  xl: tokens.spacing.xl * 2,
                }
              : {
                  xs: tokens.layout.containerPadding,
                  md: tokens.spacing.md,
                  lg: tokens.spacing.lg,
                },
          py:
            activeStep === 2
              ? { xs: tokens.spacing.sm, md: tokens.spacing.md }
              : tokens.layout.sectionSpacing,
          display: "grid",
          gap:
            activeStep === 2
              ? { xs: tokens.spacing.md, md: tokens.spacing.lg }
              : tokens.layout.sectionSpacing,
          position: "relative", // ✅ Sticky buton için
        }}
      >
        {/* Sticky Optimize Button - Card'ın sağında, dikey ortada */}
        {activeStep === 1 && (
          <Box
            sx={{
              position: "fixed",
              top: "50%", // ✅ Dikey ortalama
              // ✅ Card'ın SAĞ TARAFINDA, card ile scrollbar arasındaki boşluğun tam ortası
              // Card sağ kenarı (viewport solundan): calc(50% + 900px)
              // Scrollbar sol kenarı (viewport solundan): calc(100% - 17px)
              // Boşluk genişliği: calc((100% - 17px) - (50% + 900px)) = calc(50% - 900px - 17px)
              // Boşluğun ortası (viewport solundan): calc((50% + 900px) + (50% - 900px - 17px) / 2) = calc(75% + 441.5px)
              // left kullanarak butonun sol kenarını bu noktaya koyuyoruz, sonra transform ile merkezini hizalıyoruz
              left: {
                md: `calc(75% + 441.5px)`, // Boşluğun ortası (viewport solundan)
                lg: `calc(75% + 441.5px)`,
              },
              transform: "translateX(-50%) translateY(-50%)", // ✅ X: buton genişliğinin yarısı sola (merkez için), Y: dikey ortalama
              zIndex: 1000,
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Tooltip title="Optimizasyonu Başlat" arrow placement="left">
              <Box
                component="button"
                onClick={handleStartOptimization}
                disabled={!canStartOptimization || isOptimizing}
                sx={{
                  position: "relative",
                  width: stickyButtonSize,
                  height: stickyButtonSize,
                  minWidth: device.isTouch
                    ? tokens.components.minTouchTarget
                    : undefined,
                  minHeight: device.isTouch
                    ? tokens.components.minTouchTarget
                    : undefined,
                  borderRadius: "50%",
                  // ✅ Projenin primary renk yapısı: mavi tonları
                  background: `linear-gradient(135deg, ${ds.colors.primary[600]} 0%, ${ds.colors.primary[700]} 50%, ${ds.colors.primary[800]} 100%)`,
                  color: ds.colors.primary.contrast,
                  border: `2px solid ${alpha(ds.colors.primary[500], 0.3)}`,
                  boxShadow: `
                    0 8px 24px ${alpha(ds.colors.primary[700], 0.3)},
                    0 4px 12px ${alpha(ds.colors.primary[600], 0.25)},
                    inset 0 1px 0 ${alpha("#ffffff", 0.15)}
                  `,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor:
                    !canStartOptimization || isOptimizing
                      ? "not-allowed"
                      : "pointer",
                  transition: `all ${ds.transitions.base} cubic-bezier(0.4, 0, 0.2, 1)`,
                  p: 0,
                  outline: "none",
                  "&:hover:not([disabled])": {
                    transform: "translateY(-4px) scale(1.1)",
                    background: `linear-gradient(135deg, ${ds.colors.primary[500]} 0%, ${ds.colors.primary[600]} 50%, ${ds.colors.primary[700]} 100%)`,
                    boxShadow: `
                      0 12px 32px ${alpha(ds.colors.primary[700], 0.4)},
                      0 6px 16px ${alpha(ds.colors.primary[600], 0.3)},
                      0 0 0 3px ${alpha(ds.colors.primary[400], 0.2)},
                      inset 0 1px 0 ${alpha("#ffffff", 0.2)}
                    `,
                    borderColor: ds.colors.primary[500],
                    "& svg": {
                      transform: "translateX(2px)",
                    },
                  },
                  "&:active:not([disabled])": {
                    transform: "translateY(-2px) scale(1.05)",
                    boxShadow: `
                      0 6px 16px ${alpha(ds.colors.primary[700], 0.3)},
                      0 3px 8px ${alpha(ds.colors.primary[600], 0.25)},
                      inset 0 1px 0 ${alpha("#ffffff", 0.15)}
                    `,
                  },
                  "&[disabled]": {
                    opacity: 0.5,
                    cursor: "not-allowed",
                    filter: "grayscale(30%)",
                  },
                  "&:focus-visible": {
                    outline: `3px solid ${alpha(ds.colors.primary[400], 0.5)}`,
                    outlineOffset: "3px",
                  },
                }}
              >
                {isOptimizing ? (
                  <Box
                    sx={{
                      width: tokens.components.icon.md,
                      height: tokens.components.icon.md,
                      border: `3px solid ${alpha("#ffffff", 0.2)}`,
                      borderTopColor: "#ffffff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                ) : (
                  <PlayArrowIcon
                    sx={{
                      fontSize: tokens.components.icon.md,
                      color: "#ffffff",
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                      transition: ds.transitions.base,
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          </Box>
        )}
        {activeStep === 0 && (
          <CardV2 variant="outlined">
            <CuttingListStep
              cuttingLists={cuttingLists}
              selectedCuttingList={selectedCuttingList}
              onCuttingListSelect={handleCuttingListSelect}
              onAddNewList={handleAddNewList}
              loading={loadingLists}
            />
          </CardV2>
        )}

        {activeStep === 1 && (
          <CardV2 variant="outlined">
            <Stack spacing={tokens.spacing.md}>
              <ParametersStep
                params={params}
                onParamsChange={handleParamsChange}
                algorithmMode={algorithmMode}
                onAlgorithmModeChange={setAlgorithmMode}
                itemCount={
                  selectedCuttingList?.sections?.reduce(
                    (sum, s) => sum + s.items.length,
                    0,
                  ) ?? 0
                }
                onStartOptimization={handleStartOptimization}
                canStartOptimization={canStartOptimization}
                isOptimizing={isOptimizing}
              />
            </Stack>
          </CardV2>
        )}

        {activeStep === 2 && (
          <CardV2
            variant="outlined"
            sx={{ "& .MuiCardContent-root": { p: 0 } }}
          >
            <ResultsStep
              result={optimizationResult}
              onNewOptimization={handleNewOptimization}
              onExport={handleExport}
              loading={isOptimizing}
            />
          </CardV2>
        )}
      </Box>

      {/* Detailed Selection Dialog */}
      {selectedCuttingList && (
        <DetailedSelectionDialog
          open={showDetailedSelection}
          onClose={() => {
            console.log(
              "[EnterpriseWizard v2] Dialog closed without selection",
            );
            setShowDetailedSelection(false);
          }}
          cuttingList={selectedCuttingList}
          onConfirm={(items, selectedProfiles) => {
            // DEBUG: Checkpoint 2.1 - Items Transformation
            console.log(
              "[EnterpriseWizard v2] 🔍 Checkpoint 2.1 - Before Transformation:",
              {
                itemsCount: items.length,
                sampleInputItems: items.slice(0, 2).map((item) => ({
                  profile: item.profile,
                  measurement: item.measurement,
                  measurementType: typeof item.measurement,
                  quantity: item.quantity,
                  workOrderId: item.workOrderId,
                })),
                timestamp: Date.now(),
              },
            );

            // Convert selected items to optimization format
            const optimizationItems = items.map((item) => {
              const parsedLength = parseInt(item.measurement);
              const validLength = parsedLength || 0;

              // Validation warnings
              if (!item.profile || item.profile.trim() === "") {
                console.warn(
                  "[EnterpriseWizard v2] ⚠️ Empty profile type for item:",
                  item,
                );
              }
              if (isNaN(parsedLength) || parsedLength <= 0) {
                console.warn(
                  "[EnterpriseWizard v2] ⚠️ Invalid measurement for item:",
                  item,
                  "parsed as:",
                  parsedLength,
                );
              }
              if (!item.quantity || item.quantity <= 0) {
                console.warn(
                  "[EnterpriseWizard v2] ⚠️ Invalid quantity for item:",
                  item,
                );
              }

              return {
                profileType: item.profile,
                length: validLength,
                quantity: item.quantity,
                workOrderId: item.workOrderId,
              };
            });

            // DEBUG: Checkpoint 2.1 - After Transformation
            console.log(
              "[EnterpriseWizard v2] 🔍 Checkpoint 2.1 - After Transformation:",
              {
                optimizationItemsCount: optimizationItems.length,
                sampleTransformedItems: optimizationItems.slice(0, 2),
                totalLengthSum: optimizationItems.reduce(
                  (sum, item) => sum + item.length * item.quantity,
                  0,
                ),
                uniqueWorkOrders: new Set(
                  optimizationItems.map((item) => item.workOrderId),
                ).size,
                timestamp: Date.now(),
              },
            );

            // Auto-populate stock lengths from selected profiles
            const stockLengthsMap: Record<string, readonly number[]> = {};

            Object.entries(selectedProfiles).forEach(
              ([profileType, profile]) => {
                if (profile && profile.stockLengths.length > 0) {
                  stockLengthsMap[profileType] = profile.stockLengths;
                }
              },
            );

            // Merge all stock lengths (unique)
            const allStockLengths = [
              ...new Set(Object.values(stockLengthsMap).flat()),
            ].sort((a, b) => a - b);

            console.log(
              "[EnterpriseWizard v2] 📦 Stock lengths from profiles:",
              {
                profilesCount: Object.keys(stockLengthsMap).length,
                allStockLengths,
                stockLengthsMap,
              },
            );

            // Update params with selected items and stock lengths
            setParams((prev) => {
              const newParams = {
                ...prev,
                items: optimizationItems,
                // Only set stockLengths if we have profiles selected
                ...(allStockLengths.length > 0
                  ? {
                      stockLengths: allStockLengths,
                    }
                  : {}),
              };

              // DEBUG: Checkpoint 2.2 - Params Updated
              console.log(
                "[EnterpriseWizard v2] 🔍 Checkpoint 2.2 - Params State Updated:",
                {
                  itemsCount: newParams.items.length,
                  stockLengthsCount: newParams.stockLengths.length,
                  stockLengths: newParams.stockLengths,
                  algorithm: newParams.algorithm,
                  objectives: newParams.objectives,
                  constraints: newParams.constraints,
                  timestamp: Date.now(),
                },
              );

              return newParams;
            });

            // Close detailed selection dialog
            setShowDetailedSelection(false);

            // Only open stock length config if no profiles were selected
            if (allStockLengths.length === 0) {
              setShowStockLengthConfig(true);
            } else {
              // Auto-navigate to parameters step if profiles selected
              setActiveStep(1);
            }
          }}
          loading={false}
        />
      )}

      {/* Stock Length Configuration Dialog */}
      <StockLengthConfigDialog
        open={showStockLengthConfig}
        onClose={() => {
          console.log(
            "[EnterpriseWizard v2] Stock config dialog closed without confirmation",
          );
          setShowStockLengthConfig(false);
        }}
        initialStockLengths={params.stockLengths}
        onConfirm={(stockLengths) => {
          console.log(
            "[EnterpriseWizard v2] Stock lengths configured:",
            stockLengths,
          );

          // Update params with selected stock lengths
          setParams((prev) => ({
            ...prev,
            stockLengths: [...stockLengths],
          }));

          // Close dialog
          setShowStockLengthConfig(false);

          // Auto-navigate to parameters step
          setActiveStep(1);
        }}
      />
    </Box>
  );
};

export default EnterpriseOptimizationWizard;

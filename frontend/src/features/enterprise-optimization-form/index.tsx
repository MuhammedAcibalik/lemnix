/**
 * @fileoverview Enterprise Optimization Form v2.0 - Modern Multi-Step Design
 * @module EnterpriseOptimizationForm
 * @version 2.0.0 - Design System v2 + Progressive Disclosure
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Stack,
  CircularProgress,
  Backdrop,
  Typography,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Chip,
  alpha,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from "@mui/icons-material";

// Design System v2.0
import { useDesignSystem } from "@/shared/hooks";
import { CardV2, FadeIn, ScaleIn } from "@/shared";

// Local imports
import { EnterpriseOptimizationFormProps } from "./types";
import { useOptimizationForm } from "./hooks/useOptimizationForm";
import { useValidation } from "./hooks/useValidation";
import { useSecurity } from "./hooks/useSecurity";
import {
  transformToOptimizationItems,
  transformToOptimizationFormData,
} from "./utils";
import {
  OptimizationFormData,
  PerformanceSettings,
  OptimizationObjective,
} from "./types";
import { HeaderSection } from "./components/HeaderSection";
import { CuttingListSection } from "./components/CuttingListSection";
import { AlgorithmSection } from "./components/AlgorithmSection";
import { ObjectivesSection } from "./components/ObjectivesSection";
import { CostModelSection } from "./components/CostModelSection"; // ✅ P1-6
import { GAAdvancedSettings } from "./components/GAAdvancedSettings"; // ✅ P1-7

export const EnterpriseOptimizationForm: React.FC<
  EnterpriseOptimizationFormProps
> = ({
  onSubmit,
  isLoading = false,
  initialItems = [],
  replaceItems = false,
}) => {
  const theme = useTheme();
  const ds = useDesignSystem();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  // Accordion state for progressive disclosure
  const [expandedSections, setExpandedSections] = useState<{
    header: boolean;
    items: boolean;
    algorithm: boolean;
    objectives: boolean;
  }>({
    header: true,
    items: true,
    algorithm: false,
    objectives: false,
  });

  // Custom hooks
  const {
    cuttingList,
    params,
    addCuttingItem,
    addSampleItems,
    updateParams,
    updateObjectives,
  } = useOptimizationForm();

  const { errors, isValid } = useValidation(cuttingList, params);
  const { sanitizeString, validateNumericValue, sanitizeFormData } =
    useSecurity();

  // UI state
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  // Handlers
  const handleAddItem = useCallback(() => {
    addCuttingItem();
    setSnackbarMessage("Yeni parça eklendi");
    setSnackbarSeverity("success");
    setShowSnackbar(true);
  }, [addCuttingItem]);

  const handleAddSampleItems = useCallback(() => {
    addSampleItems();
    setSnackbarMessage("Örnek veriler eklendi");
    setSnackbarSeverity("success");
    setShowSnackbar(true);
  }, [addSampleItems]);

  const handleUnitChange = useCallback(
    (unit: "mm" | "cm" | "m") => {
      updateParams({ unit });
    },
    [updateParams],
  );

  const handleAlgorithmChange = useCallback(
    (algorithm: string) => {
      updateParams({
        algorithm: algorithm as "bfd" | "genetic",
      });
    },
    [updateParams],
  );

  const handlePerformanceChange = useCallback(
    (performance: Record<string, unknown>) => {
      updateParams({ performance: performance as PerformanceSettings });
    },
    [updateParams],
  );

  const handleObjectivesChange = useCallback(
    (objectives: Record<string, unknown>[]) => {
      updateObjectives(
        objectives as Array<{
          type:
            | "minimize-waste"
            | "maximize-efficiency"
            | "minimize-cost"
            | "minimize-time"
            | "maximize-quality";
          weight: number;
          priority: "low" | "medium" | "high";
        }>,
      );
    },
    [updateObjectives],
  );

  const handleSubmit = useCallback(() => {
    if (!isValid) {
      setSnackbarMessage("Lütfen tüm gerekli alanları doldurun");
      setSnackbarSeverity("error");
      setShowSnackbar(true);
      return;
    }

    try {
      // Transform data with security validation
      const items = transformToOptimizationItems(
        cuttingList,
        sanitizeString,
        validateNumericValue,
      );

      const formData = transformToOptimizationFormData(
        items,
        params,
        validateNumericValue,
      );

      onSubmit(formData);
      setSnackbarMessage("Optimizasyon başlatıldı");
      setSnackbarSeverity("success");
      setShowSnackbar(true);
    } catch (error) {
      console.error("Submit error:", error);
      setSnackbarMessage("Optimizasyon başlatılırken hata oluştu");
      setSnackbarSeverity("error");
      setShowSnackbar(true);
    }
  }, [
    isValid,
    cuttingList,
    params,
    onSubmit,
    sanitizeFormData,
    sanitizeString,
    validateNumericValue,
  ]);

  // Toggle section expansion
  const toggleSection = useCallback(
    (section: keyof typeof expandedSections) => {
      setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    },
    [],
  );

  // Calculate form completion
  const formCompletion = useMemo(() => {
    let completed = 0;
    const total = 4;

    if (cuttingList.length > 0) completed++;
    if (params.algorithm) completed++;
    if (params.objectives) completed++;
    if (isValid) completed++;

    return Math.round((completed / total) * 100);
  }, [cuttingList, params, isValid]);

  return (
    <Box
      sx={{
        maxWidth: isMobile ? "100%" : 1200,
        mx: "auto",
        p: ds.spacing["6"],
        minHeight: "100vh",
      }}
    >
      {/* Modern Header with Progress */}
      <FadeIn>
        <CardV2
          variant="glass"
          sx={{ mb: ds.spacing["4"], overflow: "visible" }}
        >
          <Box sx={{ p: ds.spacing["6"] }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={ds.spacing["3"]}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "1.875rem",
                    fontWeight: 800,
                    background: ds.gradients.primary,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: ds.spacing["1"],
                  }}
                >
                  Akıllı Kesim Optimizasyonu
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: ds.colors.text.secondary,
                  }}
                >
                  Profil kesim planlama sistemi
                </Typography>
              </Box>

              {/* Completion Badge */}
              <Chip
                icon={
                  formCompletion === 100 ? <CheckIcon /> : <UncheckedIcon />
                }
                label={`%${formCompletion} Tamamlandı`}
                color={formCompletion === 100 ? "success" : "default"}
                sx={{
                  height: 36,
                  fontWeight: 600,
                  borderRadius: `${ds.borderRadius.lg}px`,
                }}
              />
            </Stack>

            {/* Progress Bar */}
            <LinearProgress
              variant="determinate"
              value={formCompletion}
              sx={{
                height: 6,
                borderRadius: `${ds.borderRadius.sm}px`,
                backgroundColor: alpha(ds.colors.primary.main, 0.1),
                "& .MuiLinearProgress-bar": {
                  borderRadius: `${ds.borderRadius.sm}px`,
                  background: ds.gradients.primary,
                },
              }}
            />
          </Box>
        </CardV2>
      </FadeIn>

      {/* Modern Accordion Sections */}
      <Stack spacing={ds.spacing["3"]}>
        {/* Section 1: Kesim Listesi */}
        <ScaleIn delay={0.1}>
          <Accordion
            expanded={expandedSections.items}
            onChange={() => toggleSection("items")}
            sx={{
              borderRadius: `${ds.borderRadius.lg}px !important`,
              background: ds.glass.background,
              border: ds.glass.border,
              backdropFilter: ds.glass.backdropFilter,
              boxShadow: ds.shadows.soft.md,
              "&:before": { display: "none" },
              "&.Mui-expanded": {
                boxShadow: ds.shadows.soft.lg,
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                minHeight: 72,
                "& .MuiAccordionSummary-content": {
                  my: ds.spacing["3"],
                  alignItems: "center",
                  gap: ds.spacing["2"],
                },
              }}
            >
              <Chip
                label="1"
                size="small"
                color="primary"
                sx={{
                  fontWeight: 700,
                  minWidth: 32,
                  borderRadius: `${ds.borderRadius.sm}px`,
                }}
              />
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>
                  Kesim Listesi
                </Typography>
                <Typography
                  sx={{ fontSize: "0.75rem", color: ds.colors.text.secondary }}
                >
                  {cuttingList.length} parça eklendi
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: ds.spacing["4"] }}>
              <CuttingListSection
                cuttingList={cuttingList}
                unit={params.unit}
                onAddItem={handleAddItem}
                onAddSampleItems={handleAddSampleItems}
                onUnitChange={handleUnitChange}
                errors={errors as Record<string, string>}
              />
            </AccordionDetails>
          </Accordion>
        </ScaleIn>

        {/* Section 2: Algorithm Selection */}
        <ScaleIn delay={0.2}>
          <Accordion
            expanded={expandedSections.algorithm}
            onChange={() => toggleSection("algorithm")}
            sx={{
              borderRadius: `${ds.borderRadius.lg}px !important`,
              background: ds.glass.background,
              border: ds.glass.border,
              backdropFilter: ds.glass.backdropFilter,
              boxShadow: ds.shadows.soft.md,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                minHeight: 72,
                "& .MuiAccordionSummary-content": {
                  my: ds.spacing["3"],
                  alignItems: "center",
                  gap: ds.spacing["2"],
                },
              }}
            >
              <Chip
                label="2"
                size="small"
                color="primary"
                sx={{
                  fontWeight: 700,
                  minWidth: 32,
                  borderRadius: `${ds.borderRadius.sm}px`,
                }}
              />
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>
                  Algoritma Seçimi
                </Typography>
                <Typography
                  sx={{ fontSize: "0.75rem", color: ds.colors.text.secondary }}
                >
                  {params.algorithm
                    ? `${params.algorithm.toUpperCase()} seçildi`
                    : "Algoritma seç"}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: ds.spacing["4"] }}>
              <AlgorithmSection
                algorithm={params.algorithm}
                onAlgorithmChange={handleAlgorithmChange}
                itemCount={cuttingList.reduce<number>(
                  (sum, item) =>
                    sum +
                    (typeof item.quantity === "number" ? item.quantity : 0),
                  0,
                )}
                performanceSettings={params.performance as PerformanceSettings}
                onPerformanceSettingsChange={(
                  settings: PerformanceSettings,
                ) => {
                  handlePerformanceChange(
                    settings as unknown as Record<string, unknown>,
                  );
                }}
              />
            </AccordionDetails>
          </Accordion>
        </ScaleIn>

        {/* Section 3: Objectives (Conditional for Genetic) */}
        {params.algorithm === "genetic" && (
          <ScaleIn delay={0.3}>
            <Accordion
              expanded={expandedSections.objectives}
              onChange={() => toggleSection("objectives")}
              sx={{
                borderRadius: `${ds.borderRadius.lg}px !important`,
                background: ds.glass.background,
                border: ds.glass.border,
                backdropFilter: ds.glass.backdropFilter,
                boxShadow: ds.shadows.soft.md,
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  minHeight: 72,
                  "& .MuiAccordionSummary-content": {
                    my: ds.spacing["3"],
                    alignItems: "center",
                    gap: ds.spacing["2"],
                  },
                }}
              >
                <Chip
                  label="3"
                  size="small"
                  color="primary"
                  sx={{
                    fontWeight: 700,
                    minWidth: 32,
                    borderRadius: `${ds.borderRadius.sm}px`,
                  }}
                />
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>
                    Hedef Optimizasyonlar
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: ds.colors.text.secondary,
                    }}
                  >
                    Çoklu hedef dengesi
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: ds.spacing["4"] }}>
                {/*
                  Kök neden analizi:
                  Lint hatasına göre <ObjectivesSection>'un `onChange` prop tipi `(objectives: readonly OptimizationObjective[]) => void` yani salt okunur bir dizi bekliyor.
                  Ancak handleObjectivesChange fonksiyonu parametresini Record<string, unknown>[] olarak (ve/veya mutable array olarak) tanımlamış.
                  Bu, TypeScript'in strict type safety (Liskov, OCP, ISP, DIP) prensipleriyle çelişir ve runtime bug riskine yol açar.
                */}
                <ObjectivesSection
                  objectives={
                    params.objectives as readonly OptimizationObjective[]
                  } // isteğe bağlı: typesafety için validate edilmeli
                  onChange={(objectives: readonly OptimizationObjective[]) => {
                    // Adapter: solid prensiplerine uygun, Input türü ile forward edilir
                    // params.objectives mutable ise, readonly array'i mutable'a kopyalamak gerekir
                    updateParams({ objectives: [...objectives] });
                  }}
                  readonly={isLoading}
                />
                {/* ✅ P1-6: Cost Model Configuration */}
                <ScaleIn delay={0.4}>
                  <CostModelSection
                    costModel={params.costModel}
                    onChange={(costModel) => updateParams({ costModel })}
                    readonly={isLoading}
                  />
                </ScaleIn>
              </AccordionDetails>
            </Accordion>
          </ScaleIn>
        )}

        {/* ✅ P1-7: GA Advanced Settings (Only for Genetic Algorithm) */}
        {params.algorithm === "genetic" && (
          <ScaleIn delay={0.5}>
            {params.performance && (
              <GAAdvancedSettings
                settings={params.performance}
                onChange={(performance) => updateParams({ performance })}
                readonly={isLoading}
              />
            )}
          </ScaleIn>
        )}
      </Stack>

      {/* Modern Sticky Submit Button */}
      <Box mt={ds.spacing["6"]}>
        <CardV2
          variant="elevated"
          sx={{ position: "sticky", bottom: ds.spacing["4"], zIndex: 10 }}
        >
          <Box sx={{ p: ds.spacing["4"] }}>
            <Stack
              direction="row"
              justifyContent="center"
              spacing={ds.spacing["2"]}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={!isValid || isLoading}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PlayIcon />
                  )
                }
                sx={{
                  minWidth: isMobile ? "100%" : 280,
                  height: 56,
                  fontSize: "1rem",
                  fontWeight: 700,
                  background: ds.gradients.primary,
                  boxShadow: ds.shadows.soft.md,
                  borderRadius: `${ds.borderRadius.lg}px`,
                  transition: ds.transitions.base,
                  "&:hover": {
                    background: ds.gradients.primary.soft,
                    boxShadow: ds.shadows.soft.lg,
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background: alpha(ds.colors.neutral[400], 0.3),
                    color: ds.colors.neutral[500],
                  },
                }}
              >
                {isLoading
                  ? "Optimizasyon Yapılıyor..."
                  : "Optimizasyonu Başlat"}
              </Button>
            </Stack>

            {/* Info text */}
            {params.algorithm === "genetic" && !isLoading && (
              <Typography
                sx={{
                  mt: ds.spacing["2"],
                  display: "block",
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: ds.colors.text.secondary,
                }}
              >
                Genetic Algorithm v1.7.1 • Tahmini: ~
                {Math.ceil(
                  ((params.performance?.populationSize || 30) *
                    (params.performance?.generations || 75)) /
                    1000,
                )}
                s
              </Typography>
            )}
          </Box>
        </CardV2>
      </Box>

      {/* Modern Loading Backdrop */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: alpha(ds.colors.neutral[900], 0.85),
          backdropFilter: "blur(12px)",
        }}
        open={isLoading}
      >
        <CardV2
          variant="glass"
          sx={{ p: ds.spacing["8"], textAlign: "center", minWidth: 320 }}
        >
          <CircularProgress
            size={72}
            thickness={4}
            sx={{
              mb: ds.spacing["4"],
              color: ds.colors.primary.main,
            }}
          />
          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 700,
              mb: ds.spacing["2"],
              color: ds.colors.text.primary,
            }}
          >
            Optimizasyon Yapılıyor...
          </Typography>
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: ds.colors.text.secondary,
            }}
          >
            Lütfen bekleyin, bu işlem biraz zaman alabilir.
          </Typography>
        </CardV2>
      </Backdrop>

      {/* Modern Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            borderRadius: `${ds.borderRadius.lg}px`,
            boxShadow: ds.shadows.soft.lg,
            fontWeight: 600,
            "& .MuiAlert-message": {
              fontSize: "0.875rem",
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnterpriseOptimizationForm;

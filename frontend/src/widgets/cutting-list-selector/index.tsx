/**
 * @fileoverview CuttingListSelector - Main Component v2.0
 * @module CuttingListSelector
 * @version 2.0.0 - Design System v2 Compliant
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Stack,
  Alert,
  CircularProgress,
  alpha,
  Chip,
  LinearProgress,
  Backdrop,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";

// Design System v2.0
import { useDesignSystem } from "@/shared/hooks";
import { CardV2, FadeIn, ScaleIn } from "@/shared";

// Import modular components
import { SearchControls } from "./components/SearchControls";
import { SelectionSummary } from "./components/SelectionSummary";
import { ProductGroupSection } from "./components/ProductGroupSection";
import { FilterControls } from "./components/FilterControls";

// Import hooks
import { useSelectionState } from "./hooks/useSelectionState";

// Import types
import { CuttingListSelectorProps, FilterState, ExpandedState } from "./types";
import type { OptimizationItem } from "@/entities/optimization/model/types";
import {
  CuttingListProduct,
  CuttingListSection,
  CuttingListItem,
} from "@/shared/lib/services/cuttingListOptimizationService";

// Import constants
import { textContent, stylingConstants } from "./constants";

/**
 * CuttingListSelector Component
 *
 * Enterprise-grade cutting list selection with modular architecture
 */
export const CuttingListSelector: React.FC<CuttingListSelectorProps> = ({
  cuttingList,
  onSelectionChange,
  onConversionComplete,
  isConverting = false,
}) => {
  const ds = useDesignSystem();

  // Custom hooks
  const {
    selectionState,
    updateSelection,
    resetSelection,
    validateSelection,
    selectionStats,
    validationResult,
    initializeSelectionState,
  } = useSelectionState(cuttingList);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    showSelectedOnly: false,
    showWorkOrdersOnly: false,
    profileType: "",
    searchTerm: "",
  });
  const [expandedState, setExpandedState] = useState<ExpandedState>({
    products: {},
    workOrders: {},
  });

  // Initialize selection state
  useEffect(() => {
    initializeSelectionState();
  }, [initializeSelectionState]);

  // Handle search change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setFilters((prev) => ({ ...prev, searchTerm: term }));
  };

  // Handle filter change
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Handle expansion toggle
  const handleExpansionToggle = (
    type: "products" | "workOrders",
    id: string,
  ) => {
    setExpandedState((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: !prev[type][id],
      },
    }));
  };

  // Handle conversion
  const handleConversion = () => {
    if (validationResult.isValid) {
      // Convert selection to optimization items
      const selectedItems = convertSelectionToOptimizationItems();
      onConversionComplete({
        success: true,
        items: selectedItems,
        errors: [],
        warnings: [],
        statistics: {
          totalSections: cuttingList.sections?.length || 0,
          totalItems: selectionStats.totalItems,
          totalProfiles: selectionStats.selectedProfiles,
          convertedItems: selectedItems.length,
          failedConversions: 0,
          totalLength: selectionStats.selectedLength,
          totalQuantity: selectedItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
          ),
          averageLength:
            selectedItems.length > 0
              ? selectionStats.selectedLength / selectedItems.length
              : 0,
          processingTime: 0,
        },
      });
    }
  };

  // Convert selection to optimization items
  const convertSelectionToOptimizationItems = () => {
    const items: OptimizationItem[] = [];

    (cuttingList.products || []).forEach((product: CuttingListProduct) => {
      product.sections.forEach((section: CuttingListSection) => {
        section.items.forEach((item: CuttingListItem) => {
          const isSelected =
            selectionState.products[product.id]?.workOrders[section.id]
              ?.profiles[item.id];
          if (isSelected) {
            const profileType = item.profiles[0]?.profile || "";
            const length = item.profiles.reduce(
              (sum, p) => sum + (parseFloat(p.measurement) || 0),
              0,
            );
            const quantity = item.profiles.reduce(
              (sum, p) => sum + p.quantity,
              0,
            );
            items.push({
              id: item.id as any, // ID branded type conversion
              workOrderId: item.workOrderId,
              profileType,
              length,
              quantity,
            });
          }
        });
      });
    });

    return items;
  };

  // Calculate selection progress
  const selectionProgress = useMemo(() => {
    if (selectionStats.totalItems === 0) return 0;
    return Math.round(
      (selectionStats.selectedItems / selectionStats.totalItems) * 100,
    );
  }, [selectionStats]);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Modern Hero Header with Progress - Ana sayfa stili */}
      <FadeIn>
        <CardV2
          variant="glass"
          sx={{ mb: ds.spacing["4"], overflow: "visible" }}
        >
          <Box sx={{ p: ds.spacing["6"] }}>
            {/* Header with Stats Badges */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={ds.spacing["3"]}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    background: ds.gradients.primary,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: ds.spacing["1"],
                    lineHeight: 1.2,
                  }}
                >
                  {textContent.header.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.9375rem",
                    color: ds.colors.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  {textContent.header.subtitle}
                </Typography>
              </Box>

              {/* Quick Stats Badges */}
              <Stack direction="row" spacing={ds.spacing["2"]}>
                <Chip
                  icon={<InventoryIcon sx={{ fontSize: 16 }} />}
                  label={`${selectionStats.totalItems} Toplam`}
                  sx={{
                    height: 32,
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    background: alpha(ds.colors.primary.main, 0.1),
                    color: ds.colors.primary.main,
                    border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                    borderRadius: `${ds.borderRadius.md}px`,
                  }}
                />
                <Chip
                  icon={<AssignmentIcon sx={{ fontSize: 16 }} />}
                  label={`${selectionStats.selectedItems} Seçili`}
                  sx={{
                    height: 32,
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    background: alpha(ds.colors.success.main, 0.1),
                    color: ds.colors.success.main,
                    border: `1px solid ${alpha(ds.colors.success.main, 0.2)}`,
                    borderRadius: `${ds.borderRadius.md}px`,
                  }}
                />
              </Stack>
            </Stack>

            {/* Progress Bar with Completion Badge */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={ds.spacing["2"]}
            >
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={selectionProgress}
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
              <Chip
                icon={
                  selectionProgress === 100 ? <CheckIcon /> : <UncheckedIcon />
                }
                label={`%${selectionProgress}`}
                size="small"
                color={selectionProgress === 100 ? "success" : "default"}
                sx={{
                  fontWeight: 700,
                  minWidth: 70,
                }}
              />
            </Stack>
          </Box>
        </CardV2>
      </FadeIn>

      {/* Modern Search and Filter Controls */}
      <ScaleIn delay={0.1}>
        <Grid container spacing={ds.spacing["3"]} sx={{ mb: ds.spacing["4"] }}>
          <Grid item xs={12} md={8}>
            <SearchControls
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              totalItems={selectionStats.totalItems}
              selectedItems={selectionStats.selectedItems}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FilterControls
              filters={filters}
              onFilterChange={handleFilterChange}
              availableProfileTypes={[]} // TODO: Extract from cuttingList
            />
          </Grid>
        </Grid>
      </ScaleIn>

      {/* Selection Summary */}
      <SelectionSummary
        selectionState={selectionState}
        onClearSelection={resetSelection}
        onSelectAll={() => {}} // TODO: Implement
        onConvertSelection={handleConversion}
        isConverting={isConverting}
      />

      {/* Modern Validation Results */}
      {!validationResult.isValid && (
        <ScaleIn delay={0.2}>
          <Alert
            severity="error"
            sx={{
              mb: ds.spacing["4"],
              borderRadius: `${ds.borderRadius.lg}px`,
              boxShadow: ds.shadows.soft.md,
              border: `1px solid ${alpha(ds.colors.error.main, 0.2)}`,
            }}
          >
            <Typography
              sx={{ fontWeight: 700, mb: ds.spacing["2"], fontSize: "1rem" }}
            >
              ⚠️ Seçim Hatası
            </Typography>
            <Stack spacing={ds.spacing["1"]}>
              {validationResult.errors.map((error, index) => (
                <Typography
                  key={index}
                  sx={{ fontSize: "0.875rem", pl: ds.spacing["2"] }}
                >
                  • {error}
                </Typography>
              ))}
            </Stack>
          </Alert>
        </ScaleIn>
      )}

      {validationResult.warnings.length > 0 && (
        <ScaleIn delay={0.3}>
          <Alert
            severity="warning"
            sx={{
              mb: ds.spacing["4"],
              borderRadius: `${ds.borderRadius.lg}px`,
              boxShadow: ds.shadows.soft.md,
              border: `1px solid ${alpha(ds.colors.warning.main, 0.2)}`,
            }}
          >
            <Typography
              sx={{ fontWeight: 700, mb: ds.spacing["2"], fontSize: "1rem" }}
            >
              💡 Dikkat
            </Typography>
            <Stack spacing={ds.spacing["1"]}>
              {validationResult.warnings.map((warning, index) => (
                <Typography
                  key={index}
                  sx={{ fontSize: "0.875rem", pl: ds.spacing["2"] }}
                >
                  • {warning}
                </Typography>
              ))}
            </Stack>
          </Alert>
        </ScaleIn>
      )}

      {/* Product Groups */}
      <Stack spacing={ds.spacing["3"]}>
        {(cuttingList.products || []).map((product: CuttingListProduct) => (
          <ProductGroupSection
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              sections: product.sections,
            }}
            selectionState={selectionState}
            searchTerm={searchTerm}
            isExpanded={expandedState.products[product.id] || false}
            onToggleExpansion={(id) => handleExpansionToggle("products", id)}
            onProductSelectionChange={() => {}} // TODO: Implement
            onWorkOrderSelectionChange={() => {}} // TODO: Implement
            onProfileSelectionChange={() => {}} // TODO: Implement
          />
        ))}
      </Stack>

      {/* Modern Loading Backdrop - Ana sayfa stili */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: alpha(ds.colors.neutral[900], 0.85),
          backdropFilter: "blur(12px)",
        }}
        open={isConverting}
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
            {textContent.conversion.inProgress}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: ds.colors.text.secondary,
            }}
          >
            Seçiminiz optimizasyon için hazırlanıyor...
          </Typography>
        </CardV2>
      </Backdrop>
    </Box>
  );
};

export default CuttingListSelector;

/**
 * Stock Length Accordion Component
 * Expandable/collapsible UI for stock length groups in optimization results
 *
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React, { useState, useMemo } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
  Chip,
  Box,
  alpha,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Inventory as InventoryIcon,
  Recycling as RecyclingIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { CuttingPlanDataGrid } from "./CuttingPlanDataGrid";
import type { BackendCut } from "./utils";

interface StockLengthAccordionProps {
  readonly stockLength: number;
  readonly algorithm?: string;
  readonly count: number;
  readonly totalWaste: number;
  readonly cuts: ReadonlyArray<BackendCut>;
  readonly efficiency?: number;
}

/**
 * Stock Length Accordion Component
 * Shows stock length group with expandable details
 */
export const StockLengthAccordion: React.FC<StockLengthAccordionProps> = ({
  stockLength,
  algorithm = "Unknown",
  count,
  totalWaste,
  cuts,
  efficiency = 0,
}) => {
  const ds = useDesignSystem();
  const [expanded, setExpanded] = useState(false);

  // Calculate metrics
  const totalStockLength = stockLength * count;
  const wastePercentage =
    totalStockLength > 0 ? (totalWaste / totalStockLength) * 100 : 0;
  const avgWastePerStock = count > 0 ? totalWaste / count : 0;

  // Determine color scheme based on waste percentage
  const getWasteColor = (percentage: number) => {
    if (percentage < 5) return "success";
    if (percentage < 10) return "warning";
    return "error";
  };

  const getEfficiencyColor = (eff: number) => {
    if (eff >= 95) return "success";
    if (eff >= 90) return "warning";
    return "error";
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  // Memoize the mapped plans to prevent unnecessary re-renders
  const mappedPlans = useMemo(() => {
    return cuts.map((cut, idx) => {
      // Extract unique work orders from segments
      const workOrderIds = Array.from(
        new Set(
          cut.segments
            .map((s) => s.workOrderId)
            .filter((id) => id && id !== "N/A" && id !== ""),
        ),
      );

      // Use first work order ID if available
      const displayWorkOrder =
        workOrderIds.length > 0 ? workOrderIds[0] || "N/A" : "N/A";

      return {
        stockLength: cut.stockLength,
        planId: cut.id || `cut-${idx}`,
        workOrderId: displayWorkOrder,
        algorithm: algorithm,
        stockCount: 1,
        totalPieces: cut.segmentCount,
        efficiency:
          cut.stockLength > 0
            ? ((cut.stockLength - cut.remainingLength) / cut.stockLength) * 100
            : 0,
        totalWaste: cut.remainingLength,
        cuts: [
          {
            cutId: cut.id || `cut-${idx}`,
            segments: cut.segments.map((s) => ({
              length: s.length,
              quantity: s.quantity || 1,
              workOrderId: s.workOrderId,
              profileType: s.profileType,
            })),
            waste: cut.remainingLength,
            efficiency:
              cut.stockLength > 0
                ? ((cut.stockLength - cut.remainingLength) / cut.stockLength) *
                  100
                : 0,
          },
        ],
      };
    });
  }, [cuts, algorithm, efficiency]);

  return (
    <Accordion
      expanded={expanded}
      onChange={handleToggle}
      sx={{
        mb: ds.spacing["2"],
        "&:before": { display: "none" }, // Remove default border
        boxShadow: 1,
        borderRadius: ds.borderRadius.md,
        overflow: "hidden",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: ds.colors.background.paper,
          px: ds.spacing["4"],
          py: ds.spacing["3"],
          "&:hover": {
            backgroundColor: alpha(ds.colors.primary.main, 0.04),
          },
          "&.Mui-expanded": {
            backgroundColor: alpha(ds.colors.primary.main, 0.08),
          },
        }}
      >
        <Stack
          direction="row"
          spacing={ds.spacing["3"]}
          alignItems="center"
          width="100%"
        >
          {/* Stock Length Label */}
          <Box
            sx={{ display: "flex", alignItems: "center", gap: ds.spacing["2"] }}
          >
            <InventoryIcon
              sx={{ color: ds.colors.primary.main, fontSize: 20 }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: ds.colors.text.primary }}
            >
              {stockLength.toLocaleString()}mm Profiller
            </Typography>
          </Box>

          {/* Count Chip */}
          <Chip
            label={`${count} adet`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />

          {/* Waste Metrics */}
          <Chip
            label={`Fire: ${totalWaste.toFixed(0)}mm (${wastePercentage.toFixed(1)}%)`}
            color={getWasteColor(wastePercentage)}
            size="small"
            variant="filled"
            sx={{
              fontWeight: 500,
              backgroundColor:
                getWasteColor(wastePercentage) === "success"
                  ? ds.colors.success[300]
                  : getWasteColor(wastePercentage) === "warning"
                    ? ds.colors.warning[300]
                    : ds.colors.error[300],
              color:
                getWasteColor(wastePercentage) === "success"
                  ? ds.colors.success[700]
                  : getWasteColor(wastePercentage) === "warning"
                    ? ds.colors.warning[700]
                    : ds.colors.error[700],
            }}
          />

          {/* Efficiency (if provided) */}
          {efficiency > 0 && (
            <Chip
              label={`Verimlilik: ${efficiency.toFixed(1)}%`}
              color={getEfficiencyColor(efficiency)}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          )}

          {/* Average waste per stock */}
          <Typography
            variant="body2"
            sx={{
              color: ds.colors.text.secondary,
              ml: "auto",
              fontStyle: "italic",
            }}
          >
            Ortalama: {avgWastePerStock.toFixed(0)}mm/profil
          </Typography>
        </Stack>
      </AccordionSummary>

      <AccordionDetails
        sx={{ p: 0, backgroundColor: ds.colors.background.default }}
      >
        {/* Detailed cutting plan table */}
        <Box sx={{ p: ds.spacing["4"] }}>
          <Typography
            variant="subtitle1"
            sx={{ mb: ds.spacing["3"], fontWeight: 600 }}
          >
            Kesim Planı Detayları
          </Typography>
          <CuttingPlanDataGrid plans={mappedPlans} />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

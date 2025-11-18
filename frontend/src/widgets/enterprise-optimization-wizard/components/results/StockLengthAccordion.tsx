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
  Grid,
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
        mb: ds.spacing["3"],
        "&:before": { display: "none" }, // Remove default border
        boxShadow: expanded ? ds.shadows.soft.lg : ds.shadows.soft.sm,
        borderRadius: `${ds.borderRadius.lg}px !important`,
        border: `1px solid ${expanded ? ds.colors.primary.main : ds.colors.neutral[200]}`,
        overflow: "hidden",
        transition: ds.transitions.base,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: expanded ? `${ds.colors.primary.main}08` : ds.colors.background.paper,
          px: ds.spacing["4"],
          py: ds.spacing["2"],
          minHeight: 64,
          "&:hover": {
            backgroundColor: expanded ? `${ds.colors.primary.main}12` : ds.colors.neutral[50],
          },
          "&.Mui-expanded": {
            minHeight: 64,
            borderBottom: `1px solid ${ds.colors.neutral[200]}`,
          },
          "& .MuiAccordionSummary-content": {
            my: ds.spacing["1"],
          },
        }}
      >
        <Grid container alignItems="center" spacing={2}>
          {/* Stock Length Label */}
          <Grid item xs={12} sm={4} md={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: ds.spacing["2"] }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: "50%",
                  backgroundColor: `${ds.colors.primary.main}15`,
                  color: ds.colors.primary.main,
                  display: "flex",
                }}
              >
                <InventoryIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: ds.colors.text.primary, lineHeight: 1.2 }}
                >
                  {stockLength.toLocaleString()}mm
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {count} adet stok
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Waste Metrics */}
          <Grid item xs={12} sm={4} md={3}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                TOPLAM FİRE
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={
                    wastePercentage < 10 ? ds.colors.success.main : ds.colors.warning.main
                  }
                >
                  {totalWaste.toFixed(0)}mm
                </Typography>
                <Chip
                  label={`%${wastePercentage.toFixed(1)}`}
                  size="small"
                  color={getWasteColor(wastePercentage)}
                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Grid>

          {/* Efficiency */}
          <Grid item xs={12} sm={4} md={3}>
            {efficiency > 0 && (
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  VERİMLİLİK
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={getEfficiencyColor(efficiency)}
                  >
                    %{efficiency.toFixed(1)}
                  </Typography>
                  <SpeedIcon
                    sx={{
                      fontSize: 16,
                      color:
                        getEfficiencyColor(efficiency) === "success"
                          ? ds.colors.success.main
                          : ds.colors.warning.main,
                    }}
                  />
                </Box>
              </Box>
            )}
          </Grid>

          {/* Average */}
          <Grid item xs={12} sm={12} md={3} sx={{ textAlign: { xs: "left", md: "right" } }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Ortalama Fire
            </Typography>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {avgWastePerStock.toFixed(0)}mm / stok
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        <Box sx={{ p: ds.spacing["4"], backgroundColor: ds.colors.neutral[50] }}>
          <CuttingPlanDataGrid plans={mappedPlans} />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

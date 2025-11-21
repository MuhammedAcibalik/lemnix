/**
 * @fileoverview Cutting Plan Table Component
 * @module CuttingPlanTable
 * @version 1.0.0
 */

import React, { useMemo } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Alert,
  AlertTitle,
  Box,
  Typography,
  Chip,
  Stack,
  alpha,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Recycling as RecyclingIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { WorkOrderRow } from "./WorkOrderRow";
import { WorkOrder, Cut, OptimizationResult } from "../../types";
import { useDesignSystem, useAdaptiveUIContext } from "@/shared/hooks";

interface CuttingPlanTableProps {
  aggregatedWorkOrders: WorkOrder[];
  expandedWorkOrder: string | null;
  onWorkOrderClick: (workOrderId: string) => void;
  onCuttingPlanDetails?: (stock: Cut) => void;
  getAlgorithmProfile: (algorithm?: string) => {
    icon: React.ReactNode;
    label: string;
  };
  result?: OptimizationResult | null;
}

export const CuttingPlanTable: React.FC<CuttingPlanTableProps> = ({
  aggregatedWorkOrders,
  expandedWorkOrder,
  onWorkOrderClick,
  onCuttingPlanDetails,
  getAlgorithmProfile,
  result,
}) => {
  const ds = useDesignSystem();
  const { device, tokens } = useAdaptiveUIContext();

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!result || !aggregatedWorkOrders.length) return null;

    // Get first work order's stock length (assuming all have same stock length)
    const firstWorkOrder = aggregatedWorkOrders[0];
    const stockLength = firstWorkOrder.cuts?.[0]?.stockLength || 0;
    const totalStock = aggregatedWorkOrders.reduce(
      (sum, wo) => sum + wo.stockCount,
      0,
    );

    // Calculate total waste across all work orders
    const totalWaste = aggregatedWorkOrders.reduce(
      (sum, wo) => sum + (wo.totalWaste || 0),
      0,
    );

    // Calculate total stock length
    const totalStockLength = totalStock * stockLength;

    // Calculate waste percentage
    const wastePercentage =
      totalStockLength > 0 ? (totalWaste / totalStockLength) * 100 : 0;

    // Calculate efficiency
    const totalEfficiency =
      aggregatedWorkOrders.length > 0
        ? aggregatedWorkOrders.reduce(
            (sum, wo) => sum + (wo.efficiency || 0),
            0,
          ) / aggregatedWorkOrders.length
        : 0;

    // Calculate average waste per stock
    const avgWastePerStock = totalStock > 0 ? totalWaste / totalStock : 0;

    return {
      stockLength,
      totalStock,
      totalWaste,
      wastePercentage,
      efficiency: totalEfficiency,
      avgWastePerStock,
    };
  }, [result, aggregatedWorkOrders]);

  return (
    <Box>
      {/* Summary Metrics Bar */}
      {summaryMetrics && (
        <Paper
          sx={{
            mb: tokens.spacing.sm,
            p: {
              xs: tokens.spacing.sm,
              md: tokens.spacing.md,
            },
            background: ds.colors.background.paper,
            border: `1px solid ${alpha(ds.colors.neutral[200], 0.5)}`,
            borderRadius: `${tokens.borderRadius.lg}px`,
            boxShadow: ds.shadows.soft.sm,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: tokens.spacing.sm, sm: tokens.spacing.md }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            flexWrap="wrap"
          >
            {/* Stock Length & Count */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: tokens.spacing.sm,
              }}
            >
              <Box
                sx={{
                  p: tokens.spacing.sm,
                  borderRadius: `${tokens.borderRadius.md}px`,
                  background: alpha(ds.colors.primary.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <InventoryIcon
                  sx={{
                    fontSize: tokens.components.icon.md,
                    color: ds.colors.primary.main,
                  }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.base}px`,
                    fontWeight: ds.typography.fontWeight.bold,
                    color: ds.colors.text.primary,
                    lineHeight: 1.2,
                  }}
                >
                  {summaryMetrics.stockLength.toLocaleString()}mm
                </Typography>
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.text.secondary,
                    fontWeight: ds.typography.fontWeight.medium,
                  }}
                >
                  {summaryMetrics.totalStock} adet stok
                </Typography>
              </Box>
            </Box>

            {/* Total Waste */}
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
                  fontWeight: ds.typography.fontWeight.semibold,
                  color: ds.colors.text.secondary,
                }}
              >
                TOPLAM FİRE
              </Typography>
              <Typography
                sx={{
                  fontSize: `${tokens.typography.lg}px`,
                  fontWeight: ds.typography.fontWeight.bold,
                  color: ds.colors.success.main,
                }}
              >
                {summaryMetrics.totalWaste.toLocaleString()}mm
              </Typography>
              <Chip
                label={`%${summaryMetrics.wastePercentage.toFixed(1)}`}
                size="small"
                sx={{
                  height: tokens.components.button.sm,
                  fontSize: `${tokens.typography.xs}px`,
                  fontWeight: ds.typography.fontWeight.semibold,
                  backgroundColor: ds.colors.success.main,
                  color: "white",
                }}
              />
            </Box>

            {/* Efficiency */}
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
                  fontWeight: ds.typography.fontWeight.semibold,
                  color: ds.colors.text.secondary,
                }}
              >
                VERİMLİLİK
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.spacing.xs,
                }}
              >
                <CheckCircleIcon
                  sx={{
                    fontSize: tokens.components.icon.md,
                    color: ds.colors.success.main,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.lg}px`,
                    fontWeight: ds.typography.fontWeight.bold,
                    color: ds.colors.success.main,
                  }}
                >
                  %{summaryMetrics.efficiency.toFixed(1)}
                </Typography>
              </Box>
            </Box>

            {/* Average Waste */}
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
                  fontWeight: ds.typography.fontWeight.semibold,
                  color: ds.colors.text.secondary,
                }}
              >
                Ortalama Fire
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.spacing.xs,
                }}
              >
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.base}px`,
                    fontWeight: ds.typography.fontWeight.bold,
                    color: ds.colors.text.primary,
                  }}
                >
                  {Math.round(summaryMetrics.avgWastePerStock)}mm / stok
                </Typography>
                <TrendingUpIcon
                  sx={{
                    fontSize: tokens.components.icon.sm,
                    color: ds.colors.warning.main,
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </Paper>
      )}

      <TableContainer
        component={Paper}
        sx={{
          background: ds.colors.background.paper,
          border: `1px solid ${alpha(ds.colors.neutral[200], 0.5)}`,
          borderRadius: `${tokens.borderRadius.lg}px`,
          boxShadow: ds.shadows.soft.md,
          overflow: "auto",
          maxWidth: "100%",
        }}
      >
        <Table
          sx={{
            tableLayout: "fixed",
            minWidth: { xs: "600px", md: "100%" },
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                background: alpha(ds.colors.primary.main, 0.05),
                position: "relative",
                zIndex: 2,
              }}
            >
              <TableCell
                sx={{
                  width: "16%",
                  textAlign: "center",
                  fontWeight: ds.typography.fontWeight.bold,
                  color: ds.colors.primary.main,
                  fontSize: {
                    xs: `${tokens.typography.xs}px`,
                    md: `${tokens.typography.sm}px`,
                  },
                  py: {
                    xs: tokens.spacing.sm,
                    md: tokens.spacing.md,
                  },
                  borderBottom: `2px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                }}
              >
                İŞ EMRİ
              </TableCell>
              <TableCell
                sx={{
                  width: "14%",
                  textAlign: "center",
                  fontWeight: ds.typography.fontWeight.bold,
                  color: ds.colors.primary.main,
                  fontSize: {
                    xs: `${tokens.typography.xs}px`,
                    md: `${tokens.typography.sm}px`,
                  },
                  py: {
                    xs: tokens.spacing.sm,
                    md: tokens.spacing.md,
                  },
                  borderBottom: `2px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                }}
              >
                ALGORİTMA
              </TableCell>
              <TableCell
                sx={{
                  width: "14%",
                  textAlign: "center",
                  fontWeight: ds.typography.fontWeight.bold,
                  color: ds.colors.primary.main,
                  fontSize: {
                    xs: `${tokens.typography.xs}px`,
                    md: `${tokens.typography.sm}px`,
                  },
                  py: {
                    xs: tokens.spacing.sm,
                    md: tokens.spacing.md,
                  },
                  borderBottom: `2px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                }}
              >
                KULLANILAN STOK
              </TableCell>
              <TableCell
                sx={{
                  width: "14%",
                  textAlign: "center",
                  fontWeight: ds.typography.fontWeight.bold,
                  color: ds.colors.primary.main,
                  fontSize: {
                    xs: `${tokens.typography.xs}px`,
                    md: `${tokens.typography.sm}px`,
                  },
                  py: {
                    xs: tokens.spacing.sm,
                    md: tokens.spacing.md,
                  },
                  borderBottom: `2px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                }}
              >
                TOPLAM PARÇA
              </TableCell>
              <TableCell
                sx={{
                  width: "14%",
                  textAlign: "center",
                  fontWeight: ds.typography.fontWeight.bold,
                  color: ds.colors.primary.main,
                  fontSize: {
                    xs: `${tokens.typography.xs}px`,
                    md: `${tokens.typography.sm}px`,
                  },
                  py: {
                    xs: tokens.spacing.sm,
                    md: tokens.spacing.md,
                  },
                  borderBottom: `2px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                }}
              >
                VERİMLİLİK
              </TableCell>
              <TableCell
                sx={{
                  width: "14%",
                  textAlign: "center",
                  fontWeight: ds.typography.fontWeight.bold,
                  color: ds.colors.primary.main,
                  fontSize: {
                    xs: `${tokens.typography.xs}px`,
                    md: `${tokens.typography.sm}px`,
                  },
                  py: {
                    xs: tokens.spacing.sm,
                    md: tokens.spacing.md,
                  },
                  borderBottom: `2px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                }}
              >
                TOPLAM ATIK
              </TableCell>
              <TableCell
                sx={{
                  width: "14%",
                  textAlign: "center",
                  fontWeight: ds.typography.fontWeight.bold,
                  color: ds.colors.primary.main,
                  fontSize: {
                    xs: `${tokens.typography.xs}px`,
                    md: `${tokens.typography.sm}px`,
                  },
                  py: {
                    xs: tokens.spacing.sm,
                    md: tokens.spacing.md,
                  },
                  borderBottom: `2px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                }}
              >
                DETAYLAR
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {aggregatedWorkOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                  <Alert severity="warning">
                    <AlertTitle>Sonuç Bulunamadı</AlertTitle>
                    Geçerli filtrelerle sonuç bulunamadı.
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              aggregatedWorkOrders.map((workOrder: WorkOrder) => {
                const isExpanded =
                  expandedWorkOrder === String(workOrder.workOrderId);

                return (
                  <React.Fragment key={workOrder.workOrderId}>
                    {/* Summary Bar - Table Row içinde */}
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        sx={{
                          py: 0,
                          px: 0,
                          borderBottom: "none",
                        }}
                      >
                        <Paper
                          sx={{
                            p: {
                              xs: tokens.spacing.sm,
                              md: tokens.spacing.md,
                            },
                            mb: tokens.spacing.xs,
                            background: ds.colors.background.paper,
                            border: `1px solid ${alpha(ds.colors.neutral[200], 0.5)}`,
                            borderRadius: `${tokens.borderRadius.lg}px`,
                            boxShadow: ds.shadows.soft.sm,
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{
                              xs: tokens.spacing.sm,
                              sm: tokens.spacing.md,
                            }}
                            alignItems="center"
                            justifyContent="space-between"
                            flexWrap="wrap"
                          >
                            {/* Left Side - WorkOrder & Algorithm */}
                            <Stack
                              direction="row"
                              spacing={tokens.spacing.sm}
                              alignItems="center"
                              flexWrap="wrap"
                            >
                              {/* WorkOrder Chip */}
                              <Chip
                                label={String(workOrder.workOrderId)}
                                size="small"
                                sx={{
                                  fontWeight: ds.typography.fontWeight.semibold,
                                  fontSize: `${tokens.typography.sm}px`,
                                  height: tokens.components.button.md,
                                  backgroundColor: alpha(
                                    ds.colors.primary.main,
                                    0.1,
                                  ),
                                  color: ds.colors.primary.main,
                                  border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                                }}
                              />

                              {/* Algorithm Chip */}
                              <Chip
                                label={
                                  getAlgorithmProfile(workOrder.algorithm).label
                                }
                                color="primary"
                                variant="filled"
                                size="small"
                                sx={{
                                  fontWeight: ds.typography.fontWeight.semibold,
                                  fontSize: `${tokens.typography.sm}px`,
                                  height: tokens.components.button.md,
                                  background: `linear-gradient(135deg, ${ds.colors.primary[600]} 0%, ${ds.colors.primary[700]} 100%)`,
                                  color: "white",
                                  boxShadow: ds.shadows.soft.sm,
                                }}
                              />
                            </Stack>

                            {/* Center - Metrics */}
                            <Stack
                              direction="row"
                              spacing={{
                                xs: tokens.spacing.sm,
                                md: tokens.spacing.lg,
                              }}
                              alignItems="center"
                              flexWrap="wrap"
                            >
                              {/* Stock Count */}
                              <Typography
                                sx={{
                                  fontSize: `${tokens.typography.base}px`,
                                  fontWeight: ds.typography.fontWeight.semibold,
                                  color: ds.colors.text.primary,
                                }}
                              >
                                {workOrder.stockCount} Adet
                              </Typography>

                              {/* Total Segments */}
                              <Typography
                                sx={{
                                  fontSize: `${tokens.typography.base}px`,
                                  fontWeight: ds.typography.fontWeight.semibold,
                                  color: ds.colors.primary.main,
                                }}
                              >
                                {workOrder.totalSegments} Parça
                              </Typography>

                              {/* Efficiency */}
                              <Chip
                                label={`${workOrder.efficiency?.toFixed(1) ?? "—"}%`}
                                color={
                                  (workOrder.efficiency ?? 0) >= 95
                                    ? "success"
                                    : (workOrder.efficiency ?? 0) >= 90
                                      ? "warning"
                                      : "error"
                                }
                                variant="filled"
                                size="small"
                                sx={{
                                  fontWeight: ds.typography.fontWeight.semibold,
                                  fontSize: `${tokens.typography.sm}px`,
                                  height: tokens.components.button.md,
                                }}
                              />

                              {/* Total Waste */}
                              <Typography
                                sx={{
                                  fontSize: `${tokens.typography.base}px`,
                                  fontWeight: ds.typography.fontWeight.semibold,
                                  color: ds.colors.error.main,
                                }}
                              >
                                {workOrder.totalWaste?.toLocaleString() ?? "—"}
                                mm
                              </Typography>
                            </Stack>
                          </Stack>
                        </Paper>
                      </TableCell>
                    </TableRow>

                    {/* Table Row */}
                    <WorkOrderRow
                      workOrder={workOrder}
                      isExpanded={isExpanded}
                      onWorkOrderClick={onWorkOrderClick}
                      getAlgorithmProfile={getAlgorithmProfile}
                    />
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

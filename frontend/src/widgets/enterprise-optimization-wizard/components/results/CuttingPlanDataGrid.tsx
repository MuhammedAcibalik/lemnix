/**
 * Cutting Plan Data Grid Component - Professional Edition
 * MUI DataGrid with advanced styling and functionality
 *
 * @module enterprise-optimization-wizard/components/results
 * @version 2.0.0
 */

import React, { useState, useMemo } from "react";
import { Box, Button, Chip, Stack, alpha, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useDesignSystem } from "@/shared/hooks";
import { CardV2 } from "@/shared/ui/Card/Card.v2";
import {
  VisibilityOutlined as ViewIcon,
  Inventory2Outlined as StockIcon,
  ContentCutOutlined as PieceIcon,
  TrendingUpOutlined as EfficiencyIcon,
  WarningAmberOutlined as WasteIcon,
} from "@mui/icons-material";
import type { StockPlan } from "./utils";
import { CuttingPatternDialog } from "./CuttingPatternDialog";

interface CuttingPlanDataGridProps {
  readonly plans: ReadonlyArray<StockPlan>;
}

interface GroupedPlan {
  workOrderId: string;
  workOrderCount: number; // Fixed: Made required to match initialization
  algorithm: string;
  stockCount: number;
  totalPieces: number;
  avgEfficiency: number;
  totalWaste: number;
  cuts: ReadonlyArray<{
    readonly cutId: string;
    readonly segments: ReadonlyArray<{
      readonly length: number;
      readonly quantity: number;
    }>;
    readonly waste: number;
    readonly efficiency: number;
  }>;
}

export const CuttingPlanDataGrid: React.FC<CuttingPlanDataGridProps> = ({
  plans,
}) => {
  const ds = useDesignSystem();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StockPlan | null>(null);

  const handleOpenDialog = (plan: StockPlan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPlan(null);
  };

  // Group plans by work order
  const groupedPlans = useMemo(() => {
    const byWorkOrder: Record<string, GroupedPlan> = {};

    for (const plan of plans) {
      const key = plan.workOrderId;
      const existing = byWorkOrder[key];

      if (!existing) {
        byWorkOrder[key] = {
          workOrderId: plan.workOrderId,
          workOrderCount: plan.workOrderCount || 0,
          algorithm: plan.algorithm,
          stockCount: 0,
          totalPieces: 0,
          avgEfficiency: 0,
          totalWaste: 0,
          cuts: [],
        };
      }

      // Safe to access because we just initialized it if it was missing
      // and we're using the reference from the object
      const current = byWorkOrder[key]!;
      current.stockCount += plan.stockCount;
      current.totalPieces += plan.totalPieces;
      current.totalWaste += plan.totalWaste;
      current.cuts = [...current.cuts, ...plan.cuts];
    }

    return Object.values(byWorkOrder).map((group) => ({
      ...group,
      avgEfficiency:
        group.cuts.reduce((sum, c) => sum + c.efficiency, 0) /
        (group.cuts.length || 1), // Prevent division by zero
    }));
  }, [plans]);

  const columns: GridColDef[] = [
    {
      field: "workOrderId",
      headerName: "İş Emri",
      width: 200,
      renderCell: (params: GridRenderCellParams<GroupedPlan>) => {
        const displayLabel = params.row.workOrderId || "N/A";
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: `${ds.borderRadius.md}px`,
                bgcolor: alpha(ds.colors.primary.main, 0.06),
                border: `1px solid ${alpha(ds.colors.primary.main, 0.15)}`,
                height: 40,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: ds.colors.primary.main,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: ds.colors.primary.main,
                  fontFamily: "monospace",
                  fontSize: "0.8125rem",
                }}
              >
                {displayLabel}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: "algorithm",
      headerName: "Algoritma",
      width: 200,
      renderCell: (params: GridRenderCellParams<GroupedPlan>) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: `${ds.borderRadius.md}px`,
              bgcolor: alpha(ds.colors.info.main, 0.06),
              border: `1px solid ${alpha(ds.colors.info.main, 0.2)}`,
              height: 40,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: ds.colors.info.dark,
                fontSize: "0.8125rem",
              }}
            >
              {params.row.algorithm}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "stockCount",
      headerName: "Stok",
      width: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<GroupedPlan>) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1,
              borderRadius: `${ds.borderRadius.md}px`,
              bgcolor: alpha(ds.colors.primary.main, 0.04),
              height: 40,
            }}
          >
            <StockIcon
              sx={{
                fontSize: 18,
                color: ds.colors.primary.main,
                opacity: 0.7,
              }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: ds.colors.text.primary,
                  lineHeight: 1,
                  fontSize: "0.9375rem",
                }}
              >
                {params.row.stockCount}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: ds.colors.text.secondary,
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  lineHeight: 1,
                  mt: 0.25,
                }}
              >
                Adet
              </Typography>
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      field: "totalPieces",
      headerName: "Parça",
      width: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<GroupedPlan>) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1,
              borderRadius: `${ds.borderRadius.md}px`,
              bgcolor: alpha(ds.colors.success.main, 0.04),
              height: 40,
            }}
          >
            <PieceIcon
              sx={{
                fontSize: 18,
                color: ds.colors.success.main,
                opacity: 0.7,
              }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: ds.colors.success.dark,
                  lineHeight: 1,
                  fontSize: "0.9375rem",
                }}
              >
                {params.row.totalPieces}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: ds.colors.text.secondary,
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  lineHeight: 1,
                  mt: 0.25,
                }}
              >
                Parça
              </Typography>
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      field: "avgEfficiency",
      headerName: "Verimlilik",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<GroupedPlan>) => {
        // CRITICAL FIX: Round to 1 decimal and format with Turkish locale (comma instead of dot)
        const efficiency = Math.round(params.row.avgEfficiency * 10) / 10; // Round to 1 decimal
        const formattedEfficiency = efficiency.toFixed(1).replace(".", ","); // Turkish format

        const color =
          efficiency >= 80
            ? ds.colors.success.main
            : efficiency >= 60
              ? ds.colors.warning.main
              : ds.colors.error.main;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: `${ds.borderRadius.md}px`,
                bgcolor: alpha(color, 0.1),
                border: `1px solid ${alpha(color, 0.25)}`,
                height: 40,
              }}
            >
              <EfficiencyIcon
                sx={{
                  fontSize: 18,
                  color: color,
                  opacity: 0.8,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: color,
                  fontSize: "0.8125rem",
                }}
              >
                %{formattedEfficiency}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: "totalWaste",
      headerName: "Atık",
      width: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<GroupedPlan>) => {
        const wasteColor =
          params.row.totalWaste > 5000
            ? ds.colors.error.main
            : params.row.totalWaste > 2000
              ? ds.colors.warning.main
              : ds.colors.text.secondary;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: `${ds.borderRadius.md}px`,
                bgcolor: alpha(wasteColor, 0.08),
                border: `1px solid ${alpha(wasteColor, 0.2)}`,
                height: 40,
              }}
            >
              <WasteIcon
                sx={{
                  fontSize: 18,
                  color: wasteColor,
                  opacity: 0.7,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: wasteColor,
                  fontFamily: "monospace",
                  fontSize: "0.8125rem",
                }}
              >
                {params.row.totalWaste.toLocaleString("tr-TR")}mm
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: "details",
      headerName: "",
      width: 150,
      align: "right",
      headerAlign: "right",
      sortable: false,
      renderCell: (params: GridRenderCellParams<GroupedPlan>) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            height: "100%",
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<ViewIcon sx={{ fontSize: 18 }} />}
            onClick={() => {
              const mockPlan: StockPlan = {
                stockLength: 0,
                planId: params.row.workOrderId,
                workOrderId: params.row.workOrderId,
                workOrderCount: params.row.workOrderCount || 0,
                algorithm: params.row.algorithm,
                stockCount: params.row.stockCount,
                totalPieces: params.row.totalPieces,
                efficiency: params.row.avgEfficiency,
                totalWaste: params.row.totalWaste,
                cuts: params.row.cuts,
              };
              handleOpenDialog(mockPlan);
            }}
            sx={{
              textTransform: "none",
              fontSize: "0.8125rem",
              fontWeight: 600,
              height: 40,
              px: 2.5,
              background: `linear-gradient(135deg, ${ds.colors.primary.main} 0%, ${ds.colors.primary.dark} 100%)`,
              color: "white",
              borderRadius: `${ds.borderRadius.md}px`,
              boxShadow: `0 2px 8px ${alpha(ds.colors.primary.main, 0.25)}`,
              "&:hover": {
                background: `linear-gradient(135deg, ${ds.colors.primary.dark} 0%, ${ds.colors.primary.main} 100%)`,
                boxShadow: `0 4px 12px ${alpha(ds.colors.primary.main, 0.35)}`,
                transform: "translateY(-1px)",
              },
            }}
          >
            Detaylar
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <>
      <CardV2
        elevation={0}
        sx={{
          p: 0,
          mb: ds.spacing["4"],
          border: `1px solid ${alpha(ds.colors.neutral[300], 0.5)}`,
          borderRadius: `${ds.borderRadius.lg}px`,
          overflow: "hidden",
          boxShadow: `0 1px 3px ${alpha(ds.colors.neutral[900], 0.08)}`,
        }}
      >
        <Box sx={{ height: "auto", width: "100%" }}>
          <DataGrid
            rows={groupedPlans}
            columns={columns}
            getRowId={(row) => row.workOrderId}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            autoHeight
            disableRowSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: alpha(ds.colors.primary.main, 0.04),
                borderBottom: `2px solid ${alpha(ds.colors.primary.main, 0.15)}`,
                minHeight: "56px !important",
                maxHeight: "56px !important",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 600,
                fontSize: "0.8125rem",
                color: ds.colors.text.primary,
                letterSpacing: "0.01em",
              },
              "& .MuiDataGrid-columnHeader": {
                "&:focus": {
                  outline: "none",
                },
                "&:focus-within": {
                  outline: "none",
                },
              },
              "& .MuiDataGrid-cell": {
                borderColor: alpha(ds.colors.neutral[200], 0.5),
                py: 2,
                display: "flex",
                alignItems: "center",
                "&:focus": {
                  outline: "none",
                },
                "&:focus-within": {
                  outline: "none",
                },
              },
              "& .MuiDataGrid-row": {
                "&:hover": {
                  backgroundColor: alpha(ds.colors.primary.main, 0.03),
                },
                "&.Mui-selected": {
                  backgroundColor: alpha(ds.colors.primary.main, 0.08),
                  "&:hover": {
                    backgroundColor: alpha(ds.colors.primary.main, 0.1),
                  },
                },
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: `1px solid ${alpha(ds.colors.neutral[200], 0.5)}`,
                minHeight: "52px !important",
              },
            }}
          />
        </Box>
      </CardV2>

      <CuttingPatternDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        plan={selectedPlan}
      />
    </>
  );
};

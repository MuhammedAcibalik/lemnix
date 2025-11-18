/**
 * Cutting Plan Data Grid Component - Professional Edition
 * MUI DataGrid with advanced styling and functionality
 *
 * @module enterprise-optimization-wizard/components/results
 * @version 2.0.0
 */

import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Stack,
  alpha,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useDesignSystem } from "@/shared/hooks";
import { CardV2 } from "@/shared/ui/Card/Card.v2";
import {
  Visibility as ViewIcon,
} from "@mui/icons-material";
import type { StockPlan } from "./utils";
import { CuttingPatternDialog } from "./CuttingPatternDialog";

interface CuttingPlanDataGridProps {
  readonly plans: ReadonlyArray<StockPlan>;
}

interface GroupedPlan {
  workOrderId: string;
  workOrderCount?: number;
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
      if (!byWorkOrder[key]) {
        byWorkOrder[key] = {
          workOrderId: plan.workOrderId,
          workOrderCount: plan.workOrderCount,
          algorithm: plan.algorithm,
          stockCount: 0,
          totalPieces: 0,
          avgEfficiency: 0,
          totalWaste: 0,
          cuts: [],
        };
      }

      byWorkOrder[key].stockCount += plan.stockCount;
      byWorkOrder[key].totalPieces += plan.totalPieces;
      byWorkOrder[key].totalWaste += plan.totalWaste;
      byWorkOrder[key].cuts = [...byWorkOrder[key].cuts, ...plan.cuts];
    }

    // Calculate average efficiency
    return Object.values(byWorkOrder).map((group) => ({
      ...group,
      avgEfficiency:
        group.cuts.reduce((sum, c) => sum + c.efficiency, 0) /
        group.cuts.length,
    }));
  }, [plans]);

  const columns: GridColDef[] = [
    {
      field: "workOrderId",
      headerName: "İŞ EMRİ",
      width: 200,
      renderCell: (params: GridRenderCellParams<GroupedPlan>) => {
        // Always display the actual work order ID
        const displayLabel = params.row.workOrderId || "N/A";

        return (
          <Chip
            label={displayLabel}
            size="small"
            sx={{
              height: 26,
              fontSize: "0.8125rem",
              fontWeight: 600,
              background:
                params.row.workOrderId !== "N/A"
                  ? alpha(ds.colors.primary.main, 0.1)
                  : alpha(ds.colors.neutral[400], 0.1),
              color:
                params.row.workOrderId !== "N/A"
                  ? ds.colors.primary.main
                  : ds.colors.text.secondary,
              border: `1px solid ${
                params.row.workOrderId !== "N/A"
                  ? alpha(ds.colors.primary.main, 0.2)
                  : alpha(ds.colors.neutral[400], 0.2)
              }`,
            }}
          />
        );
      },
    },
    {
      field: "algorithm",
      headerName: "ALGORİTMA",
      width: 180,
      renderCell: (params: GridRenderCellParams<GroupedPlan>) => (
        <Chip
          label={params.row.algorithm}
          size="small"
          sx={{
            height: 26,
            fontSize: "0.8125rem",
            fontWeight: 600,
            background: alpha(ds.colors.info.main, 0.1),
            color: ds.colors.info.main,
            border: `1px solid ${alpha(ds.colors.info.main, 0.2)}`,
          }}
        />
      ),
    },
    {
      field: "stockCount",
      headerName: "KULLANILAN STOK",
      width: 160,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<GroupedPlan>) => (
        <Box
          sx={{
            fontSize: "1rem",
            fontWeight: ds.typography.fontWeight.bold,
            color: ds.colors.text.primary,
          }}
        >
          {params.row.stockCount} Adet
        </Box>
      ),
    },
    {
      field: "totalPieces",
      headerName: "TOPLAM PARÇA",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<GroupedPlan>) => (
        <Box
          sx={{
            fontSize: "1rem",
            fontWeight: ds.typography.fontWeight.bold,
            color: ds.colors.primary.main,
          }}
        >
          {params.row.totalPieces} Parça
        </Box>
      ),
    },
    {
      field: "avgEfficiency",
      headerName: "VERİMLİLİK",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<GroupedPlan>) => {
        const efficiency = params.row.avgEfficiency;
        const color =
          efficiency >= 80
            ? ds.colors.success.main
            : efficiency >= 60
              ? ds.colors.warning.main
              : ds.colors.error.main;

        return (
          <Chip
            label={`${efficiency.toFixed(1)}%`}
            size="small"
            sx={{
              height: 26,
              fontSize: "0.8125rem",
              fontWeight: 700,
              background: alpha(color, 0.1),
              color: color,
              border: `1px solid ${alpha(color, 0.3)}`,
            }}
          />
        );
      },
    },
    {
      field: "totalWaste",
      headerName: "TOPLAM ATIK",
      width: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<GroupedPlan>) => (
        <Box
          sx={{
            fontSize: "0.9375rem",
            fontWeight: ds.typography.fontWeight.semibold,
            color:
              params.row.totalWaste > 500
                ? ds.colors.error.main
                : ds.colors.text.secondary,
          }}
        >
          {params.row.totalWaste}mm
        </Box>
      ),
    },
    {
      field: "details",
      headerName: "DETAYLAR",
      width: 160,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams<GroupedPlan>) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<ViewIcon sx={{ fontSize: 16 }} />}
          onClick={() => {
            // Create a mock StockPlan for the dialog
            const mockPlan: StockPlan = {
              stockLength: 0, // Will be set by dialog
              planId: params.row.workOrderId,
              workOrderId: params.row.workOrderId,
              workOrderCount: params.row.workOrderCount,
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
            height: 32,
            px: ds.spacing["2"],
            background: ds.gradients.primary,
            color: "white",
            boxShadow: "none",
            "&:hover": {
              background: ds.gradients.primary,
              opacity: 0.9,
              boxShadow: ds.shadows.soft.sm,
              transform: "translateY(-1px)",
            },
          }}
        >
          Kesim Detayları
        </Button>
      ),
    },
  ];

  return (
    <>
      <CardV2
        sx={{
          p: ds.spacing["3"],
          mb: ds.spacing["4"],
          border: `1px solid ${alpha(ds.colors.neutral[300], 0.5)}`,
        }}
      >
        <Box sx={{ height: "auto", width: "100%" }}>
          <DataGrid
            rows={groupedPlans}
            columns={columns}
            getRowId={(row) => row.workOrderId}
            pageSizeOptions={[5, 10, 25, 50]}
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
                backgroundColor: alpha(ds.colors.primary.main, 0.05),
                borderRadius: `${ds.borderRadius.md}px`,
                mb: ds.spacing["1"],
                borderBottom: `2px solid ${alpha(ds.colors.primary.main, 0.2)}`,
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: ds.typography.fontWeight.bold,
                fontSize: "0.8125rem",
                color: ds.colors.text.primary,
                letterSpacing: "0.5px",
              },
              "& .MuiDataGrid-cell": {
                borderColor: alpha(ds.colors.neutral[200], 0.5),
                fontSize: "0.875rem",
              },
              "& .MuiDataGrid-row": {
                "&:hover": {
                  backgroundColor: alpha(ds.colors.primary.main, 0.02),
                  cursor: "pointer",
                },
                "&.Mui-selected": {
                  backgroundColor: alpha(ds.colors.primary.main, 0.05),
                  "&:hover": {
                    backgroundColor: alpha(ds.colors.primary.main, 0.08),
                  },
                },
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: `1px solid ${alpha(ds.colors.neutral[300], 0.5)}`,
                mt: ds.spacing["2"],
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

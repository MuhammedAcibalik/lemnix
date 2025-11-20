/**
 * @fileoverview Work Order Row Component
 * @module WorkOrderRow
 * @version 1.0.0
 */

import React from "react";
import { WorkOrder, Cut } from "../../types";
import {
  TableRow,
  TableCell,
  Typography,
  Chip,
  Button,
  Box,
  alpha,
} from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import { useDesignSystem, useAdaptiveUIContext } from "@/shared/hooks";

interface WorkOrderRowProps {
  workOrder: WorkOrder;
  isExpanded: boolean;
  onWorkOrderClick: (workOrderId: string) => void;
  onCuttingPlanDetails?: (stock: Cut) => void;
  getAlgorithmProfile: (algorithm?: string) => {
    icon: React.ReactNode;
    label: string;
  };
}

export const WorkOrderRow: React.FC<WorkOrderRowProps> = ({
  workOrder,
  isExpanded,
  onWorkOrderClick,
  onCuttingPlanDetails,
  getAlgorithmProfile,
}) => {
  const ds = useDesignSystem();
  const { device, tokens } = useAdaptiveUIContext();

  return (
    <React.Fragment>
      <TableRow
        hover
        sx={{
          background: ds.colors.background.paper,
          borderBottom: `1px solid ${alpha(ds.colors.neutral[200], 0.3)}`,
          position: "relative",
          "&:hover": !device.isTouch
            ? {
                background: alpha(ds.colors.primary.main, 0.02),
                transform: "translateY(-1px)",
                boxShadow: ds.shadows.soft.sm,
                zIndex: 0,
              }
            : {},
          transition: ds.transitions.fast,
        }}
      >
        {/* İş Emri */}
        <TableCell
          sx={{
            textAlign: "center",
            py: {
              xs: tokens.spacing.sm,
              md: tokens.spacing.md,
            },
            borderBottom: `1px solid ${alpha(ds.colors.neutral[200], 0.2)}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: ds.typography.fontWeight.semibold,
              color: ds.colors.text.primary,
              fontSize: {
                xs: `${tokens.typography.xs}px`,
                md: `${tokens.typography.sm}px`,
              },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 150,
            }}
          >
            {workOrder.workOrderId}
          </Typography>
        </TableCell>

        {/* Algoritma */}
        <TableCell
          sx={{
            textAlign: "center",
            py: {
              xs: tokens.spacing.sm,
              md: tokens.spacing.md,
            },
            borderBottom: `1px solid ${alpha(ds.colors.neutral[200], 0.2)}`,
          }}
        >
          <Chip
            label={getAlgorithmProfile(workOrder.algorithm).label}
            color="primary"
            variant="filled"
            size="small"
            sx={{
              fontWeight: ds.typography.fontWeight.semibold,
              fontSize: {
                xs: `${tokens.typography.xs}px`,
                md: `${tokens.typography.sm}px`,
              },
              px: tokens.spacing.sm,
              py: tokens.spacing.xs,
              height: {
                xs: tokens.components.button.sm,
                md: tokens.components.button.md,
              },
              background: `linear-gradient(135deg, ${ds.colors.primary[600]} 0%, ${ds.colors.primary[700]} 100%)`,
              color: "white",
              boxShadow: ds.shadows.soft.sm,
            }}
          />
        </TableCell>

        {/* Kullanılan Stok */}
        <TableCell
          sx={{
            textAlign: "center",
            py: {
              xs: tokens.spacing.sm,
              md: tokens.spacing.md,
            },
            borderBottom: `1px solid ${alpha(ds.colors.neutral[200], 0.2)}`,
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: `${tokens.typography.xs}px`,
                md: `${tokens.typography.sm}px`,
              },
              fontWeight: ds.typography.fontWeight.semibold,
              color: ds.colors.text.primary,
            }}
          >
            {workOrder.stockCount} Adet
          </Typography>
        </TableCell>

        {/* Toplam Parça */}
        <TableCell
          sx={{
            textAlign: "center",
            py: {
              xs: tokens.spacing.sm,
              md: tokens.spacing.md,
            },
            borderBottom: `1px solid ${alpha(ds.colors.neutral[200], 0.2)}`,
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: `${tokens.typography.xs}px`,
                md: `${tokens.typography.sm}px`,
              },
              fontWeight: ds.typography.fontWeight.semibold,
              color: ds.colors.text.primary,
            }}
          >
            {workOrder.totalSegments} Parça
          </Typography>
        </TableCell>

        {/* Verimlilik */}
        <TableCell
          sx={{
            textAlign: "center",
            py: {
              xs: tokens.spacing.sm,
              md: tokens.spacing.md,
            },
            borderBottom: `1px solid ${alpha(ds.colors.neutral[200], 0.2)}`,
          }}
        >
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
              fontSize: {
                xs: `${tokens.typography.xs}px`,
                md: `${tokens.typography.sm}px`,
              },
              px: tokens.spacing.xs,
              py: tokens.spacing.xxs,
              height: {
                xs: tokens.components.button.sm,
                md: 28,
              },
            }}
          />
        </TableCell>

        {/* Toplam Atık */}
        <TableCell
          sx={{
            textAlign: "center",
            py: {
              xs: tokens.spacing.sm,
              md: tokens.spacing.md,
            },
            borderBottom: `1px solid ${alpha(ds.colors.neutral[200], 0.2)}`,
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: `${tokens.typography.xs}px`,
                md: `${tokens.typography.sm}px`,
              },
              fontWeight: ds.typography.fontWeight.semibold,
              color: ds.colors.error.main,
            }}
          >
            {workOrder.totalWaste?.toLocaleString() ?? "—"}mm
          </Typography>
        </TableCell>

        {/* Detaylar */}
        <TableCell
          sx={{
            textAlign: "center",
            py: {
              xs: tokens.spacing.sm,
              md: tokens.spacing.md,
            },
            borderBottom: `1px solid ${alpha(ds.colors.neutral[200], 0.2)}`,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              position: "relative",
              zIndex: 2,
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={() => onWorkOrderClick(String(workOrder.workOrderId))}
              sx={{
                textTransform: "none",
                fontWeight: ds.typography.fontWeight.semibold,
                fontSize: {
                  xs: `${tokens.typography.xs}px`,
                  md: `${tokens.typography.sm}px`,
                },
                background: `linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)`,
                color: "white",
                padding: 0,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 0,
                paddingInline: 0,
                paddingBlock: 0,
                px: 0,
                py: 0,
                margin: 0,
                borderRadius: `${tokens.borderRadius.md}px`,
                minWidth: {
                  xs: 150,
                  md: 170,
                },
                width: {
                  xs: 150,
                  md: 170,
                },
                minHeight: device.isTouch
                  ? tokens.components.minTouchTarget
                  : tokens.components.button.md,
                boxShadow: ds.shadows.soft.md,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                zIndex: 3,
                "&:hover": !device.isTouch
                  ? {
                      background: `linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)`,
                      boxShadow: ds.shadows.soft.lg,
                      transform: "translateY(-1px)",
                      zIndex: 4,
                    }
                  : {},
                transition: ds.transitions.fast,
                "& .MuiButton-root": {
                  padding: 0,
                  margin: 0,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                },
                "& .MuiButton-label": {
                  padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
                  margin: 0,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: tokens.spacing.xs,
                },
                "& .MuiButton-startIcon": {
                  margin: 0,
                  marginLeft: 0,
                  marginRight: 0,
                },
                "& .MuiButton-endIcon": {
                  margin: 0,
                  marginLeft: 0,
                  marginRight: 0,
                },
              }}
              startIcon={
                <VisibilityIcon
                  sx={{
                    fontSize: {
                      xs: tokens.components.icon.xs,
                      md: tokens.components.icon.sm,
                    },
                    margin: 0,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                />
              }
            >
              Kesim Detayları
            </Button>
          </Box>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

/**
 * @fileoverview Work Order Row Component
 * @module WorkOrderRow
 * @version 1.0.0
 */

import React from 'react';
import { WorkOrder, Cut } from '../../types';
import {
  TableRow,
  TableCell,
  Box,
  Avatar,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Engineering as EngineeringIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  ShowChart as ShowChartIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface WorkOrderRowProps {
  workOrder: WorkOrder;
  isExpanded: boolean;
  onWorkOrderClick: (workOrderId: string) => void;
  onCuttingPlanDetails: (stock: Cut) => void;
  getAlgorithmProfile: (algorithm?: string) => { icon: React.ReactNode; label: string };
}

export const WorkOrderRow: React.FC<WorkOrderRowProps> = ({
  workOrder,
  isExpanded,
  onWorkOrderClick,
  onCuttingPlanDetails,
  getAlgorithmProfile
}) => {
  return (
    <React.Fragment>
      <TableRow
        hover
        sx={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.8) 100%)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          "&:hover": {
            background:
              "linear-gradient(135deg, rgba(30,64,175,0.05) 0%, rgba(124,58,237,0.05) 100%)", // Industrial Harmony
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
          transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {/* İş Emri */}
        <TableCell
          sx={{
            textAlign: "center",
            py: 2,
            borderBottom: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)", // Industrial Harmony
                color: "white",
                fontSize: "0.8rem",
                fontWeight: "bold",
              }}
            >
              <EngineeringIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Typography
              variant="body2"
              fontWeight="bold"
              color="primary"
              noWrap
              sx={{ fontSize: "0.9rem" }}
            >
              {workOrder.workOrderId}
            </Typography>
          </Box>
        </TableCell>

        {/* Algoritma */}
        <TableCell
          sx={{
            textAlign: "center",
            py: 2,
            borderBottom: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Chip
            label={getAlgorithmProfile(workOrder.algorithm).label}
            color="primary"
            variant="filled"
            size="medium"
            sx={{
              fontWeight: "bold",
              fontSize: "0.8rem",
              px: 1.5,
              py: 0.5,
              background: "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)", // Industrial Harmony
              color: "white",
              boxShadow: "0 2px 8px rgba(30,64,175,0.3)", // Industrial Harmony
            }}
          />
        </TableCell>

        {/* Boy Profil */}
        <TableCell
          sx={{
            textAlign: "center",
            py: 2,
            borderBottom: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
              }}
            >
              <EngineeringIcon sx={{ fontSize: 16 }} />
            </Box>
            <Typography
              variant="body2"
              fontWeight="bold"
              noWrap
              sx={{ fontSize: "0.9rem" }}
            >
              {workOrder.stockCount}
            </Typography>
          </Box>
        </TableCell>

        {/* Toplam Parça */}
        <TableCell
          sx={{
            textAlign: "center",
            py: 2,
            borderBottom: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <AssessmentIcon
              sx={{
                fontSize: 16,
                color: "success.main",
              }}
            />
            <Typography
              variant="body2"
              fontWeight="bold"
              noWrap
              sx={{ fontSize: "0.9rem" }}
            >
              {workOrder.totalSegments}
            </Typography>
          </Box>
        </TableCell>

        {/* Verimlilik */}
        <TableCell
          sx={{
            textAlign: "center",
            py: 2,
            borderBottom: "1px solid rgba(0,0,0,0.05)",
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
            size="medium"
            sx={{
              fontWeight: "bold",
              fontSize: "0.8rem",
              px: 1.5,
              py: 0.5,
              boxShadow:
                (workOrder.efficiency ?? 0) >= 95
                  ? "0 2px 8px rgba(16,185,129,0.3)"
                  : (workOrder.efficiency ?? 0) >= 90
                    ? "0 2px 8px rgba(245,158,11,0.3)"
                    : "0 2px 8px rgba(239,68,68,0.3)",
            }}
          />
        </TableCell>

        {/* Plan Sayısı */}
        <TableCell
          sx={{
            textAlign: "center",
            py: 2,
            borderBottom: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <TimelineIcon sx={{ fontSize: 16, color: "info.main" }} />
            <Typography
              variant="body2"
              fontWeight="bold"
              noWrap
              sx={{ fontSize: "0.9rem" }}
            >
              {workOrder.cuts.length}
            </Typography>
          </Box>
        </TableCell>

        {/* Toplam Kesim */}
        <TableCell
          sx={{
            textAlign: "center",
            py: 2,
            borderBottom: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <ShowChartIcon
              sx={{
                fontSize: 16,
                color: "secondary.main",
              }}
            />
            <Typography
              variant="body2"
              fontWeight="bold"
              noWrap
              sx={{ fontSize: "0.9rem" }}
            >
              {(workOrder.cuts as Cut[])?.reduce(
                (sum: number, cut: Cut) => sum + (Number(cut.segmentCount) || 0),
                0
              ) || 0}
            </Typography>
          </Box>
        </TableCell>

        {/* Detaylar */}
        <TableCell
          sx={{
            textAlign: "center",
            py: 2,
            borderBottom: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Button
            variant="contained"
            size="medium"
            onClick={() => onWorkOrderClick(String(workOrder.workOrderId))}
            sx={{
              minWidth: "140px",
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "0.8rem",
              background: "linear-gradient(135deg, #059669 0%, #22c55e 100%)", // Precision Green
              color: "white",
              px: 2,
              py: 1,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(5,150,105,0.3)", // Precision Green
              "&:hover": {
                background: "linear-gradient(135deg, #047857 0%, #065f46 100%)", // Precision Green Dark
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(5,150,105,0.4)", // Precision Green
              },
              transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
            startIcon={<InfoIcon />}
          >
            Kesim Detayları
          </Button>
        </TableCell>
      </TableRow>

    </React.Fragment>
  );
};

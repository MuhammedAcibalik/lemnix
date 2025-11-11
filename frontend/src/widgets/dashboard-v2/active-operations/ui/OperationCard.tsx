/**
 * Operation Card Component
 * Shows individual active optimization operation
 *
 * @module widgets/dashboard-v2/active-operations
 * @version 3.0.0 - With Pulse Animation
 */

import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  alpha,
  keyframes,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import type {
  ActiveOperation,
  ActiveOperationStatus,
} from "@/entities/dashboard";

/**
 * Pulse animation for active items
 */
const pulseAnimation = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
`;

/**
 * Props
 */
export interface OperationCardProps {
  readonly operation: ActiveOperation;
  readonly onClick?: (id: string) => void;
}

/**
 * Get status config
 */
function getStatusConfig(
  status: ActiveOperationStatus,
  ds: ReturnType<typeof useDesignSystem>,
) {
  const configs = {
    queued: {
      icon: HourglassIcon,
      label: "Sırada",
      color: ds.colors.neutral[600],
      bgColor: alpha(ds.colors.neutral[600], 0.1),
    },
    processing: {
      icon: PlayArrowIcon,
      label: "İşleniyor",
      color: ds.colors.primary.main,
      bgColor: alpha(ds.colors.primary.main, 0.1),
    },
    completed: {
      icon: CheckCircleIcon,
      label: "Tamamlandı",
      color: ds.colors.success.main,
      bgColor: alpha(ds.colors.success.main, 0.1),
    },
    failed: {
      icon: ErrorIcon,
      label: "Başarısız",
      color: ds.colors.error.main,
      bgColor: alpha(ds.colors.error.main, 0.1),
    },
  };

  return configs[status];
}

/**
 * Get algorithm display name
 */
function getAlgorithmName(algorithm: string): string {
  const names: Record<string, string> = {
    ffd: "FFD",
    bfd: "BFD",
    genetic: "Genetic Algorithm",
    pooling: "Pooling",
  };
  return names[algorithm] || algorithm;
}

/**
 * Operation Card
 * Displays active optimization operation
 */
export const OperationCard: React.FC<OperationCardProps> = ({
  operation,
  onClick,
}) => {
  const ds = useDesignSystem();
  const statusConfig = getStatusConfig(operation.status, ds);
  const StatusIcon = statusConfig.icon;

  const handleClick = () => {
    if (onClick) {
      onClick(operation.id);
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        p: ds.spacing["3"],
        borderRadius: `${ds.borderRadius.md}px`,
        border: `1px solid ${operation.status === "processing" ? ds.colors.primary.main : ds.colors.neutral[200]}`,
        backgroundColor: alpha(
          operation.status === "processing"
            ? ds.colors.primary.main
            : ds.colors.neutral[50],
          operation.status === "processing" ? 0.05 : 0.5,
        ),
        transition: ds.transitions.base,
        cursor: onClick ? "pointer" : "default",
        // Pulse animation for processing items
        ...(operation.status === "processing" && {
          animation: `${pulseAnimation} 2s ease-in-out infinite`,
        }),
        "&:hover": onClick
          ? {
              borderColor: ds.colors.primary.main,
              backgroundColor: alpha(ds.colors.primary.main, 0.08),
              transform: "translateX(4px)",
            }
          : undefined,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: ds.spacing["2"],
        }}
      >
        {/* Algorithm */}
        <Typography
          sx={{
            fontSize: "0.9375rem",
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
          }}
        >
          {getAlgorithmName(operation.algorithm)}
        </Typography>

        {/* Status Chip */}
        <Chip
          icon={<StatusIcon sx={{ fontSize: 14 }} />}
          label={statusConfig.label}
          size="small"
          sx={{
            height: 24,
            fontSize: "0.6875rem",
            fontWeight: 600,
            background: statusConfig.bgColor,
            color: statusConfig.color,
            "& .MuiChip-icon": {
              ml: 0.5,
              mr: -0.5,
            },
          }}
        />
      </Box>

      {/* Details */}
      <Box sx={{ display: "flex", gap: ds.spacing["3"], mb: ds.spacing["2"] }}>
        <Typography variant="body2" color="text.secondary">
          <Box
            component="span"
            sx={{ fontWeight: 600, color: ds.colors.text.primary }}
          >
            {operation.itemCount}
          </Box>{" "}
          parça
        </Typography>

        {operation.currentGeneration && operation.totalGenerations && (
          <Typography variant="body2" color="text.secondary">
            Nesil:{" "}
            <Box
              component="span"
              sx={{ fontWeight: 600, color: ds.colors.text.primary }}
            >
              {operation.currentGeneration}/{operation.totalGenerations}
            </Box>
          </Typography>
        )}

        {operation.userName && (
          <Typography variant="body2" color="text.secondary">
            {operation.userName}
          </Typography>
        )}
      </Box>

      {/* Progress Bar */}
      {operation.status === "processing" && (
        <Box sx={{ mt: ds.spacing["2"] }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              İlerleme
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: ds.colors.primary.main }}
            >
              %{operation.progress.toFixed(0)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={operation.progress}
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
      )}
    </Box>
  );
};

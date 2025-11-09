/**
 * Breakdown Card Component
 * Reusable breakdown card with progress bars
 *
 * @module enterprise-optimization-wizard/components/results/shared
 * @version 1.0.0
 */

import React from "react";
import {
  Box,
  Typography,
  Stack,
  LinearProgress,
  alpha,
  Chip,
} from "@mui/material";
import { CardV2 } from "@/shared";
import { useDesignSystem } from "@/shared/hooks";

export interface BreakdownItem {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly color: string;
  readonly displayValue?: string;
}

export interface BreakdownCardProps {
  readonly title: string;
  readonly items: readonly BreakdownItem[];
  readonly total: number;
  readonly formatValue?: (value: number) => string;
  readonly showChip?: boolean;
  readonly indicatorShape?: "square" | "circle";
}

/**
 * Breakdown Card
 * Displays items with progress bars showing percentage breakdown
 */
export const BreakdownCard: React.FC<BreakdownCardProps> = ({
  title,
  items,
  total,
  formatValue,
  showChip = false,
  indicatorShape = "square",
}) => {
  const ds = useDesignSystem();

  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing["3"] }}>
      <Typography
        sx={{
          fontSize: "0.9375rem",
          fontWeight: ds.typography.fontWeight.semibold,
          color: ds.colors.text.primary,
          mb: ds.spacing["2"],
        }}
      >
        {title}
      </Typography>

      <Stack spacing={ds.spacing["2"]}>
        {items.map((item) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          const displayValue =
            item.displayValue ||
            (formatValue ? formatValue(item.value) : item.value);

          return (
            <Box key={item.key}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: ds.spacing["1"],
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: ds.spacing["1"],
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: indicatorShape === "circle" ? "50%" : "2px",
                      backgroundColor: item.color,
                    }}
                  />
                  <Typography
                    sx={{ fontSize: "0.875rem", color: ds.colors.text.primary }}
                  >
                    {item.label}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: ds.spacing["2"],
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: ds.colors.text.primary,
                    }}
                  >
                    {displayValue}
                  </Typography>
                  {showChip ? (
                    <Chip
                      label={`${percentage.toFixed(1)}%`}
                      size="small"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        height: 24,
                        backgroundColor: alpha(item.color, 0.1),
                        color: item.color,
                        border: `1px solid ${alpha(item.color, 0.2)}`,
                      }}
                    />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: item.color,
                        minWidth: 50,
                        textAlign: "right",
                      }}
                    >
                      {percentage.toFixed(1)}%
                    </Typography>
                  )}
                </Box>
              </Box>

              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 8,
                  borderRadius: `${ds.borderRadius.sm}px`,
                  backgroundColor: alpha(ds.colors.neutral[200], 0.3),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: `${ds.borderRadius.sm}px`,
                    backgroundColor: item.color,
                  },
                }}
              />
            </Box>
          );
        })}
      </Stack>
    </CardV2>
  );
};

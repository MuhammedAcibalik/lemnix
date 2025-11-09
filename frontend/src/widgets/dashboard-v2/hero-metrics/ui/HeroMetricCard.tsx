/**
 * Hero Metric Card Component
 * Glassmorphism card for top-level KPI display
 *
 * @module widgets/dashboard-v2/hero-metrics
 * @version 1.0.0 - Design System v2.0 Compliant
 */

import React from "react";
import { Box, Typography, alpha } from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import { CardV2 } from "@/shared";
import { useDesignSystem } from "@/shared/hooks";

/**
 * Hero metric card props
 */
export interface HeroMetricCardProps {
  readonly label: string;
  readonly value: string | number;
  readonly unit?: string;
  readonly icon: React.ComponentType<{ sx?: object }>;
  readonly trend?: number; // Percentage change (positive = up, negative = down)
  readonly sparklineData?: ReadonlyArray<number>; // Mini chart data
  readonly color?: "primary" | "success" | "warning" | "error";
  readonly loading?: boolean;
}

/**
 * Hero Metric Card
 * Large glassmorphism card showing key metric
 */
export const HeroMetricCard: React.FC<HeroMetricCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  sparklineData,
  color = "primary",
  loading = false,
}) => {
  const ds = useDesignSystem();

  const colorScheme = ds.colors[color];
  const hasTrend = trend !== undefined;
  const trendDirection = hasTrend && trend >= 0 ? "up" : "down";
  const TrendIcon = trendDirection === "up" ? TrendingUpIcon : TrendingDownIcon;

  return (
    <CardV2
      variant="glass"
      hoverable
      sx={{
        p: ds.spacing["1"],
        position: "relative",
        overflow: "hidden",
        height: 250,
        transition: ds.transitions.base,
      }}
    >
      {/* Icon Background */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          opacity: 0.08,
          transform: "rotate(-15deg)",
        }}
      >
        <Icon sx={{ fontSize: 120, color: colorScheme.main }} />
      </Box>

      {/* Content */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Label */}
        <Typography
          sx={{
            fontSize: "0.875rem",
            fontWeight: ds.typography.fontWeight.medium,
            color: ds.colors.text.secondary,
            mb: ds.spacing["1"],
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </Typography>

        {/* Value */}
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: ds.spacing["1"],
            mb: ds.spacing["1"],
          }}
        >
          <Typography
            sx={{
              fontSize: "2.25rem",
              fontWeight: ds.typography.fontWeight.bold,
              background: ds.gradients.primary,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
            }}
          >
            {loading ? "..." : value}
          </Typography>

          {unit && (
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: ds.typography.fontWeight.medium,
                color: ds.colors.text.secondary,
              }}
            >
              {unit}
            </Typography>
          )}
        </Box>

        {/* Trend & Sparkline */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Trend */}
          {hasTrend && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: ds.spacing["1"],
                px: ds.spacing["2"],
                py: ds.spacing["1"],
                borderRadius: `${ds.borderRadius.sm}px`,
                backgroundColor: alpha(
                  trendDirection === "up"
                    ? ds.colors.success.main
                    : ds.colors.error.main,
                  0.1,
                ),
              }}
            >
              <TrendIcon
                sx={{
                  fontSize: 16,
                  color:
                    trendDirection === "up"
                      ? ds.colors.success.main
                      : ds.colors.error.main,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: ds.typography.fontWeight.semibold,
                  color:
                    trendDirection === "up"
                      ? ds.colors.success.main
                      : ds.colors.error.main,
                }}
              >
                {Math.abs(trend).toFixed(1)}%
              </Typography>
            </Box>
          )}

          {/* Sparkline (simple SVG) */}
          {sparklineData && sparklineData.length > 0 && (
            <Box sx={{ flex: 1, maxWidth: 100, ml: "auto" }}>
              <svg
                width="100%"
                height="30"
                viewBox="0 0 100 30"
                preserveAspectRatio="none"
              >
                <polyline
                  fill="none"
                  stroke={colorScheme.main}
                  strokeWidth="2"
                  points={sparklineData
                    .map((value, index) => {
                      const x = (index / (sparklineData.length - 1)) * 100;
                      const max = Math.max(...sparklineData);
                      const min = Math.min(...sparklineData);
                      const y = 30 - ((value - min) / (max - min || 1)) * 30;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />
              </svg>
            </Box>
          )}
        </Box>
      </Box>
    </CardV2>
  );
};

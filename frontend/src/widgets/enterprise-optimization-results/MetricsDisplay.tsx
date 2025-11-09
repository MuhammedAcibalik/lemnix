/**
 * @fileoverview Metrics Display Component for Enterprise Optimization Results
 * @module MetricsDisplay
 * @version 1.0.0
 */

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Stack,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
  Science as ScienceIcon,
} from "@mui/icons-material";
import { OptimizationMetrics } from "./types";
import {
  formatPercentage,
  formatCurrency,
  formatDuration,
  getEfficiencyColor,
  getWasteColor,
} from "./utils";

interface MetricsDisplayProps {
  metrics: OptimizationMetrics;
  executionTime: number;
  algorithm: string;
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  metrics,
  executionTime,
  algorithm,
}) => {
  const metricCards = [
    {
      title: "Verimlilik",
      value: formatPercentage(metrics.efficiency),
      icon: CheckIcon,
      color: getEfficiencyColor(metrics.efficiency),
      progress: metrics.efficiency,
      description: "Malzeme kullanım oranı",
    },
    {
      title: "Fire Oranı",
      value: formatPercentage(metrics.wastePercentage),
      icon: TrendingUpIcon,
      color: getWasteColor(metrics.wastePercentage),
      progress: 100 - metrics.wastePercentage,
      description: "Fire malzeme yüzdesi",
    },
    {
      title: "Maliyet Tasarrufu",
      value: formatCurrency(metrics.costSavings),
      icon: MoneyIcon,
      color: "#4caf50",
      progress: Math.min(100, (metrics.costSavings / 1000) * 100),
      description: "Tahmini tasarruf miktarı",
    },
    {
      title: "Zaman Tasarrufu",
      value: formatDuration(metrics.timeSavings),
      icon: SpeedIcon,
      color: "#2196f3",
      progress: Math.min(100, (metrics.timeSavings / 10000) * 100),
      description: "Tahmini zaman tasarrufu",
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      {/* Algorithm Info */}
      <Card
        sx={{
          mb: 3,
          background:
            "linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(29,78,216,0.05) 100%)",
        }}
      >
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <ScienceIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                {algorithm} Algoritması
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Çalışma süresi: {formatDuration(executionTime)}
              </Typography>
            </Box>
            <Chip
              label="Enterprise Grade"
              color="primary"
              variant="outlined"
              size="small"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <Grid container spacing={3}>
        {metricCards.map((metric, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                height: "100%",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
                border: `2px solid ${metric.color}20`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 32px ${metric.color}30`,
                  border: `2px solid ${metric.color}40`,
                },
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: `${metric.color}20`,
                      color: metric.color,
                      width: 48,
                      height: 48,
                    }}
                  >
                    <metric.icon sx={{ fontSize: 24 }} />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color={metric.color}
                    >
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.title}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      İlerleme
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      color={metric.color}
                    >
                      {formatPercentage(metric.progress)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={metric.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: `${metric.color}20`,
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: metric.color,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  {metric.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

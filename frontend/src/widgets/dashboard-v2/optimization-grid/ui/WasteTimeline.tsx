/**
 * Waste Timeline Chart
 * Area chart showing waste reduction over time
 *
 * @module widgets/dashboard-v2/optimization-grid
 * @version 1.0.0 - Design System v2.0 Compliant
 */

import React, { useMemo } from "react";
import { Box, Typography, Chip, alpha } from "@mui/material";
import { Line } from "react-chartjs-2";
import { CardV2 } from "@/shared";
import { useDesignSystem } from "@/shared/hooks";
import type { ChartOptions } from "chart.js";

/**
 * Props
 */
export interface WasteTimelineProps {
  readonly data: ReadonlyArray<{
    readonly date: string;
    readonly totalWaste: number; // meters
    readonly wastePercentage: number; // 0-100
  }>;
  readonly loading?: boolean;
}

/**
 * Waste Timeline Chart
 * Shows waste reduction trend
 */
export const WasteTimeline: React.FC<WasteTimelineProps> = ({
  data,
  loading = false,
}) => {
  const ds = useDesignSystem();

  const totalWasteSaved = useMemo(() => {
    if (data.length === 0) return 0;
    return data.reduce((sum, item) => sum + item.totalWaste, 0);
  }, [data]);

  const avgWastePercentage = useMemo(() => {
    if (data.length === 0) return 0;
    return (
      data.reduce((sum, item) => sum + item.wastePercentage, 0) / data.length
    );
  }, [data]);

  const chartData = useMemo(
    () => ({
      labels: data.map((item) =>
        new Date(item.date).toLocaleDateString("tr-TR", {
          month: "short",
          day: "numeric",
        }),
      ),
      datasets: [
        {
          label: "Fire Oranı (%)",
          data: data.map((item) => item.wastePercentage),
          borderColor: ds.colors.error.main,
          backgroundColor: `${ds.colors.error.main}30`,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: ds.colors.error.main,
          pointBorderColor: "white",
          pointBorderWidth: 2,
        },
      ],
    }),
    [data, ds],
  );

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 0,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: ds.colors.neutral[800],
          titleColor: "white",
          bodyColor: "white",
          padding: 8,
          borderRadius: 6,
          callbacks: {
            label: (context) => `Fire: ${(context.parsed.y ?? 0).toFixed(2)}%`,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 10,
            },
            color: ds.colors.text.secondary,
            padding: 4,
          },
        },
        y: {
          beginAtZero: true,
          max: 20, // Most waste will be < 20%
          grid: {
            color: ds.colors.neutral[200],
          },
          ticks: {
            font: {
              size: 10,
            },
            color: ds.colors.text.secondary,
            callback: (value) => `${value}%`,
            padding: 4,
          },
        },
      },
    }),
    [ds],
  );

  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing["1"], height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: ds.spacing["1"],
        }}
      >
        <Typography
          sx={{
            fontSize: "0.9375rem",
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
          }}
        >
          Fire Analizi
        </Typography>

        <Chip
          label={`Ort. ${avgWastePercentage.toFixed(1)}%`}
          size="small"
          sx={{
            height: 22,
            fontSize: "0.6875rem",
            fontWeight: 600,
            background: alpha(ds.colors.error.main, 0.1),
            color: ds.colors.error.main,
          }}
        />
      </Box>

      {/* Total Saved */}
      <Typography
        sx={{
          fontSize: "0.625rem",
          color: ds.colors.text.secondary,
          mb: ds.spacing["1"],
        }}
      >
        Toplam tasarruf:{" "}
        <Box
          component="span"
          sx={{ fontWeight: 600, color: ds.colors.success.main }}
        >
          {totalWasteSaved.toFixed(0)}m
        </Box>
      </Typography>

      {/* Chart */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 280,
          }}
        >
          <Typography color="text.secondary">Yükleniyor...</Typography>
        </Box>
      ) : (
        <Box sx={{ height: 280 }}>
          <Line data={chartData} options={options} />
        </Box>
      )}
    </CardV2>
  );
};

/**
 * Algorithm Comparison Chart
 * Bar chart comparing algorithm performance
 *
 * @module widgets/dashboard-v2/optimization-grid
 * @version 1.0.0 - Design System v2.0 Compliant
 */

import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { CardV2 } from "@/shared";
import { useDesignSystem } from "@/shared/hooks";
import type { AlgorithmPerformanceStats } from "@/entities/dashboard";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

/**
 * Props
 */
export interface AlgoComparisonChartProps {
  readonly data: ReadonlyArray<AlgorithmPerformanceStats>;
  readonly loading?: boolean;
}

/**
 * Algorithm Comparison Chart
 * Compares efficiency across algorithms
 */
export const AlgoComparisonChart: React.FC<AlgoComparisonChartProps> = ({
  data,
  loading = false,
}) => {
  const ds = useDesignSystem();

  const chartData = useMemo(
    () => ({
      labels: data.map((item) => {
        const names: Record<string, string> = {
          ffd: "FFD",
          bfd: "BFD",
          genetic: "Genetic",
          pooling: "Pooling",
        };
        return names[item.algorithm] || item.algorithm;
      }),
      datasets: [
        {
          label: "Verimlilik (%)",
          data: data.map((item) => item.avgEfficiency),
          backgroundColor: ds.colors.primary.main,
          borderRadius: 8,
          barThickness: 40,
        },
        {
          label: "Atık (%)",
          data: data.map((item) => item.avgWastePercentage),
          backgroundColor: ds.colors.error[300],
          borderRadius: 8,
          barThickness: 40,
        },
      ],
    }),
    [data, ds],
  );

  const options: ChartOptions<"bar"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 0,
      },
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: {
            font: {
              size: 11,
              weight: 600,
            },
            color: ds.colors.text.primary,
            padding: 8,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: ds.colors.neutral[800],
          titleColor: "white",
          bodyColor: "white",
          padding: 8,
          borderRadius: 6,
          displayColors: true,
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
              weight: 600,
            },
            color: ds.colors.text.secondary,
            padding: 4,
          },
        },
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: ds.colors.neutral[200],
            drawTicks: false,
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
      <Typography
        sx={{
          fontSize: "0.9375rem",
          fontWeight: ds.typography.fontWeight.semibold,
          color: ds.colors.text.primary,
          mb: ds.spacing["1"],
        }}
      >
        Algoritma Karşılaştırması
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 320,
          }}
        >
          <Typography color="text.secondary">Yükleniyor...</Typography>
        </Box>
      ) : (
        <Box sx={{ height: 320 }}>
          <Bar data={chartData} options={options} />
        </Box>
      )}
    </CardV2>
  );
};

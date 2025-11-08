/**
 * Cost Breakdown Chart Component
 * Stacked bar chart showing cost components
 * 
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import { Box, Typography, Stack, Chip, alpha } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { CardV2 } from '@/shared';
import { useDesignSystem } from '@/shared/hooks';
import type { CostBreakdownData } from './utils';
import { formatCurrency } from './utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export interface CostBreakdownChartProps {
  readonly costData: CostBreakdownData;
}

/**
 * Cost Breakdown Chart
 * Stacked bar showing cost components
 */
export const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({ costData }) => {
  const ds = useDesignSystem();

  const chartData = useMemo(
    () => ({
      labels: ['Maliyet Dağılımı'],
      datasets: [
        {
          label: 'Materyal',
          data: [costData.materialCost],
          backgroundColor: alpha(ds.colors.primary.main, 0.8),
          borderColor: ds.colors.primary.main,
          borderWidth: 1,
        },
        {
          label: 'İşçilik',
          data: [costData.laborCost],
          backgroundColor: alpha(ds.colors.success.main, 0.8),
          borderColor: ds.colors.success.main,
          borderWidth: 1,
        },
        {
          label: 'Fire',
          data: [costData.wasteCost],
          backgroundColor: alpha(ds.colors.error.main, 0.8),
          borderColor: ds.colors.error.main,
          borderWidth: 1,
        },
        {
          label: 'Kurulum',
          data: [costData.setupCost],
          backgroundColor: alpha(ds.colors.warning.main, 0.8),
          borderColor: ds.colors.warning.main,
          borderWidth: 1,
        },
        {
          label: 'Kesim',
          data: [costData.cuttingCost],
          backgroundColor: alpha(ds.colors.accent.main, 0.8),
          borderColor: ds.colors.accent.main,
          borderWidth: 1,
        },
      ].filter(dataset => dataset.data[0] > 0), // Only show non-zero costs
    }),
    [costData, ds]
  );

  const options: ChartOptions<'bar'> = useMemo(
    () => ({
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
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
          titleColor: 'white',
          bodyColor: 'white',
          padding: 12,
          borderRadius: 6,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.x || 0;
              const percentage = ((value / costData.totalCost) * 100).toFixed(1);
              return `${label}: ${formatCurrency(value)} (${percentage}%)`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 10,
            },
            color: ds.colors.text.secondary,
            callback: (value) => formatCurrency(Number(value)),
          },
        },
        y: {
          stacked: true,
          display: false,
        },
      },
    }),
    [ds, costData]
  );

  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing['4'], height: '100%' }}>
      {/* Header */}
        <Typography
          sx={{
            fontSize: '1.125rem',
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
            mb: ds.spacing['2'],
          }}
        >
        Maliyet Dağılımı
      </Typography>

      {/* Chart */}
      <Box sx={{ height: 240, mb: ds.spacing['3'] }}>
        <Bar data={chartData} options={options} />
      </Box>

      {/* Summary */}
      <Stack direction="row" spacing={ds.spacing['2']} sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: ds.spacing['1'] }}>
        <Chip
          label={`Toplam: ${formatCurrency(costData.totalCost)}`}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.6875rem',
            fontWeight: 700,
            backgroundColor: alpha(ds.colors.primary.main, 0.1),
            color: ds.colors.primary.main,
          }}
        />
        <Chip
          label={`Metre Başı: ${formatCurrency(costData.costPerMeter)}`}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.6875rem',
            fontWeight: 600,
            backgroundColor: alpha(ds.colors.neutral[600], 0.1),
            color: ds.colors.neutral[700],
          }}
        />
      </Stack>
    </CardV2>
  );
};


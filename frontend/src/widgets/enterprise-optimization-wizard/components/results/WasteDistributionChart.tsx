/**
 * Waste Distribution Chart Component
 * Doughnut chart showing waste by category
 * 
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import { Box, Typography, Stack, Chip, alpha } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from 'chart.js';
import { CardV2 } from '@/shared';
import { useDesignSystem } from '@/shared/hooks';
import type { WasteDistribution } from './utils';
import { aggregateWasteByCategory } from './utils';

ChartJS.register(ArcElement, Tooltip, Legend);

export interface WasteDistributionChartProps {
  readonly wasteDistribution: WasteDistribution;
}

/**
 * Waste Distribution Chart
 * Shows waste breakdown by size category
 */
export const WasteDistributionChart: React.FC<WasteDistributionChartProps> = ({ wasteDistribution }) => {
  const ds = useDesignSystem();

  const wasteCategoryData = useMemo(() => aggregateWasteByCategory(wasteDistribution), [wasteDistribution]);

  const chartData = useMemo(
    () => ({
      labels: wasteCategoryData.map((w) => w.category),
      datasets: [
        {
          label: 'Fire Parçaları',
          data: wasteCategoryData.map((w) => w.count),
          backgroundColor: wasteCategoryData.map((w) => alpha(w.color, 0.8)),
          borderColor: wasteCategoryData.map((w) => w.color),
          borderWidth: 2,
        },
      ],
    }),
    [wasteCategoryData]
  );

  const options: ChartOptions<'doughnut'> = useMemo(
    () => ({
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
            padding: 12,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: ds.colors.neutral[800],
          titleColor: 'white',
          bodyColor: 'white',
          padding: 12,
          borderRadius: 6,
          displayColors: true,
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              const percentage = wasteCategoryData[context.dataIndex]?.percentage.toFixed(1) || '0';
              return `${label}: ${value} adet (${percentage}%)`;
            },
          },
        },
      },
    }),
    [ds, wasteCategoryData]
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
        Fire Dağılımı
      </Typography>

      {/* Chart */}
      <Box sx={{ height: 280, mb: ds.spacing['3'] }}>
        <Doughnut data={chartData} options={options} />
      </Box>

      {/* Summary Stats */}
      <Stack direction="row" spacing={ds.spacing['2']} sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: ds.spacing['1'] }}>
        <Chip
          label={`Toplam: ${wasteDistribution.totalPieces || 0} parça`}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.6875rem',
            fontWeight: 600,
            backgroundColor: alpha(ds.colors.neutral[600], 0.1),
            color: ds.colors.neutral[700],
          }}
        />
        <Chip
          label={`Geri Kazanılabilir: ${wasteDistribution.reclaimable || 0}`}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.6875rem',
            fontWeight: 600,
            backgroundColor: alpha(ds.colors.success.main, 0.1),
            color: ds.colors.success.main,
          }}
        />
      </Stack>
    </CardV2>
  );
};


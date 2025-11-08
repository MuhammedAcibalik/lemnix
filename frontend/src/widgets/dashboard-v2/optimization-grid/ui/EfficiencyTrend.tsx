/**
 * Efficiency Trend Chart
 * Line chart showing efficiency over time
 * 
 * @module widgets/dashboard-v2/optimization-grid
 * @version 1.0.0 - Design System v2.0 Compliant
 */

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  type ChartOptions
} from 'chart.js';
import { CardV2 } from '@/shared';
import { useDesignSystem } from '@/shared/hooks';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

/**
 * Props
 */
export interface EfficiencyTrendProps {
  readonly data: ReadonlyArray<{
    readonly date: string;
    readonly ffd: number;
    readonly bfd: number;
    readonly genetic: number;
    readonly pooling: number;
  }>;
  readonly loading?: boolean;
}

/**
 * Efficiency Trend Chart
 * Multi-line chart for algorithm efficiency over time
 */
export const EfficiencyTrend: React.FC<EfficiencyTrendProps> = ({
  data,
  loading = false
}) => {
  const ds = useDesignSystem();
  
  const chartData = useMemo(() => ({
    labels: data.map(item => new Date(item.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Genetic',
        data: data.map(item => item.genetic),
        borderColor: ds.colors.primary.main,
        backgroundColor: `${ds.colors.primary.main}20`,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'BFD',
        data: data.map(item => item.bfd),
        borderColor: ds.colors.success.main,
        backgroundColor: `${ds.colors.success.main}20`,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'FFD',
        data: data.map(item => item.ffd),
        borderColor: ds.colors.warning.main,
        backgroundColor: `${ds.colors.warning.main}20`,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Pooling',
        data: data.map(item => item.pooling),
        borderColor: ds.colors.neutral[600],
        backgroundColor: `${ds.colors.neutral[600]}20`,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  }), [data, ds]);
  
  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          font: {
            size: 11,
            weight: 600
          },
          color: ds.colors.text.primary,
          padding: 8,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: ds.colors.neutral[800],
        titleColor: 'white',
        bodyColor: 'white',
        padding: 8,
        borderRadius: 6,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          },
          color: ds.colors.text.secondary,
          padding: 4,
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: ds.colors.neutral[200],
        },
        ticks: {
          font: {
            size: 10
          },
          color: ds.colors.text.secondary,
          callback: (value) => `${value}%`,
          padding: 4,
        }
      }
    }
  }), [ds]);
  
  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing['1'], height: '100%' }}>
      <Typography
        sx={{
          fontSize: '0.9375rem',
          fontWeight: ds.typography.fontWeight.semibold,
          color: ds.colors.text.primary,
          mb: ds.spacing['1'],
        }}
      >
        Verimlilik Trendi (Son 7 Gün)
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
          <Typography color="text.secondary">Yükleniyor...</Typography>
        </Box>
      ) : (
        <Box sx={{ height: 330 }}>
          <Line data={chartData} options={options} />
        </Box>
      )}
    </CardV2>
  );
};


/**
 * Cost Savings Chart
 * Area chart showing cost savings over time
 * 
 * @module widgets/dashboard-v2/optimization-grid
 * @version 1.0.0 - Design System v2.0 Compliant
 */

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { CardV2 } from '@/shared';
import { useDesignSystem } from '@/shared/hooks';
import type { ChartOptions } from 'chart.js';

/**
 * Props
 */
export interface CostSavingsProps {
  readonly data: ReadonlyArray<{
    readonly date: string;
    readonly amount: number; // currency
  }>;
  readonly totalSaved: number;
  readonly loading?: boolean;
}

/**
 * Cost Savings Chart
 * Shows cumulative cost savings
 */
export const CostSavings: React.FC<CostSavingsProps> = ({
  data,
  totalSaved,
  loading = false
}) => {
  const ds = useDesignSystem();
  
  // Calculate cumulative savings
  const cumulativeData = useMemo(() => {
    let cumulative = 0;
    return data.map(item => {
      cumulative += item.amount;
      return cumulative;
    });
  }, [data]);
  
  const chartData = useMemo(() => ({
    labels: data.map(item => new Date(item.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Kümülatif Tasarruf (₺)',
        data: cumulativeData,
        borderColor: ds.colors.success.main,
        backgroundColor: `${ds.colors.success.main}30`,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: ds.colors.success.main,
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      }
    ]
  }), [data, cumulativeData, ds]);
  
  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: ds.colors.neutral[800],
        titleColor: 'white',
        bodyColor: 'white',
        padding: 8,
        borderRadius: 6,
        callbacks: {
          label: (context) => `${context.parsed.y.toLocaleString('tr-TR')} ₺`
        }
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
        grid: {
          color: ds.colors.neutral[200],
        },
        ticks: {
          font: {
            size: 10
          },
          color: ds.colors.text.secondary,
          callback: (value) => `${(value as number).toLocaleString('tr-TR')} ₺`,
          padding: 4,
        }
      }
    }
  }), [ds]);
  
  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing['1'], height: '100%' }}>
      {/* Header */}
      <Typography
        sx={{
          fontSize: '0.9375rem',
          fontWeight: ds.typography.fontWeight.semibold,
          color: ds.colors.text.primary,
          mb: ds.spacing['1'],
        }}
      >
        Maliyet Tasarrufu
      </Typography>
      
      {/* Total */}
      <Typography
        sx={{
          fontSize: '1.25rem',
          fontWeight: ds.typography.fontWeight.bold,
          color: ds.colors.success.main,
          mb: ds.spacing['1'],
        }}
      >
        {totalSaved.toLocaleString('tr-TR')} ₺
      </Typography>
      
      {/* Chart */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
          <Typography color="text.secondary">Yükleniyor...</Typography>
        </Box>
      ) : (
        <Box sx={{ height: 240 }}>
          <Line data={chartData} options={options} />
        </Box>
      )}
    </CardV2>
  );
};


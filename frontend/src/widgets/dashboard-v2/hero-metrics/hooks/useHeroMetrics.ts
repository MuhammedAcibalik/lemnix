/**
 * Hero Metrics Hook
 * Business logic for hero metrics calculation and formatting
 * 
 * @module widgets/dashboard-v2/hero-metrics
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { 
  useHeroMetrics as useHeroMetricsQuery,
  type DashboardHeroMetrics,
  type DashboardMetricsOptions
} from '@/entities/dashboard';

/**
 * Formatted hero metric for UI display
 */
export interface FormattedHeroMetric {
  readonly id: string;
  readonly label: string;
  readonly value: string | number;
  readonly unit?: string;
  readonly trend?: number;
  readonly sparklineData?: ReadonlyArray<number>;
  readonly color: 'primary' | 'success' | 'warning' | 'error';
}

/**
 * Hero metrics with formatting
 */
export function useHeroMetrics(options?: DashboardMetricsOptions) {
  const { data, isLoading, error } = useHeroMetricsQuery(options);
  
  const formattedMetrics = useMemo<ReadonlyArray<FormattedHeroMetric>>(() => {
    if (!data) return [];
    
    return [
      {
        id: 'active-optimizations',
        label: 'Aktif Optimizasyonlar',
        value: data.activeOptimizations,
        unit: 'adet',
        color: 'primary' as const,
        trend: undefined, // No trend for real-time count
      },
      {
        id: 'cutting-lists',
        label: 'Bu Hafta Listeler',
        value: data.cuttingListsThisWeek,
        unit: 'liste',
        color: 'success' as const,
        trend: calculateWeeklyTrend(data.cuttingListsThisWeek),
      },
      {
        id: 'avg-efficiency',
        label: 'Ortalama Verimlilik',
        value: data.averageEfficiency.toFixed(1),
        unit: '%',
        color: data.averageEfficiency >= 90 ? 'success' : data.averageEfficiency >= 80 ? 'warning' : 'error',
        sparklineData: data.efficiencyTrend,
        trend: calculateTrend(data.efficiencyTrend),
      },
      {
        id: 'waste-saved',
        label: 'Toplam Fire Tasarrufu',
        value: formatWaste(data.totalWasteSaved),
        unit: 'm',
        color: 'success' as const,
        sparklineData: data.wasteTrend,
        trend: calculateTrend(data.wasteTrend),
      },
    ];
  }, [data]);
  
  return {
    metrics: formattedMetrics,
    isLoading,
    error,
    raw: data
  };
}

/**
 * Calculate trend from time series data
 * Returns percentage change from first to last value
 */
function calculateTrend(data?: ReadonlyArray<number>): number | undefined {
  if (!data || data.length < 2) return undefined;
  
  const first = data[0];
  const last = data[data.length - 1];
  
  if (first === 0) return undefined;
  
  return ((last - first) / first) * 100;
}

/**
 * Calculate weekly trend (simple heuristic)
 */
function calculateWeeklyTrend(currentWeek: number): number | undefined {
  // In real implementation, compare with previous week
  // For now, return undefined (no historical data)
  return undefined;
}

/**
 * Format waste value
 */
function formatWaste(meters: number): string {
  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + 'k';
  }
  return meters.toFixed(0);
}


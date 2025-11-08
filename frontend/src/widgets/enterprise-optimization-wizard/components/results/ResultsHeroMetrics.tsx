/**
 * Results Hero Metrics Component
 * Enhanced KPI cards for optimization results
 * 
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React from 'react';
import { Box, Typography, Grid, Chip, Tooltip, alpha } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  DeleteOutline as WasteIcon,
  Inventory as StockIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { CardV2 } from '@/shared';
import { useDesignSystem } from '@/shared/hooks';
import type { ResultsComponentProps } from './types';
import { formatCurrency } from './utils';
import { ProfileBadge } from './ProfileBadge';

/**
 * Results Hero Metrics
 * Display key optimization metrics with visual enhancements
 */
export const ResultsHeroMetrics: React.FC<ResultsComponentProps> = ({ result, loading = false }) => {
  const ds = useDesignSystem();

  // Type-safe access to result properties
  const efficiency = result.efficiency || (result as {totalEfficiency?: number}).totalEfficiency || 0;
  const wastePercentage = result.wastePercentage || 0;
  const wasteDistribution = (result as {wasteDistribution?: {reclaimable?: number}}).wasteDistribution;
  const stockCount = (result as {stockCount?: number}).stockCount || (result as {totalStocks?: number}).totalStocks || result.cuts?.length || 0;
  const costBreakdown = (result as {costBreakdown?: {materialCost?: number}}).costBreakdown;
  
  // Profile information
  const metadata = (result as { metadata?: {
    profile?: {
      profileId: string;
      profileCode: string;
      profileName: string;
      source: 'mapping' | 'fallback';
      stockLengths: number[];
    };
  }}).metadata;
  const profileInfo = metadata?.profile;
  
  console.log('[ResultsHeroMetrics] 🔍 Profile Debug:', {
    hasMetadata: !!metadata,
    hasProfileInfo: !!profileInfo,
    profileInfo
  });
  
  const cuts = result.cuts || [];
  const avgSegmentsPerStock = cuts.length > 0 
    ? cuts.reduce((sum: number, c) => sum + ((c as {segments?: unknown[]}).segments?.length || 1), 0) / cuts.length 
    : 0;

  const metrics = [
    {
      id: 'efficiency',
      label: 'Verimlilik',
      value: efficiency.toFixed(1),
      unit: '%',
      icon: TrendingUpIcon,
      color: ds.colors.success.main,
      bgColor: alpha(ds.colors.success.main, 0.1),
      preview: `Materyal kullanımı`,
      trend: efficiency >= 90 ? 'excellent' : 'good',
    },
    {
      id: 'waste',
      label: 'Atık Oranı',
      value: wastePercentage.toFixed(1),
      unit: '%',
      icon: WasteIcon,
      color: wastePercentage < 5 ? ds.colors.success.main : ds.colors.warning.main,
      bgColor: alpha(wastePercentage < 5 ? ds.colors.success.main : ds.colors.warning.main, 0.1),
      preview: wasteDistribution ? 
        `${wasteDistribution.reclaimable || 0} geri kazanılabilir` : 
        'Fire detayları',
      trend: wastePercentage < 5 ? 'excellent' : 'average',
    },
    {
      id: 'stocks',
      label: 'Toplam Stok',
      value: stockCount,
      unit: 'adet',
      icon: StockIcon,
      color: ds.colors.primary.main,
      bgColor: alpha(ds.colors.primary.main, 0.1),
      preview: cuts.length > 0 ? 
        `Ort. ${avgSegmentsPerStock.toFixed(1)} kesim/stok` : 
        'Kesim detayları',
      trend: 'good',
    },
    {
      id: 'cost',
      label: 'Toplam Maliyet',
      value: formatCurrency(result.totalCost || 0),
      unit: '',
      icon: MoneyIcon,
      color: ds.colors.accent.main,
      bgColor: alpha(ds.colors.accent.main, 0.1),
      preview: costBreakdown ? 
        `Materyal: ${formatCurrency(costBreakdown.materialCost || 0)}` : 
        'Maliyet detayları',
      trend: 'good',
    },
  ];

  return (
    <Box>
      {/* Profile Badge */}
      {profileInfo && (
        <Box sx={{ mb: ds.spacing['3'] }}>
          <ProfileBadge
            profileCode={profileInfo.profileCode}
            profileName={profileInfo.profileName}
            stockLengths={profileInfo.stockLengths}
            source={profileInfo.source}
          />
        </Box>
      )}

      {/* Metrics Grid */}
      <Grid container spacing={ds.spacing['3']} sx={{ mb: ds.spacing['4'] }}>
        {metrics.map((metric) => {
        const Icon = metric.icon;
        
        return (
          <Grid item xs={12} sm={6} lg={3} key={metric.id}>
            <Tooltip title={metric.preview} arrow placement="top">
              <Box>
                <CardV2
                  variant="glass"
                  hoverable
                  sx={{
                    p: ds.spacing['3'],
                    position: 'relative',
                    overflow: 'hidden',
                    height: 140,
                    transition: ds.transitions.base,
                    border: `1px solid ${alpha(metric.color, 0.2)}`,
                  }}
                >
                  {/* Icon Background */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      opacity: 0.1,
                    }}
                  >
                    <Icon sx={{ fontSize: 80, color: metric.color }} />
                  </Box>

                  {/* Content */}
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    {/* Label */}
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: ds.typography.fontWeight.medium,
                        color: ds.colors.text.secondary,
                        mb: ds.spacing['1'],
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {metric.label}
                    </Typography>

                    {/* Value */}
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: ds.spacing['1'], mb: ds.spacing['2'] }}>
                      <Typography
                        sx={{
                          fontSize: '2rem',
                          fontWeight: ds.typography.fontWeight.bold,
                          color: metric.color,
                          lineHeight: 1,
                        }}
                      >
                        {loading ? '...' : metric.value}
                      </Typography>
                      {metric.unit && (
                        <Typography
                          sx={{
                            fontSize: '0.875rem',
                            fontWeight: ds.typography.fontWeight.medium,
                            color: ds.colors.text.secondary,
                          }}
                        >
                          {metric.unit}
                        </Typography>
                      )}
                    </Box>

                    {/* Preview Chip */}
                    {metric.preview && (
                      <Chip
                        label={metric.preview}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          backgroundColor: metric.bgColor,
                          color: metric.color,
                          border: `1px solid ${alpha(metric.color, 0.2)}`,
                        }}
                      />
                    )}
                  </Box>
                </CardV2>
              </Box>
            </Tooltip>
          </Grid>
        );
      })}
      </Grid>
    </Box>
  );
};


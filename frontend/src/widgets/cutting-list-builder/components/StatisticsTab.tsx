/**
 * @fileoverview Modern Statistics Tab - Compact & Meaningful
 * @module StatisticsTab
 * @version 2.0.0 - Design System v2 Compliant
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

// Design System v2.0
import { useDesignSystem } from '@/shared/hooks';
import { CardV2, FadeIn, ScaleIn } from '@/shared';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface StatisticsTabProps {
  cuttingListId?: string;
  cuttingListStats?: {
    totalSections: number;
    totalItems: number;
    totalProfiles: number;
    completedItems: number;
    efficiency: number;
    totalQuantity: number;
  } | null;
}

// ============================================================================
// COMPACT STAT COMPONENT
// ============================================================================

interface CompactStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'error';
  ds: ReturnType<typeof useDesignSystem>;
}

const CompactStat: React.FC<CompactStatProps> = ({ 
  icon, 
  label, 
  value, 
  trend = 'neutral',
  color = 'primary',
  ds 
}) => {
  const colorMap = {
    primary: ds.colors.primary.main,
    success: ds.colors.success.main,
    warning: ds.colors.warning.main,
    error: ds.colors.error.main,
  };

  const trendColor = trend === 'up' ? ds.colors.success.main : 
                    trend === 'down' ? ds.colors.error.main : 
                    ds.colors.neutral[500];

  return (
    <ScaleIn delay={100}>
      <CardV2 
        variant="glass" 
        sx={{ 
          p: ds.spacing['3'],
          textAlign: 'center',
          transition: ds.transitions.base,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: ds.shadows.soft.md,
          }
        }}
      >
        <Stack spacing={ds.spacing['2']} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: `${ds.borderRadius.md}px`,
              background: alpha(colorMap[color], 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colorMap[color],
            }}
          >
            {icon}
          </Box>
          
          <Box>
            <Typography
              sx={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: ds.colors.text.primary,
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.875rem',
                color: ds.colors.text.secondary,
                fontWeight: 500,
              }}
            >
              {label}
            </Typography>
          </Box>
        </Stack>
      </CardV2>
    </ScaleIn>
  );
  };

  // ============================================================================
// MAIN COMPONENT
  // ============================================================================
  
export const StatisticsTab: React.FC<StatisticsTabProps> = ({ 
  cuttingListId, 
  cuttingListStats 
}) => {
  const ds = useDesignSystem();

  // Calculate derived stats
  const derivedStats = useMemo(() => {
    if (!cuttingListStats) return null;

    const completionRate = cuttingListStats.totalItems > 0 
      ? Math.round((cuttingListStats.completedItems / cuttingListStats.totalItems) * 100)
      : 0;

    const avgItemsPerSection = cuttingListStats.totalSections > 0
      ? Math.round(cuttingListStats.totalItems / cuttingListStats.totalSections)
      : 0;

    return {
      completionRate,
      avgItemsPerSection,
      efficiency: Math.round(cuttingListStats.efficiency * 100),
    };
  }, [cuttingListStats]);

  const handleViewDetailedStats = () => {
    // Navigate to full statistics page
    window.open('/statistics', '_blank');
  };

  if (!cuttingListStats || !derivedStats) {
    return (
      <FadeIn>
        <CardV2 variant="glass" sx={{ p: ds.spacing['4'], textAlign: 'center' }}>
          <Box sx={{ mb: ds.spacing['4'] }}>
            <AssessmentIcon 
              sx={{ 
                fontSize: 48, 
                color: ds.colors.neutral[400],
                mb: ds.spacing['3']
              }} 
            />
            <Typography
              sx={{
                color: ds.colors.text.primary,
                fontSize: '1.125rem',
                fontWeight: 600,
                mb: ds.spacing['1'],
              }}
            >
              Kesim Listesi İstatistikleri
            </Typography>
            <Typography
              sx={{
                color: ds.colors.text.secondary,
                fontSize: '0.875rem',
                mb: ds.spacing['4'],
              }}
            >
              İstatistikleri görüntülemek için önce bir kesim listesi oluşturun
            </Typography>
            
            {/* Demo Stats Preview */}
            <Stack direction="row" spacing={ds.spacing['3']} sx={{ mb: ds.spacing['4'] }}>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: ds.colors.neutral[300] }}>
                  0
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: ds.colors.neutral[500] }}>
                  Ürün Grubu
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: ds.colors.neutral[300] }}>
                  0
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: ds.colors.neutral[500] }}>
                  İş Emri
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: ds.colors.neutral[300] }}>
                  0%
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: ds.colors.neutral[500] }}>
                  Verimlilik
                </Typography>
              </Box>
            </Stack>
          </Box>
        </CardV2>
      </FadeIn>
    );
  }
  
  return (
    <FadeIn>
      <Stack spacing={ds.spacing['4']}>
      {/* Header */}
        <CardV2 
          variant="glass" 
          sx={{ 
            p: ds.spacing['2'],
            border: `1px solid ${ds.colors.neutral[300]}`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: ds.colors.text.primary,
                  mb: ds.spacing['1'],
                }}
              >
                Kesim Listesi İstatistikleri
            </Typography>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: ds.colors.text.secondary,
                }}
              >
                Genel bakış ve performans metrikleri
          </Typography>
          </Box>
          
            <Tooltip title="Detaylı İstatistikler" arrow>
              <IconButton
                onClick={handleViewDetailedStats}
                sx={{
                  background: alpha(ds.colors.primary.main, 0.1),
                  color: ds.colors.primary.main,
                  borderRadius: `${ds.borderRadius.md}px`,
                  '&:hover': {
                    background: alpha(ds.colors.primary.main, 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: ds.transitions.fast,
                }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardV2>

        {/* Stats Grid */}
        <Stack direction="row" spacing={ds.spacing['3']}>
          {/* Left Column */}
          <Stack spacing={ds.spacing['3']} sx={{ flex: 1 }}>
            <CompactStat
              icon={<AssessmentIcon />}
              label="Toplam Bölüm"
              value={cuttingListStats.totalSections}
              color="primary"
              ds={ds}
            />
            
            <CompactStat
              icon={<TimelineIcon />}
              label="Tamamlanan"
              value={`${cuttingListStats.completedItems}/${cuttingListStats.totalItems}`}
              trend={derivedStats.completionRate > 80 ? 'up' : derivedStats.completionRate > 50 ? 'neutral' : 'down'}
              color="success"
              ds={ds}
            />
          </Stack>

          {/* Right Column */}
          <Stack spacing={ds.spacing['3']} sx={{ flex: 1 }}>
            <CompactStat
              icon={<BarChartIcon />}
              label="Verimlilik"
              value={`${derivedStats.efficiency}%`}
              trend={derivedStats.efficiency > 85 ? 'up' : derivedStats.efficiency > 70 ? 'neutral' : 'down'}
              color="success"
              ds={ds}
            />
            
            <CompactStat
              icon={<TrendingUpIcon />}
              label="Toplam Miktar"
              value={cuttingListStats.totalQuantity.toLocaleString()}
              color="warning"
              ds={ds}
            />
          </Stack>
        </Stack>

        {/* Summary Card */}
        <CardV2 variant="glass" sx={{ p: ds.spacing['4'] }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography
                sx={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: ds.colors.text.primary,
                  mb: ds.spacing['1'],
                }}
              >
                Özet
              </Typography>
              <Stack direction="row" spacing={ds.spacing['2']}>
                <Chip
                  label={`${derivedStats.completionRate}% Tamamlandı`}
                  size="small"
                  sx={{
                    background: derivedStats.completionRate > 80 
                      ? alpha(ds.colors.success.main, 0.1) 
                      : alpha(ds.colors.warning.main, 0.1),
                    color: derivedStats.completionRate > 80 
                      ? ds.colors.success.main 
                      : ds.colors.warning.main,
                    fontWeight: 600,
                    borderRadius: `${ds.borderRadius.sm}px`,
                  }}
                />
          <Chip
                  label={`${cuttingListStats.totalProfiles} Profil Türü`}
            size="small"
                  sx={{
                    background: alpha(ds.colors.primary.main, 0.1),
                    color: ds.colors.primary.main,
                    fontWeight: 600,
                    borderRadius: `${ds.borderRadius.sm}px`,
                  }}
                />
        </Stack>
      </Box>
          </Stack>
        </CardV2>
            </Stack>
    </FadeIn>
  );
};

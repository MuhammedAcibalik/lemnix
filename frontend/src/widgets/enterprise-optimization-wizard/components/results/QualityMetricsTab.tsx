/**
 * Quality Metrics Tab Component
 * Display quality scores and compliance metrics
 * 
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React from 'react';
import { Box, Typography, Grid, CircularProgress, alpha } from '@mui/material';
import { CardV2 } from '@/shared';
import { useDesignSystem } from '@/shared/hooks';
import { CheckCircle as CheckIcon, Warning as WarningIcon } from '@mui/icons-material';

export interface QualityMetricsTabProps {
  readonly qualityScore?: number;
  readonly materialUtilization: number;
  readonly cuttingComplexity?: number;
  readonly efficiency: number;
}

/**
 * Quality Metrics Tab
 * Quality score and compliance indicators
 */
export const QualityMetricsTab: React.FC<QualityMetricsTabProps> = ({
  qualityScore = 85,
  materialUtilization,
  cuttingComplexity = 50,
  efficiency,
}) => {
  const ds = useDesignSystem();

  const metrics = [
    {
      label: 'Kalite Skoru',
      value: qualityScore,
      unit: '/100',
      color: qualityScore >= 80 ? ds.colors.success.main : qualityScore >= 60 ? ds.colors.warning.main : ds.colors.error.main,
      icon: qualityScore >= 80 ? CheckIcon : WarningIcon,
    },
    {
      label: 'Materyal Kullanımı',
      value: materialUtilization,
      unit: '%',
      color: materialUtilization >= 90 ? ds.colors.success.main : ds.colors.primary.main,
      icon: CheckIcon,
    },
    {
      label: 'Kesim Karmaşıklığı',
      value: cuttingComplexity,
      unit: '/100',
      color: cuttingComplexity <= 50 ? ds.colors.success.main : ds.colors.warning.main,
      icon: cuttingComplexity <= 50 ? CheckIcon : WarningIcon,
    },
    {
      label: 'Verimlilik',
      value: efficiency,
      unit: '%',
      color: efficiency >= 90 ? ds.colors.success.main : ds.colors.warning.main,
      icon: CheckIcon,
    },
  ];

  return (
    <Box>
      <CardV2 variant="glass" sx={{ p: ds.spacing['4'] }}>
        <Typography
          sx={{
            fontSize: '1.125rem',
            fontWeight: ds.typography.fontWeight.bold,
            color: ds.colors.text.primary,
            mb: ds.spacing['4'],
          }}
        >
          Kalite Metrikleri
        </Typography>

        <Grid container spacing={ds.spacing['4']}>
          {metrics.map((metric) => {
            const Icon = metric.icon;
            
            return (
              <Grid item xs={12} sm={6} md={3} key={metric.label}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: ds.spacing['3'],
                    borderRadius: `${ds.borderRadius.lg}px`,
                    backgroundColor: alpha(metric.color, 0.05),
                    border: `1px solid ${alpha(metric.color, 0.2)}`,
                  }}
                >
                  {/* Icon */}
                  <Icon sx={{ fontSize: 32, color: metric.color, mb: ds.spacing['2'] }} />

                  {/* Label */}
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: ds.colors.text.secondary,
                      mb: ds.spacing['2'],
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {metric.label}
                  </Typography>

                  {/* Circular Progress */}
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: ds.spacing['2'] }}>
                    <CircularProgress
                      variant="determinate"
                      value={metric.value}
                      size={80}
                      thickness={6}
                      sx={{
                        color: metric.color,
                        '& .MuiCircularProgress-circle': {
                          strokeLinecap: 'round',
                        },
                      }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: metric.color,
                        }}
                      >
                        {metric.value.toFixed(0)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Unit */}
                  <Typography
                    sx={{
                      fontSize: '0.6875rem',
                      color: ds.colors.text.secondary,
                    }}
                  >
                    {metric.unit}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </CardV2>
    </Box>
  );
};


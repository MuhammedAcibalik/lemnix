/**
 * Waste Analysis Tab Component
 * Detailed waste analysis and insights
 * 
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React from 'react';
import { Box, Typography, Grid, Stack, Chip, LinearProgress, alpha } from '@mui/material';
import { CardV2 } from '@/shared';
import { useDesignSystem } from '@/shared/hooks';
import type { WasteDistribution } from './utils';
import { formatLength, getWasteCategoryColor, getWasteCategoryLabel } from './utils';

export interface WasteAnalysisTabProps {
  readonly wasteDistribution: WasteDistribution;
  readonly totalWaste: number;
  readonly wastePercentage: number;
}

/**
 * Waste Analysis Tab
 * Detailed waste breakdown and analysis
 */
export const WasteAnalysisTab: React.FC<WasteAnalysisTabProps> = ({
  wasteDistribution,
  totalWaste,
  wastePercentage,
}) => {
  const ds = useDesignSystem();

  const categories = [
    { key: 'minimal', label: getWasteCategoryLabel('minimal'), value: wasteDistribution.minimal || 0 },
    { key: 'small', label: getWasteCategoryLabel('small'), value: wasteDistribution.small || 0 },
    { key: 'medium', label: getWasteCategoryLabel('medium'), value: wasteDistribution.medium || 0 },
    { key: 'large', label: getWasteCategoryLabel('large'), value: wasteDistribution.large || 0 },
    { key: 'excessive', label: getWasteCategoryLabel('excessive'), value: wasteDistribution.excessive || 0 },
  ];

  const totalPieces = wasteDistribution.totalPieces || 1;

  return (
    <Box>
      {/* Summary Card */}
      <CardV2 variant="glass" sx={{ p: ds.spacing['4'], mb: ds.spacing['4'] }}>
        <Typography
          sx={{
            fontSize: '1.125rem',
            fontWeight: ds.typography.fontWeight.bold,
            color: ds.colors.text.primary,
            mb: ds.spacing['3'],
          }}
        >
          Fire Analizi Özeti
        </Typography>

        <Grid container spacing={ds.spacing['3']}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary, mb: ds.spacing['1'] }}>
                Toplam Fire
              </Typography>
              <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: ds.colors.error.main }}>
                {formatLength(totalWaste)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary, mb: ds.spacing['1'] }}>
                Fire Oranı
              </Typography>
              <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: ds.colors.warning.main }}>
                {wastePercentage.toFixed(1)}%
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary, mb: ds.spacing['1'] }}>
                Geri Kazanılabilir
              </Typography>
              <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: ds.colors.success.main }}>
                {wasteDistribution.reclaimable || 0}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardV2>

      {/* Category Breakdown */}
      <CardV2 variant="glass" sx={{ p: ds.spacing['3'] }}>
        <Typography
          sx={{
            fontSize: '0.9375rem',
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
            mb: ds.spacing['2'],
          }}
        >
          Kategori Dağılımı
        </Typography>

        <Stack spacing={ds.spacing['2']}>
          {categories.map((category) => {
            const percentage = (category.value / totalPieces) * 100;
            const color = getWasteCategoryColor(category.key);

            return (
              <Box key={category.key}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: ds.spacing['1'] }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['1'] }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: color,
                      }}
                    />
                    <Typography sx={{ fontSize: '0.875rem', color: ds.colors.text.primary }}>
                      {category.label}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['2'] }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: ds.colors.text.primary }}>
                      {category.value} adet
                    </Typography>
                    <Chip
                      label={`${percentage.toFixed(1)}%`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        minWidth: 50,
                        backgroundColor: alpha(color, 0.1),
                        color,
                      }}
                    />
                  </Box>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 8,
                    borderRadius: `${ds.borderRadius.sm}px`,
                    backgroundColor: alpha(ds.colors.neutral[200], 0.3),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: `${ds.borderRadius.sm}px`,
                      backgroundColor: color,
                    },
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      </CardV2>
    </Box>
  );
};


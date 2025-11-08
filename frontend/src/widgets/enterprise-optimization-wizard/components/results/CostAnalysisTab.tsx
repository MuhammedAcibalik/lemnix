/**
 * Cost Analysis Tab Component
 * Detailed cost breakdown and analysis
 * 
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React from 'react';
import { Box, Typography, Grid, Stack, LinearProgress, alpha } from '@mui/material';
import { CardV2 } from '@/shared';
import { useDesignSystem } from '@/shared/hooks';
import type { CostBreakdownData } from './utils';
import { formatCurrency } from './utils';

export interface CostAnalysisTabProps {
  readonly costData: CostBreakdownData;
}

/**
 * Cost Analysis Tab
 * Detailed cost breakdown
 */
export const CostAnalysisTab: React.FC<CostAnalysisTabProps> = ({ costData }) => {
  const ds = useDesignSystem();

  const costItems = [
    { key: 'material', label: 'Materyal Maliyeti', value: costData.materialCost, color: ds.colors.primary.main },
    { key: 'labor', label: 'İşçilik Maliyeti', value: costData.laborCost, color: ds.colors.success.main },
    { key: 'waste', label: 'Fire Maliyeti', value: costData.wasteCost, color: ds.colors.error.main },
    { key: 'setup', label: 'Kurulum Maliyeti', value: costData.setupCost, color: ds.colors.warning.main },
    { key: 'cutting', label: 'Kesim Maliyeti', value: costData.cuttingCost, color: ds.colors.accent.main },
    { key: 'time', label: 'Zaman Maliyeti', value: costData.timeCost, color: ds.colors.neutral[600] },
  ].filter((item) => item.value > 0); // Only show non-zero costs

  return (
    <Box>
      {/* Total Cost Card */}
      <CardV2 variant="glass" sx={{ p: ds.spacing['4'], mb: ds.spacing['4'] }}>
        <Typography
          sx={{
            fontSize: '1.125rem',
            fontWeight: ds.typography.fontWeight.bold,
            color: ds.colors.text.primary,
            mb: ds.spacing['3'],
          }}
        >
          Maliyet Özeti
        </Typography>

        <Grid container spacing={ds.spacing['3']}>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary, mb: ds.spacing['1'] }}>
                Toplam Maliyet
              </Typography>
              <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: ds.colors.primary.main }}>
                {formatCurrency(costData.totalCost)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary, mb: ds.spacing['1'] }}>
                Metre Başı Maliyet
              </Typography>
              <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: ds.colors.accent.main }}>
                {formatCurrency(costData.costPerMeter)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardV2>

      {/* Cost Breakdown */}
      <CardV2 variant="glass" sx={{ p: ds.spacing['3'] }}>
        <Typography
          sx={{
            fontSize: '0.9375rem',
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
            mb: ds.spacing['2'],
          }}
        >
          Maliyet Dağılımı
        </Typography>

        <Stack spacing={ds.spacing['2']}>
          {costItems.map((item) => {
            const percentage = (item.value / costData.totalCost) * 100;

            return (
              <Box key={item.key}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: ds.spacing['1'] }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['1'] }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '2px',
                        backgroundColor: item.color,
                      }}
                    />
                    <Typography sx={{ fontSize: '0.875rem', color: ds.colors.text.primary }}>
                      {item.label}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['2'] }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: ds.colors.text.primary }}>
                      {formatCurrency(item.value)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: item.color,
                        minWidth: 50,
                        textAlign: 'right',
                      }}
                    >
                      {percentage.toFixed(1)}%
                    </Typography>
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
                      backgroundColor: item.color,
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


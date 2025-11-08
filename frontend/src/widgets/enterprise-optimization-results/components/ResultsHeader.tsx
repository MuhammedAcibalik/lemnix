/**
 * @fileoverview Results Header Component v2.0
 * @module ResultsHeader
 * @version 2.0.0 - Design System v2 Compliant
 */

import React from 'react';
import { OptimizationResult } from '../types';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Avatar,
  Stack,
  alpha,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import { CardV2, Badge } from '@/shared';
import { ExportButton } from '@/features/export-results'; // ✅ P0-3

interface ResultsHeaderProps {
  variant: 'no-results' | 'with-results';
  result?: OptimizationResult;
  performanceMetrics?: Record<string, unknown>;
  onExport?: () => void;
  isExporting?: boolean;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  variant,
  result,
  performanceMetrics,
  onExport,
  isExporting = false,
}) => {
  const ds = useDesignSystem();

  if (variant === 'no-results') {
    return (
      <CardV2 variant="glass" sx={{ mb: ds.spacing['4'], textAlign: "center" }}>
        <Typography sx={{ fontSize: '1rem', color: ds.colors.text.secondary, py: ds.spacing['4'] }}>
          Optimizasyon sonucu bekleniyor...
        </Typography>
      </CardV2>
    );
  }

  if (!result) return null;

  const getSeverityColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return "success";
    if (value >= thresholds.warning) return "warning";
    return "error";
  };

  return (
    <CardV2
      variant="glass"
      sx={{
        mb: ds.spacing['4'],
        background: `linear-gradient(135deg, ${alpha(ds.colors.success.main, 0.1)} 0%, ${alpha(ds.colors.success[300], 0.05)} 100%)`,
        border: `1px solid ${alpha(ds.colors.success.main, 0.2)}`,
      }}
    >
      <Grid container alignItems="center" spacing={ds.spacing['4']}>
        <Grid item>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: alpha(ds.colors.success.main, 0.15),
              color: ds.colors.success.main,
            }}
          >
            <CheckIcon sx={{ fontSize: 28 }} />
          </Avatar>
        </Grid>
        <Grid item xs>
          <Typography
            sx={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: ds.colors.success[700],
              mb: ds.spacing['2'],
            }}
          >
            Optimizasyon Tamamlandı
          </Typography>
          <Stack direction="row" spacing={ds.spacing['2']} flexWrap="wrap">
            <Badge variant="solid" color="success">
              <TrendingUpIcon sx={{ fontSize: 14, mr: ds.spacing['1'] }} />
              Verimlilik: {(Number(performanceMetrics?.efficiency) || 0).toFixed(1)}%
            </Badge>
            <Badge variant="soft" color="primary">
              <MoneyIcon sx={{ fontSize: 14, mr: ds.spacing['1'] }} />
              ₺{result.totalCost?.toFixed(2) || 0}
            </Badge>
            <Badge variant="soft" color="primary">
              <SpeedIcon sx={{ fontSize: 14, mr: ds.spacing['1'] }} />
              {result.stockCount || 0} Stok
            </Badge>
          </Stack>
        </Grid>
        
        {/* Export Button */}
        <Grid item>
          <ExportButton resultId={result.id || 'current'} />
        </Grid>
      </Grid>
    </CardV2>
  );
};

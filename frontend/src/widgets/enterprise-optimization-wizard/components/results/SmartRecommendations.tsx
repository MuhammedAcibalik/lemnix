/**
 * Smart Recommendations Component
 * Display AI-driven optimization suggestions
 * 
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React from 'react';
import { Box, Typography, Stack, Chip, alpha } from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  Speed as PerformanceIcon,
  AttachMoney as CostIcon,
  VerifiedUser as QualityIcon,
  DeleteOutline as WasteIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { CardV2 } from '@/shared';
import { useDesignSystem } from '@/shared/hooks';
// OptimizationRecommendation type
export interface OptimizationRecommendation {
  readonly type: 'performance' | 'cost' | 'quality' | 'waste';
  readonly priority: 'low' | 'medium' | 'high';
  readonly message: string;
  readonly impact?: number;
  readonly actionable?: boolean;
}

export interface SmartRecommendationsProps {
  readonly recommendations: ReadonlyArray<OptimizationRecommendation>;
}

/**
 * Smart Recommendations
 * AI-driven suggestions for optimization improvement
 */
export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({ recommendations }) => {
  const ds = useDesignSystem();

  const getRecommendationIcon = (type: string) => {
    const icons: Record<string, React.ComponentType> = {
      performance: PerformanceIcon,
      cost: CostIcon,
      quality: QualityIcon,
      waste: WasteIcon,
    };
    return icons[type] || LightbulbIcon;
  };

  const getRecommendationColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: ds.colors.error.main,
      medium: ds.colors.warning.main,
      low: ds.colors.success.main,
    };
    return colors[priority] || ds.colors.neutral[600];
  };

  const getPriorityLabel = (priority: string): string => {
    const labels: Record<string, string> = {
      high: 'Yüksek Öncelik',
      medium: 'Orta Öncelik',
      low: 'Düşük Öncelik',
    };
    return labels[priority] || priority;
  };

  if (recommendations.length === 0) {
    return (
      <CardV2 variant="glass" sx={{ p: ds.spacing['4'], height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['1'], mb: ds.spacing['2'] }}>
          <TrendingUpIcon sx={{ fontSize: 18, color: ds.colors.success.main }} />
          <Typography
            sx={{
              fontSize: '0.9375rem',
              fontWeight: ds.typography.fontWeight.semibold,
              color: ds.colors.text.primary,
            }}
          >
            Akıllı Öneriler
          </Typography>
        </Box>
        
        <Box
          sx={{
            textAlign: 'center',
            py: ds.spacing['4'],
            borderRadius: `${ds.borderRadius.md}px`,
            backgroundColor: alpha(ds.colors.success.main, 0.05),
            border: `1px solid ${alpha(ds.colors.success.main, 0.2)}`,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: ds.colors.success.main,
              mb: ds.spacing['1'],
            }}
          >
            Mükemmel Optimizasyon!
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: ds.colors.text.secondary,
            }}
          >
            Şu anda iyileştirme önerisi bulunmuyor
          </Typography>
        </Box>
      </CardV2>
    );
  }

  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing['4'], height: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['1'], mb: ds.spacing['2'] }}>
        <LightbulbIcon sx={{ fontSize: 18, color: ds.colors.warning.main }} />
        <Typography
          sx={{
            fontSize: '1.125rem',
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
          }}
        >
          Akıllı Öneriler
        </Typography>
        <Chip
          label={recommendations.length}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.6875rem',
            fontWeight: 700,
            minWidth: 24,
            backgroundColor: alpha(ds.colors.warning.main, 0.1),
            color: ds.colors.warning.main,
          }}
        />
      </Box>

      {/* Recommendations List */}
      <Stack spacing={ds.spacing['2']} sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {recommendations.map((rec, index) => {
          const priorityColor = getRecommendationColor(rec.priority);

          // Icon based on type
          let IconElement: React.ReactNode = <LightbulbIcon sx={{ fontSize: 16, color: priorityColor }} />;
          if (rec.type === 'performance') IconElement = <PerformanceIcon sx={{ fontSize: 16, color: priorityColor }} />;
          else if (rec.type === 'cost') IconElement = <CostIcon sx={{ fontSize: 16, color: priorityColor }} />;
          else if (rec.type === 'quality') IconElement = <QualityIcon sx={{ fontSize: 16, color: priorityColor }} />;
          else if (rec.type === 'waste') IconElement = <WasteIcon sx={{ fontSize: 16, color: priorityColor }} />;

          return (
            <Box
              key={index}
              sx={{
                p: ds.spacing['2'],
                borderRadius: `${ds.borderRadius.md}px`,
                backgroundColor: alpha(priorityColor, 0.05),
                border: `1px solid ${alpha(priorityColor, 0.2)}`,
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['1'], mb: ds.spacing['1'] }}>
                {IconElement}
                
                <Chip
                  label={rec.type}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                />

                <Chip
                  label={getPriorityLabel(rec.priority)}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    backgroundColor: alpha(priorityColor, 0.15),
                    color: priorityColor,
                  }}
                />

                {rec.impact !== undefined && (
                  <Chip
                    label={`+${rec.impact.toFixed(1)}%`}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      ml: 'auto',
                      backgroundColor: alpha(ds.colors.success.main, 0.1),
                      color: ds.colors.success.main,
                    }}
                  />
                )}
              </Box>

              {/* Message */}
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: ds.colors.text.primary,
                  lineHeight: 1.5,
                }}
              >
                {rec.message}
              </Typography>

              {/* Actionable indicator */}
              {rec.actionable && (
                <Chip
                  label="Uygulanabilir"
                  size="small"
                  sx={{
                    mt: ds.spacing['1'],
                    height: 18,
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    backgroundColor: alpha(ds.colors.success.main, 0.1),
                    color: ds.colors.success.main,
                  }}
                />
              )}
            </Box>
          );
        })}
      </Stack>
    </CardV2>
  );
};


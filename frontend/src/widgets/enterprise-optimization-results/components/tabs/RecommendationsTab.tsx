/**
 * @fileoverview Recommendations Tab Component
 * @module RecommendationsTab
 * @version 1.0.0
 */

import React from 'react';
import { OptimizationResult } from '../../types';
import { 
  Box, 
  Typography, 
  Alert, 
  AlertTitle, 
  Stack, 
  Chip 
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface RecommendationsTabProps {
  result: OptimizationResult;
}

export const RecommendationsTab: React.FC<RecommendationsTabProps> = ({
  result
}) => {
  if (!result) {
    return (
      <Alert severity="info">
        <AlertTitle>Veri Bulunamadı</AlertTitle>
        Optimizasyon sonuçları henüz mevcut değil.
      </Alert>
    );
  }

  const getRecommendationIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "error":
        return <ErrorIcon color="error" />;
      case "warning":
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  return (
    <Box>
      {/* Öneriler */}
      <Stack spacing={2}>
        {result.recommendations?.map((rec: Record<string, unknown>, index: number) => (
          <Alert
            key={index}
            severity={
              (rec.severity as
                | "error"
                | "warning"
                | "info"
                | "success") || "info"
            }
            icon={getRecommendationIcon(String(rec.severity || "info"))}
          >
            <AlertTitle>{String(rec.message ?? '')}</AlertTitle>
            <Typography variant="body2">
              {String(rec.description || rec.suggestion || '')}
            </Typography>
            {(Number(rec.expectedImprovement ?? 0)) > 0 && (
              <Chip
                label={`%${rec.expectedImprovement} iyileştirme potansiyeli`}
                size="small"
                color="success"
                sx={{ mt: 1 }}
              />
            )}
          </Alert>
        ))}
        {(!result.recommendations ||
          result.recommendations.length === 0) && (
          <Alert severity="success">
            <AlertTitle>Mükemmel!</AlertTitle>
            Optimizasyon sonuçları ideal seviyede. Herhangi bir
            iyileştirme önerisi bulunmuyor.
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

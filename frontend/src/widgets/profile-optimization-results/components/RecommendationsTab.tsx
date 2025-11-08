/**
 * @fileoverview Recommendations Tab Component for Profile Optimization Results
 * @module RecommendationsTab
 * @version 1.0.0
 */

import React from 'react';
import {
  Stack,
  Alert,
  AlertTitle,
  Typography,
  Chip
} from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { RecommendationsTabProps } from '../types';
import { messages, iconMappings } from '../constants';

/**
 * Recommendations Tab Component
 */
export const RecommendationsTab: React.FC<RecommendationsTabProps> = ({
  recommendations
}) => {
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
    <Stack spacing={2}>
      {recommendations?.map((rec, index: number) => (
        <Alert
          key={index}
          severity={
            (rec.severity as
              | "error"
              | "warning"
              | "info"
              | "success") || "info"
          }
          icon={getRecommendationIcon(rec.severity || "info")}
        >
          <AlertTitle>{rec.message}</AlertTitle>
          <Typography variant="body2">
            {rec.description || rec.suggestion}
          </Typography>
          {(rec.expectedImprovement ?? 0) > 0 && (
            <Chip
              label={`%${rec.expectedImprovement} ${messages.recommendations.improvementPotential}`}
              size="small"
              color="success"
              sx={{ mt: 1 }}
            />
          )}
        </Alert>
      ))}
    </Stack>
  );
};

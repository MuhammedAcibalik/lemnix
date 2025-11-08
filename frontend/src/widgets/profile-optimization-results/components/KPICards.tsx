/**
 * @fileoverview KPI Cards Component for Profile Optimization Results
 * @module KPICards
 * @version 1.0.0
 */

import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Recycling as RecyclingIcon,
  AttachMoney as MoneyIcon,
  Engineering as EngineeringIcon
} from '@mui/icons-material';
import { KPICardsProps } from '../types';
import { messages, stylingConstants } from '../constants';

/**
 * KPI Cards Component
 */
export const KPICards: React.FC<KPICardsProps> = ({
  result,
  performanceMetrics
}) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={3}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  mr: 2,
                }}
              >
                <TrendingUpIcon color="success" />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="success.main"
                >
                  {performanceMetrics?.efficiency.toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {messages.kpi.efficiencyRate}
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={performanceMetrics?.efficiency}
              color="success"
              sx={{ height: 8, borderRadius: 4 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  mr: 2,
                }}
              >
                <RecyclingIcon color="warning" />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="warning.main"
                >
                  {result.optimizationResult.totalWaste} mm
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {messages.kpi.totalWaste}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {result.profileGroups.length} {messages.kpi.profileGroups}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  mr: 2,
                }}
              >
                <MoneyIcon color="primary" />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="primary.main"
                >
                  ₺{result.optimizationResult.totalCost?.toFixed(0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {messages.kpi.totalCost}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="success.main">
              %{performanceMetrics?.savingsPercentage} {messages.kpi.savings}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), mr: 2 }}>
                <EngineeringIcon color="info" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {performanceMetrics?.performanceScore}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {messages.kpi.performanceScore}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {messages.kpi.quality}: {performanceMetrics?.qualityScore}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

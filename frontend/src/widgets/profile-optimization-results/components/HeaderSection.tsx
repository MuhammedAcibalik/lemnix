/**
 * @fileoverview Header Section Component for Profile Optimization Results
 * @module HeaderSection
 * @version 1.0.0
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Stack,
  Chip,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  GroupWork as GroupWorkIcon,
  Science as ScienceIcon,
  Download as DownloadIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { HeaderSectionProps } from '../types';
import { messages, stylingConstants } from '../constants';

/**
 * Header Section Component
 */
export const HeaderSection: React.FC<HeaderSectionProps> = ({
  result,
  performanceMetrics,
  onExport
}) => {
  const theme = useTheme();

  const getSeverityColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return "success";
    if (value >= thresholds.warning) return "warning";
    return "error";
  };

  return (
    <Card
      sx={{
        mb: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
      <CardContent>
        <Grid container alignItems="center" spacing={3}>
          <Grid item>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: "primary.main",
                boxShadow: theme.shadows[3],
              }}
            >
              <CategoryIcon sx={{ fontSize: 32 }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold" color="primary.dark">
              {messages.header.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Chip
                icon={<TrendingUpIcon />}
                label={`${messages.header.efficiency}: ${performanceMetrics?.efficiency.toFixed(1)}%`}
                color={getSeverityColor(performanceMetrics?.efficiency || 0, {
                  good: 85,
                  warning: 70,
                })}
              />
              <Chip
                icon={<MoneyIcon />}
                label={`${messages.header.totalCost}: ₺${result.optimizationResult.totalCost?.toFixed(2)}`}
                color="primary"
              />
              <Chip
                icon={<GroupWorkIcon />}
                label={`${result.profileGroups.length} ${messages.header.profileGroups}`}
                color="info"
              />
              <Chip
                icon={<ScienceIcon />}
                label={`${messages.header.confidence}: ${result.confidence || 95}%`}
                color="secondary"
              />
            </Stack>
          </Grid>
          <Grid item>
            <Stack spacing={1}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={onExport}
                sx={{ minWidth: 150 }}
              >
                {messages.actions.downloadReport}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                sx={{ minWidth: 150 }}
              >
                {messages.actions.print}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

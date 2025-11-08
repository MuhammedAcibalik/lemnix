/**
 * Statistics Dashboard Component
 * Complete dashboard with all statistics
 * 
 * @module widgets/statistics-dashboard
 * @version 1.0.0
 */

import React from 'react';
import { Stack } from '@mui/material';
import { StatisticsOverviewCard } from './StatisticsOverviewCard';
import { AlgorithmPerformanceCard } from './AlgorithmPerformanceCard';

export const StatisticsDashboard: React.FC = () => {
  return (
    <Stack spacing={3}>
      <StatisticsOverviewCard />
      <AlgorithmPerformanceCard />
    </Stack>
  );
};


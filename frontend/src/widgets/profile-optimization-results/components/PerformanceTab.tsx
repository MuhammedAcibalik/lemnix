/**
 * @fileoverview Performance Tab Component for Profile Optimization Results
 * @module PerformanceTab
 * @version 1.0.0
 */

import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  LinearProgress
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Science as ScienceIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { PerformanceTabProps } from '../types';
import { messages } from '../constants';

/**
 * Performance Tab Component
 */
export const PerformanceTab: React.FC<PerformanceTabProps> = ({
  result
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {messages.performance.algorithmPerformance}
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <SpeedIcon />
              </ListItemIcon>
              <ListItemText
                primary={messages.performance.executionTime}
                secondary={`${result.optimizationResult.executionTimeMs}ms`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ScienceIcon />
              </ListItemIcon>
              <ListItemText
                primary={messages.performance.algorithmComplexity}
                secondary={result.performanceMetrics.algorithmComplexity}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText
                primary={messages.performance.convergenceRate}
                secondary={`${(result.performanceMetrics.convergenceRate * 100).toFixed(1)}%`}
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {messages.performance.systemUsage}
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {messages.performance.cpuUsage}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={result.performanceMetrics.cpuUsage}
              color="primary"
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {messages.performance.memoryUsage}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={result.performanceMetrics.memoryUsage}
              color="secondary"
            />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {messages.performance.scalability}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={result.performanceMetrics.scalability * 10}
              color="success"
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

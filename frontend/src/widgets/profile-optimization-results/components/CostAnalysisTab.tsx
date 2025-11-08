/**
 * @fileoverview Cost Analysis Tab Component for Profile Optimization Results
 * @module CostAnalysisTab
 * @version 1.0.0
 */

import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Stack,
  Box
} from '@mui/material';
import { CostAnalysisTabProps } from '../types';
import { messages } from '../constants';

/**
 * Cost Analysis Tab Component
 */
export const CostAnalysisTab: React.FC<CostAnalysisTabProps> = ({
  result,
  performanceMetrics
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {messages.costAnalysis.costDistribution}
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={messages.costAnalysis.materialCost}
                secondary={`₺${result.costAnalysis.materialCost.toFixed(2)}`}
              />
              <LinearProgress
                variant="determinate"
                value={(result.costAnalysis.materialCost / result.costAnalysis.totalCost) * 100}
                sx={{ width: 100, ml: 2 }}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={messages.costAnalysis.cuttingCost}
                secondary={`₺${result.costAnalysis.cuttingCost.toFixed(2)}`}
              />
              <LinearProgress
                variant="determinate"
                value={(result.costAnalysis.cuttingCost / result.costAnalysis.totalCost) * 100}
                sx={{ width: 100, ml: 2 }}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={messages.costAnalysis.setupCost}
                secondary={`₺${result.costAnalysis.setupCost.toFixed(2)}`}
              />
              <LinearProgress
                variant="determinate"
                value={(result.costAnalysis.setupCost / result.costAnalysis.totalCost) * 100}
                sx={{ width: 100, ml: 2 }}
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {messages.costAnalysis.unitCosts}
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {messages.costAnalysis.costPerCut}
              </Typography>
              <Typography variant="h5">
                ₺{(result.optimizationResult.totalCost / result.optimizationResult.cuts.length).toFixed(2)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {messages.costAnalysis.costPerProfileGroup}
              </Typography>
              <Typography variant="h5">
                ₺{(result.optimizationResult.totalCost / result.profileGroups.length).toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

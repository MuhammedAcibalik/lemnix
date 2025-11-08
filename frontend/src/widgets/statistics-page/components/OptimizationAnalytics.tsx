/**
 * @fileoverview Optimization Analytics Component
 * @module OptimizationAnalytics
 * @version 1.0.0
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

interface OptimizationAnalyticsProps {
  data: Record<string, unknown>;
}

export const OptimizationAnalytics: React.FC<OptimizationAnalyticsProps> = ({ data }) => {
  if (!data) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No optimization analytics available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Optimization Analytics
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Algorithm Performance
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Algorithm</TableCell>
                      <TableCell align="right">Average Efficiency</TableCell>
                      <TableCell align="right">Success Rate</TableCell>
                      <TableCell align="right">Execution Time</TableCell>
                      <TableCell align="right">Usage Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(data.algorithmPerformance) ? data.algorithmPerformance.map((algorithm: Record<string, unknown>, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{String(algorithm.algorithm || 'N/A')}</TableCell>
                        <TableCell align="right">{typeof algorithm.averageEfficiency === 'number' ? algorithm.averageEfficiency.toFixed(2) : 'N/A'}%</TableCell>
                        <TableCell align="right">{typeof algorithm.successRate === 'number' ? algorithm.successRate.toFixed(2) : 'N/A'}%</TableCell>
                        <TableCell align="right">{String(algorithm.executionTime || 'N/A')}ms</TableCell>
                        <TableCell align="right">{String(algorithm.usageCount || 'N/A')}</TableCell>
                      </TableRow>
                    )) : null}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

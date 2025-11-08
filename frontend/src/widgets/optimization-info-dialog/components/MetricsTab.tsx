/**
 * @fileoverview Metrics Tab Component for Optimization Info Dialog
 * @module MetricsTab
 * @version 1.0.0
 */

import React from 'react';
import {
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
  Grid,
  Alert,
  AlertTitle
} from '@mui/material';
import { messages } from '../constants';
import { MetricsTabProps } from '../types';

/**
 * Metrics Tab Component
 */
export const MetricsTab: React.FC<MetricsTabProps> = ({ metrics }) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        {messages.metrics.title}
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Metrik</TableCell>
              <TableCell>Formül</TableCell>
              <TableCell>Birim</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {metrics.map((metric, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {metric.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {metric.formula}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={metric.unit} size="small" variant="outlined" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Alert severity="success">
            <AlertTitle>{messages.metrics.goodResults.title}</AlertTitle>
            {messages.metrics.goodResults.criteria.map((criterion, index) => (
              <div key={index}>
                • {criterion}{index < messages.metrics.goodResults.criteria.length - 1 && <br />}
              </div>
            ))}
          </Alert>
        </Grid>
        <Grid item xs={12} md={6}>
          <Alert severity="error">
            <AlertTitle>{messages.metrics.badResults.title}</AlertTitle>
            {messages.metrics.badResults.criteria.map((criterion, index) => (
              <div key={index}>
                • {criterion}{index < messages.metrics.badResults.criteria.length - 1 && <br />}
              </div>
            ))}
          </Alert>
        </Grid>
      </Grid>
    </>
  );
};

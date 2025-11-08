/**
 * @fileoverview Cost Analysis Tab Component
 * @module CostAnalysisTab
 * @version 1.0.0
 */

import React from 'react';
import { OptimizationResult, Cut } from '../../types';
import { 
  Box, 
  Typography, 
  Alert, 
  AlertTitle, 
  Grid, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  LinearProgress, 
  Stack 
} from '@mui/material';

interface CostAnalysisTabProps {
  result: OptimizationResult;
}

export const CostAnalysisTab: React.FC<CostAnalysisTabProps> = ({
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

  return (
    <Box>
      {/* Maliyet Analizi */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Maliyet Dağılımı
            </Typography>
            <List>
              {result.costBreakdown &&
                Object.entries(result.costBreakdown).map(
                  ([key, value]) => (
                    <ListItem key={key}>
                      <ListItemText
                        primary={key
                          .replace(/([A-Z])/g, " $1")
                          .trim()}
                        secondary={`₺${typeof value === "number" ? value.toFixed(2) : "0.00"}`}
                      />
                      <LinearProgress
                        variant="determinate"
                        value={
                          typeof value === "number"
                            ? (value / result.totalCost) * 100
                            : 0
                        }
                        sx={{ width: 100, ml: 2 }}
                      />
                    </ListItem>
                  )
                )}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Birim Maliyetler
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Stok Başına Maliyet
                </Typography>
                <Typography variant="h5">
                  ₺{((result.totalCost || 0) / result.stockCount).toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Metre Başına Maliyet
                </Typography>
                <Typography variant="h5">
                  ₺{result.costPerMeter?.toFixed(2) || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Parça Başına Maliyet
                </Typography>
                <Typography variant="h5">
                  ₺
                  {(
                    (result.totalCost || 0) /
                    ((result.cuts as Cut[])?.reduce(
                      (sum: number, c: Cut) =>
                        sum + (c.segments?.length || 0),
                      0
                    ) || 1)
                  ).toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

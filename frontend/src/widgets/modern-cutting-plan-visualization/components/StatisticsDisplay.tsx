/**
 * @fileoverview Statistics Display Component
 * @module StatisticsDisplay
 * @version 1.0.0
 */

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Avatar,
  Grid,
  Paper,
  LinearProgress,
} from "@mui/material";
import { Analytics as AnalyticsIcon } from "@mui/icons-material";
import { StatisticsDisplayProps } from "../types";
import {
  formatLength,
  formatCurrency,
  formatPercentage,
  getEfficiencyColor,
} from "../utils";

/**
 * Statistics Display Component
 */
export const StatisticsDisplay: React.FC<StatisticsDisplayProps> = ({
  statistics,
}) => {
  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Avatar sx={{ bgcolor: "#1976d2", width: 48, height: 48 }}>
            <AnalyticsIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Optimizasyon İstatistikleri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kesim planı performans analizi
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={3}>
          {/* Toplam Çubuk */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{ p: 2, textAlign: "center", bgcolor: "#e3f2fd" }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#1976d2" }}
              >
                {statistics.totalStocks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Çubuk
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatLength(statistics.totalStockLength)} toplam
              </Typography>
            </Paper>
          </Grid>

          {/* Genel Verimlilik */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{ p: 2, textAlign: "center", bgcolor: "#e8f5e8" }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#4caf50" }}
              >
                {formatPercentage(statistics.overallEfficiency)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Genel Verimlilik
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatLength(statistics.totalUsedLength)} kullanıldı
              </Typography>
            </Paper>
          </Grid>

          {/* Toplam Fire */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{ p: 2, textAlign: "center", bgcolor: "#fff3e0" }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#ff9800" }}
              >
                {formatLength(statistics.totalWaste)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Fire
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatPercentage(statistics.wastePercentage)} fire oranı
              </Typography>
            </Paper>
          </Grid>

          {/* Toplam Maliyet */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{ p: 2, textAlign: "center", bgcolor: "#fce4ec" }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#e91e63" }}
              >
                {formatCurrency(statistics.materialCost)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Maliyet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatCurrency(statistics.wasteCost)} fire maliyeti
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Efficiency Progress */}
        <Box sx={{ mt: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Genel Verimlilik
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatPercentage(statistics.overallEfficiency)} / 100%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={statistics.overallEfficiency}
            sx={{
              height: 8,
              borderRadius: 4,
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background: `linear-gradient(90deg, ${getEfficiencyColor(statistics.overallEfficiency)}, ${getEfficiencyColor(statistics.overallEfficiency)}aa)`,
              },
            }}
          />
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Kullanılan: {formatLength(statistics.totalUsedLength)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Fire: {formatLength(statistics.totalWaste)} (
              {formatPercentage(statistics.wastePercentage)})
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

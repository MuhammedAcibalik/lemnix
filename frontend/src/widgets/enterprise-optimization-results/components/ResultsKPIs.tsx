/**
 * @fileoverview Results KPIs Component
 * @module ResultsKPIs
 * @version 1.0.0
 */

import React from "react";
import { OptimizationResult } from "../types";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Recycling as RecyclingIcon,
  AttachMoney as MoneyIcon,
  Engineering as EngineeringIcon,
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";

interface ResultsKPIsProps {
  result: OptimizationResult;
  performanceMetrics: Record<string, unknown>;
  wasteAnalysis: Record<string, unknown>;
}

export const ResultsKPIs: React.FC<ResultsKPIsProps> = ({
  result,
  performanceMetrics,
  wasteAnalysis,
}) => {
  const theme = useTheme();

  if (!result || !performanceMetrics) return null;

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
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {typeof performanceMetrics.efficiency === "number"
                    ? performanceMetrics.efficiency.toFixed(1)
                    : "0.0"}
                  %
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Verimlilik Oranı
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={
                typeof performanceMetrics.efficiency === "number"
                  ? performanceMetrics.efficiency
                  : 0
              }
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
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {result.totalWaste} mm
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Toplam Atık
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {String(wasteAnalysis?.reclaimable || 0)} adet geri kazanılabilir
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
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  ₺{result.totalCost?.toFixed(0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Toplam Maliyet
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="success.main">
              %{String(performanceMetrics.savingsPercentage || 0)} tasarruf
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
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  mr: 2,
                }}
              >
                <EngineeringIcon color="info" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {String(performanceMetrics.performanceScore || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Performans Skoru
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Kalite: {String(performanceMetrics.qualityScore || 0)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

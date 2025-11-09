/**
 * @fileoverview Performance Metrics Component
 * @module PerformanceMetrics
 * @version 1.0.0
 */

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  LinearProgress,
} from "@mui/material";

interface PerformanceMetricsProps {
  data: Record<string, unknown>;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  data,
}) => {
  if (!data) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No performance data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Performance Metrics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Waste Percentage
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={
                    typeof data.wastePercentage === "number"
                      ? data.wastePercentage
                      : 0
                  }
                  size={60}
                  sx={{ color: "#ef4444" }}
                />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {typeof data.wastePercentage === "number"
                    ? data.wastePercentage.toFixed(1)
                    : "0.0"}
                  %
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Efficiency Score
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={
                    typeof data.efficiencyScore === "number"
                      ? data.efficiencyScore
                      : 0
                  }
                  size={60}
                  sx={{ color: "#10b981" }}
                />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {typeof data.efficiencyScore === "number"
                    ? data.efficiencyScore.toFixed(1)
                    : "0.0"}
                  %
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Optimization Count
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#3b82f6" }}
              >
                {String(data.optimizationCount || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Average Processing Time
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#f59e0b" }}
              >
                {String(data.averageProcessingTime || 0)}ms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * @fileoverview System Health Component
 * @module SystemHealth
 * @version 1.0.0
 */

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
} from "@mui/material";

interface SystemHealthProps {
  data: Record<string, unknown>;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ data }) => {
  if (!data) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No system health data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        System Health
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Response Time
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#10b981" }}
              >
                {String(data.responseTime || 0)}ms
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Error Rate
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#ef4444" }}
              >
                {String(data.errorRate || "0%")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Memory Usage
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#3b82f6" }}
              >
                {String(data.memoryUsage || 0)}MB
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                CPU Usage
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#f59e0b" }}
              >
                {String(data.cpuUsage || 0)}s
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

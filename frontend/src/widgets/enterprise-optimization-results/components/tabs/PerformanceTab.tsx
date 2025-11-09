/**
 * @fileoverview Performance Tab Component
 * @module PerformanceTab
 * @version 1.0.0
 */

import React from "react";
import { OptimizationResult } from "../../types";
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from "@mui/material";
import {
  Speed as SpeedIcon,
  Science as ScienceIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";

interface PerformanceTabProps {
  result: OptimizationResult;
  analytics: Record<string, unknown>;
  systemHealth: Record<string, unknown>;
  isLoadingAnalytics: boolean;
  isLoadingSystemHealth: boolean;
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({
  result,
  analytics,
  systemHealth,
  isLoadingAnalytics,
  isLoadingSystemHealth,
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
      {/* Performans Metrikleri */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Algoritma Performansı
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <SpeedIcon />
                </ListItemIcon>
                <ListItemText
                  primary="İşlem Süresi"
                  secondary={`${result.executionTimeMs}ms`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ScienceIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Algoritma Karmaşıklığı"
                  secondary={
                    result.performanceMetrics?.algorithmComplexity || "O(n²)"
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AssessmentIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Yakınsama Oranı"
                  secondary={`${((result.performanceMetrics?.convergenceRate || 0) * 100).toFixed(1)}%`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sistem Kullanımı
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                CPU Kullanımı
              </Typography>
              <LinearProgress
                variant="determinate"
                value={result.performanceMetrics?.cpuUsage || 0}
                color="primary"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Bellek Kullanımı
              </Typography>
              <LinearProgress
                variant="determinate"
                value={result.performanceMetrics?.memoryUsage || 0}
                color="secondary"
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Ölçeklenebilirlik
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(result.performanceMetrics?.scalability || 0) * 10}
                color="success"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Analytics Data */}
        {analytics && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performans Analizi
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(analytics.metrics || {}).map(
                  ([key, value]: [string, unknown]) => (
                    <Grid item xs={6} md={3} key={key}>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="h5"
                          color="primary.main"
                          fontWeight="bold"
                        >
                          {typeof value === "object" &&
                          value !== null &&
                          "current" in value
                            ? typeof value.current === "number"
                              ? value.current.toFixed(1)
                              : "0"
                            : "0"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Typography>
                      </Box>
                    </Grid>
                  ),
                )}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* System Health */}
        {systemHealth && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sistem Sağlığı
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Servis Durumu
                  </Typography>
                  {Object.entries(systemHealth.services || {}).map(
                    ([service, status]: [string, unknown]) => (
                      <Box
                        key={service}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">{service}</Typography>
                        <Typography variant="body2">
                          {typeof status === "object" &&
                          status !== null &&
                          "status" in status
                            ? String(status.status)
                            : "unknown"}
                        </Typography>
                      </Box>
                    ),
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Sistem Metrikleri
                  </Typography>
                  {Object.entries(systemHealth.metrics || {}).map(
                    ([metric, value]: [string, unknown]) => (
                      <Box
                        key={metric}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">{metric}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {typeof value === "number"
                            ? `${value.toFixed(1)}%`
                            : String(value ?? "N/A")}
                        </Typography>
                      </Box>
                    ),
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

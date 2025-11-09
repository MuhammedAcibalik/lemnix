/**
 * Audit Statistics Card Component
 * Real-time audit statistics overview
 *
 * @module widgets/audit-history/ui
 * @version 1.0.0
 */

import React from "react";
import {
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import {
  TrendingUp as TrendIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Speed as PerformanceIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { useAuditStatistics } from "@/entities/audit";
import { alpha } from "@mui/material/styles";

/**
 * Metric Card Component
 */
const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  subtitle?: string;
}> = ({ icon, label, value, color, subtitle }) => {
  const ds = useDesignSystem();

  return (
    <Box
      sx={{
        p: ds.spacing["3"],
        borderRadius: `${ds.borderRadius.md}px`,
        border: `1px solid ${ds.colors.neutral[200]}`,
        backgroundColor: alpha(color, 0.05),
        transition: ds.transitions.base,
        "&:hover": {
          borderColor: color,
          transform: "translateY(-2px)",
          boxShadow: ds.shadows.soft.md,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: ds.spacing["2"],
          mb: ds.spacing["1"],
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: `${ds.borderRadius.sm}px`,
            backgroundColor: alpha(color, 0.1),
            color,
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: ds.typography.fontWeight.medium,
            color: ds.colors.text.secondary,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontSize: "1.75rem",
          fontWeight: ds.typography.fontWeight.bold,
          color: ds.colors.text.primary,
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>

      {subtitle && (
        <Typography
          sx={{
            fontSize: "0.6875rem",
            color: ds.colors.text.secondary,
            mt: ds.spacing["1"],
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Audit Statistics Card Component
 *
 * Single Responsibility: Display audit statistics
 *
 * Features:
 * - Total actions count
 * - Success rate percentage
 * - Average duration
 * - Recent errors count
 * - Auto-refresh every minute
 */
export const AuditStatisticsCard: React.FC = () => {
  const ds = useDesignSystem();

  const {
    data: stats,
    isLoading,
    isError,
  } = useAuditStatistics({
    refetchInterval: 60 * 1000, // Refresh every minute
  });

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: ds.spacing["6"],
        }}
      >
        <CircularProgress size={32} sx={{ color: ds.colors.primary.main }} />
      </Box>
    );
  }

  // Error state (graceful - show minimal message)
  if (isError || !stats) {
    return (
      <Alert
        severity="info"
        sx={{
          borderRadius: `${ds.borderRadius.md}px`,
          fontSize: "0.8125rem",
        }}
      >
        İstatistikler şu anda kullanılamıyor
      </Alert>
    );
  }

  return (
    <Grid container spacing={ds.spacing["3"]}>
      {/* Total Actions */}
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          icon={<TrendIcon fontSize="small" />}
          label="Toplam İşlem"
          value={stats.totalActions.toLocaleString("tr-TR")}
          color={ds.colors.primary.main}
        />
      </Grid>

      {/* Success Rate */}
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          icon={<SuccessIcon fontSize="small" />}
          label="Başarı Oranı"
          value={`${Math.round(stats.successRate)}%`}
          color={ds.colors.success.main}
          subtitle={
            stats.successRate >= 95
              ? "Mükemmel"
              : stats.successRate >= 90
                ? "İyi"
                : "Düşük"
          }
        />
      </Grid>

      {/* Average Duration */}
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          icon={<PerformanceIcon fontSize="small" />}
          label="Ort. Süre"
          value={`${Math.round(stats.averageDuration)}ms`}
          color={ds.colors.warning.main}
          subtitle={
            stats.averageDuration < 1000
              ? "Hızlı"
              : stats.averageDuration < 3000
                ? "Normal"
                : "Yavaş"
          }
        />
      </Grid>

      {/* Recent Errors */}
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          icon={<ErrorIcon fontSize="small" />}
          label="Son Hatalar"
          value={stats.recentErrors.length}
          color={ds.colors.error.main}
          subtitle={
            stats.recentErrors.length === 0 ? "Hata yok" : "Kontrol gerekli"
          }
        />
      </Grid>
    </Grid>
  );
};

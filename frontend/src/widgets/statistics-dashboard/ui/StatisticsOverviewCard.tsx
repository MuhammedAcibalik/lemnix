/**
 * Statistics Overview Card Component v2.0
 * Displays overview statistics with modern design
 *
 * @module widgets/statistics-dashboard
 * @version 2.0.0 - Design System v2 Compliant
 */

import React from "react";
import {
  Grid,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  alpha,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Delete as WasteIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import { useStatisticsOverview } from "@/entities/statistics";
import { useDesignSystem } from "@/shared/hooks";
import { CardV2 } from "@/shared";

interface StatItemProps {
  readonly icon: React.ReactElement;
  readonly label: string;
  readonly value: string | number;
  readonly color: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color }) => {
  const ds = useDesignSystem();

  return (
    <Stack spacing={ds.spacing["2"]}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: `${ds.borderRadius.md}px`,
          background: alpha(color, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: ds.transitions.spring,
          "&:hover": {
            transform: "scale(1.1) rotate(5deg)",
          },
        }}
      >
        <Box sx={{ color, fontSize: 20 }}>{icon}</Box>
      </Box>
      <Box>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: ds.colors.text.secondary,
            mb: ds.spacing["1"],
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: ds.colors.text.primary,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  );
};

export const StatisticsOverviewCard: React.FC = () => {
  const ds = useDesignSystem();
  const { data, isLoading, error } = useStatisticsOverview();

  return (
    <CardV2
      variant="glass"
      title="Genel İstatistikler"
      subtitle="Toplam performans özeti"
      headerAction={<AssessmentIcon sx={{ color: ds.colors.primary.main }} />}
    >
      {isLoading && (
        <Box display="flex" justifyContent="center" py={ds.spacing["6"]}>
          <CircularProgress size={40} />
        </Box>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ borderRadius: `${ds.borderRadius.md}px` }}
        >
          İstatistikler yüklenemedi
        </Alert>
      )}

      {!isLoading && !error && data && (
        <Grid container spacing={ds.spacing["4"]}>
          <Grid item xs={12} sm={6} md={3}>
            <StatItem
              icon={<SpeedIcon />}
              label="Toplam Kesim Listesi"
              value={data.totalCuttingLists || 0}
              color={ds.colors.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatItem
              icon={<TrendingUpIcon />}
              label="Toplam İş Emri"
              value={data.totalWorkOrders || 0}
              color={ds.colors.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatItem
              icon={<WasteIcon />}
              label="Toplam Profil"
              value={data.totalProfiles || 0}
              color={ds.colors.info.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatItem
              icon={<MoneyIcon />}
              label="Ortalama Verimlilik"
              value={`${(data.averageEfficiency || 0).toFixed(1)}%`}
              color={ds.colors.support.main}
            />
          </Grid>
        </Grid>
      )}
    </CardV2>
  );
};

/**
 * Dashboard Page - LEMNİX v2.0
 * Optimization-first dashboard with real-time metrics
 *
 * @module pages/DashboardPage
 * @version 2.0.0 - Complete Reboot
 * @architecture Feature-Sliced Design (FSD)
 */

import React from "react";
import { Box, Typography, Grid, Stack, alpha } from "@mui/material";
import {
  Assessment as AssessmentIcon,
  ListAlt as ListIcon,
  AutoAwesome as SparkleIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";

// Dashboard Widgets (v2)
import {
  HeroMetricCard,
  useHeroMetrics,
} from "@/widgets/dashboard-v2/hero-metrics";
import { QuickActionsBar } from "@/widgets/dashboard-v2/quick-actions";
import {
  AlgoComparisonChart,
  EfficiencyTrend,
  WasteTimeline,
  CostSavings,
} from "@/widgets/dashboard-v2/optimization-grid";
import { ActiveOperationsPanel } from "@/widgets/dashboard-v2/active-operations";
import { SmartInsightsPanel } from "@/widgets/dashboard-v2/smart-insights";
import { ActivityTimelinePanel } from "@/widgets/dashboard-v2/activity-timeline";
import { useOptimizationPerformance } from "@/entities/dashboard";

/**
 * Dashboard Page Component
 * Main dashboard composition
 */
export default function DashboardPage() {
  const ds = useDesignSystem();

  // Data hooks
  const { metrics: heroMetrics, isLoading: heroLoading } = useHeroMetrics({
    timeRange: "7d",
  });
  const { data: perfData, isLoading: perfLoading } = useOptimizationPerformance(
    { timeRange: "7d" },
  );

  return (
    <Box
      sx={{
        p: { xs: ds.spacing["3"], md: ds.spacing["4"], lg: ds.spacing["6"] },
        minHeight: "100vh",
        backgroundColor: alpha(ds.colors.neutral[50], 0.5),
      }}
    >
      {/* Page Header */}
      <Box sx={{ mb: ds.spacing["6"] }}>
        <Typography
          sx={{
            fontSize: "2.25rem",
            fontWeight: 800,
            background: ds.gradients.primary,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            mb: ds.spacing["1"],
          }}
        >
          Dashboard
        </Typography>
        <Typography
          sx={{
            fontSize: "1rem",
            color: ds.colors.text.secondary,
            fontWeight: ds.typography.fontWeight.medium,
          }}
        >
          Kesim optimizasyonu performans özeti ve gerçek zamanlı izleme
        </Typography>
      </Box>

      {/* Hero Metrics */}
      <ErrorBoundary>
        <Grid container spacing={ds.spacing["3"]} sx={{ mb: ds.spacing["6"] }}>
          {heroMetrics.map((metric) => (
            <Grid item xs={12} sm={6} lg={3} key={metric.id}>
              <HeroMetricCard
                label={metric.label}
                value={metric.value}
                {...(metric.unit ? { unit: metric.unit } : {})}
                icon={getMetricIcon(metric.id)}
                {...(metric.trend !== undefined ? { trend: metric.trend } : {})}
                {...(metric.sparklineData
                  ? { sparklineData: metric.sparklineData }
                  : {})}
                color={metric.color}
                loading={heroLoading}
              />
            </Grid>
          ))}
        </Grid>
      </ErrorBoundary>

      {/* Quick Actions */}
      <Box sx={{ mb: ds.spacing["4"] }}>
        <ErrorBoundary>
          <QuickActionsBar />
        </ErrorBoundary>
      </Box>

      {/* Main Content Grid - 2x2 Layout */}
      <Grid container spacing={ds.spacing["3"]}>
        {/* Row 1: Algorithm Comparison + Active Operations */}
        <Grid item xs={12} lg={8}>
          <ErrorBoundary>
            <AlgoComparisonChart
              data={perfData?.algorithmStats || []}
              loading={perfLoading}
            />
          </ErrorBoundary>
        </Grid>
        <Grid item xs={12} lg={4}>
          <ErrorBoundary>
            <ActiveOperationsPanel maxItems={5} />
          </ErrorBoundary>
        </Grid>

        {/* Row 2: Efficiency Trend + Smart Insights */}
        <Grid item xs={12} lg={8}>
          <ErrorBoundary>
            <EfficiencyTrend
              data={perfData?.efficiencyTimeSeries || []}
              loading={perfLoading}
            />
          </ErrorBoundary>
        </Grid>
        <Grid item xs={12} lg={4}>
          <ErrorBoundary>
            <SmartInsightsPanel timeRange="7d" />
          </ErrorBoundary>
        </Grid>

        {/* Row 3: Waste & Cost - Side by Side */}
        <Grid item xs={12} md={6}>
          <ErrorBoundary>
            <WasteTimeline
              data={perfData?.wasteTimeSeries || []}
              loading={perfLoading}
            />
          </ErrorBoundary>
        </Grid>
        <Grid item xs={12} md={6}>
          <ErrorBoundary>
            <CostSavings
              data={perfData?.costSavings?.savingsTimeSeries || []}
              totalSaved={perfData?.costSavings?.totalSaved || 0}
              loading={perfLoading}
            />
          </ErrorBoundary>
        </Grid>

        {/* Row 4: Activity Timeline - Full Width */}
        <Grid item xs={12}>
          <ErrorBoundary>
            <ActivityTimelinePanel maxItems={15} />
          </ErrorBoundary>
        </Grid>
      </Grid>
    </Box>
  );
}

/**
 * Get metric icon component
 */
function getMetricIcon(metricId: string): React.ComponentType<{ sx?: object }> {
  const icons: Record<string, React.ComponentType<{ sx?: object }>> = {
    "active-optimizations": SparkleIcon,
    "cutting-lists": ListIcon,
    "avg-efficiency": TrendingUpIcon,
    "waste-saved": AssessmentIcon,
  };
  return icons[metricId] || AssessmentIcon;
}

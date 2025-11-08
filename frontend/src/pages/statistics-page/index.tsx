/**
 * @fileoverview Statistics Page - Advanced Analytics Dashboard
 * @module StatisticsPage
 * @version 1.0.0 - Enterprise Analytics Dashboard
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
// Modern Design System v2.0
import { useDesignSystem } from '@/shared/hooks';

// Import widget components
import { StatisticsOverview } from '../../widgets/statistics-page/components/StatisticsOverview';
import { PerformanceMetrics } from '../../widgets/statistics-page/components/PerformanceMetrics';
import { UsageAnalytics } from '../../widgets/statistics-page/components/UsageAnalytics';
import { OptimizationAnalytics } from '../../widgets/statistics-page/components/OptimizationAnalytics';
import { SystemHealth } from '../../widgets/statistics-page/components/SystemHealth';

// Import new P0 widgets
import { StatisticsDashboard } from '@/widgets/statistics-dashboard';
import { OptimizationHistoryWidget } from '@/widgets/optimization-history';
import { FadeIn, CardV2, api } from '@/shared';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface StatisticsData {
  overview: Record<string, unknown> | null;
  performance: Record<string, unknown> | null;
  usage: Record<string, unknown> | null;
  optimization: Record<string, unknown> | null;
  systemHealth: Record<string, unknown> | null;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`statistics-tabpanel-${index}`}
    aria-labelledby={`statistics-tab-${index}`}
  >
    {value === index && (
      <Box sx={{ py: 3 }}>
        {children}
      </Box>
    )}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Statistics Page Component - Advanced Analytics Dashboard
 */
export const StatisticsPage: React.FC = () => {
  const ds = useDesignSystem();
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [statisticsData, setStatisticsData] = useState<StatisticsData>({
    overview: null,
    performance: null,
    usage: null,
    optimization: null,
    systemHealth: null
  });

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const fetchStatisticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ P2-8: BATCH STATISTICS - Single request instead of 5
      const types = 'overview,performance,usage,optimization,health';
      const batchData = await api.get<{
        overview: Record<string, unknown>;
        performance: Record<string, unknown>;
        usage: Record<string, unknown>;
        optimization: Record<string, unknown>;
        health: Record<string, unknown>;
      }>(`/statistics/batch?types=${types}`);

      if (!batchData.data || !batchData.data.overview || !batchData.data.performance || !batchData.data.usage || !batchData.data.optimization) {
        throw new Error('Failed to fetch statistics data');
      }

      setStatisticsData({
        overview: batchData.data.overview,
        performance: batchData.data.performance,
        usage: batchData.data.usage,
        optimization: batchData.data.optimization,
        systemHealth: batchData.data.health
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    fetchStatisticsData();
  }, [fetchStatisticsData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchStatisticsData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStatisticsData]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    fetchStatisticsData();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderLoadingState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 2
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="h6" color="text.secondary">
        Loading statistics...
      </Typography>
    </Box>
  );

  const renderErrorState = () => (
    <Alert 
      severity="error" 
      sx={{ mb: 3 }}
      action={
        <IconButton
          color="inherit"
          size="small"
          onClick={handleRefresh}
        >
          <RefreshIcon />
        </IconButton>
      }
    >
      {error}
    </Alert>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Container maxWidth="xl" sx={{ py: ds.spacing['8'] }}>
      {/* Header Section - MODERN */}
      <FadeIn direction="down" duration={0.5}>
        <Box sx={{ mb: ds.spacing['6'] }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: ds.spacing['3'] }}>
            <Box>
              <Typography sx={{ 
                fontSize: { xs: '1.75rem', md: '2.25rem' },
                fontWeight: 800, 
                background: ds.gradients.premium,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: ds.spacing['1'],
              }}>
                İstatistik Paneli
              </Typography>
              <Typography sx={{
                fontSize: '0.9375rem',
                color: ds.colors.text.secondary,
              }}>
                Kapsamlı analiz ve performans metrikleri
              </Typography>
            </Box>

            <Stack direction="row" spacing={ds.spacing['2']}>
              <Tooltip title="Verileri Yenile">
                <span>
                  <IconButton 
                    onClick={handleRefresh}
                    disabled={loading}
                    sx={{
                      width: 36,
                      height: 36,
                      background: ds.gradients.primary,
                      color: 'white',
                      boxShadow: ds.shadows.soft.sm,
                      transition: ds.transitions.base,
                      '&:hover': {
                        background: ds.gradients.primaryHover,
                        transform: 'translateY(-2px)',
                        boxShadow: ds.shadows.soft.md,
                      },
                      '&:disabled': {
                        opacity: 0.6,
                        color: 'white',
                      }
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </span>
              </Tooltip>
              
              <Tooltip title="Dışa Aktar">
                <IconButton 
                  onClick={handleExport}
                  sx={{
                    width: 36,
                    height: 36,
                    background: ds.gradients.secondary,
                    color: 'white',
                    boxShadow: ds.shadows.soft.sm,
                    transition: ds.transitions.base,
                    '&:hover': {
                      background: ds.gradients.secondaryReverse,
                      transform: 'translateY(-2px)',
                      boxShadow: ds.shadows.soft.md,
                    }
                  }}
                >
                  <ExportIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {lastUpdated && (
            <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary }}>
              Son güncelleme: {lastUpdated.toLocaleString('tr-TR')}
            </Typography>
          )}
        </Box>
      </FadeIn>

      {/* Error State */}
      {error && renderErrorState()}

      {/* Loading State */}
      {loading && !statisticsData.overview && renderLoadingState()}

      {/* Main Content */}
      {!loading && !error && (
        <FadeIn direction="up" duration={0.5}>
          <Box>
            {/* Navigation Tabs - MODERN */}
            <CardV2 variant="elevated" sx={{ mb: ds.spacing['4'] }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: `1px solid ${ds.colors.neutral[200]}`,
                  '& .MuiTab-root': {
                    minHeight: 52,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: ds.colors.text.secondary,
                    transition: ds.transitions.fast,
                    '&.Mui-selected': {
                      color: ds.colors.primary.main,
                    },
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    background: ds.gradients.primary,
                    borderRadius: `${ds.borderRadius.xs}px`,
                  }
                }}
              >
                <Tab
                  icon={<AssessmentIcon sx={{ fontSize: 20 }} />}
                  label="Genel Bakış"
                  iconPosition="start"
                />
                <Tab
                  icon={<SpeedIcon sx={{ fontSize: 20 }} />}
                  label="Performans"
                  iconPosition="start"
                />
                <Tab
                  icon={<BarChartIcon sx={{ fontSize: 20 }} />}
                  label="Kullanım Analizi"
                  iconPosition="start"
                />
                <Tab
                  icon={<TrendingUpIcon sx={{ fontSize: 20 }} />}
                  label="Optimizasyon"
                  iconPosition="start"
                />
                <Tab
                  icon={<AnalyticsIcon sx={{ fontSize: 20 }} />}
                  label="Sistem Durumu"
                  iconPosition="start"
                />
              </Tabs>
            </CardV2>

            {/* Tab Panels */}
            <TabPanel value={activeTab} index={0}>
              <Stack spacing={ds.spacing['4']}>
                {/* NEW: Modern Statistics Dashboard (P0-4) */}
                <StatisticsDashboard />
                
                {/* Legacy Overview - Keep for backward compatibility */}
                <StatisticsOverview data={statisticsData.overview} />
              </Stack>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <PerformanceMetrics data={statisticsData.performance || {}} />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <UsageAnalytics data={statisticsData.usage || {}} />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <Stack spacing={ds.spacing['4']}>
                {/* NEW: Optimization History Widget (P0-2) */}
                <OptimizationHistoryWidget limit={10} />
                
                {/* Legacy Analytics */}
                <OptimizationAnalytics data={statisticsData.optimization || {}} />
              </Stack>
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
              <SystemHealth data={statisticsData.systemHealth || {}} />
            </TabPanel>
          </Box>
        </FadeIn>
      )}
    </Container>
  );
};

export default StatisticsPage;

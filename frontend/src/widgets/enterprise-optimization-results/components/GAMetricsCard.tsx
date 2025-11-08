/**
 * GAMetricsCard - Genetic Algorithm detailed metrics visualization
 * Displays convergence, telemetry, and performance data
 * 
 * @module EnterpriseOptimizationResults/components
 * @version 2.0.0 - GA v1.7.1 Support
 */

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Divider,
  Stack,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface GAMetricsCardProps {
  readonly algorithm?: string | undefined;
  readonly executionTimeMs?: number;
  readonly performanceMetrics?: {
    readonly algorithmComplexity?: string;
    readonly convergenceRate?: number;
    readonly generations?: number;
    readonly actualGenerations?: number;
    readonly convergenceReason?: string;
    readonly populationSize?: number;
    readonly effectiveComplexity?: string;
    readonly cpuUsage?: number;
    readonly memoryUsage?: number;
    readonly scalability?: number;
  } | undefined;
}

export function GAMetricsCard({ 
  algorithm, 
  executionTimeMs = 0,
  performanceMetrics 
}: GAMetricsCardProps) {
  // Only show for genetic algorithm
  if (!algorithm || !algorithm.toLowerCase().includes('genetic')) {
    return null;
  }

  const hasMetrics = Boolean(performanceMetrics);
  const convergenceRate = performanceMetrics?.convergenceRate ?? 0;
  const generations = performanceMetrics?.generations ?? 0;
  const actualGenerations = performanceMetrics?.actualGenerations ?? generations;
  const convergenceReason = performanceMetrics?.convergenceReason ?? 'Bilinmiyor';
  const populationSize = performanceMetrics?.populationSize ?? 0;
  const effectiveComplexity = performanceMetrics?.effectiveComplexity ?? performanceMetrics?.algorithmComplexity ?? 'N/A';

  // Calculate convergence quality score
  const convergenceScore = useMemo(() => {
    if (actualGenerations === 0 || generations === 0) return 0;
    const efficiency = (actualGenerations / generations) * 100;
    if (efficiency < 50) return 100; // Converged very early = excellent
    if (efficiency < 75) return 90;  // Converged reasonably = good
    if (efficiency < 90) return 75;  // Almost full run = okay
    return 50; // Full run = suboptimal
  }, [actualGenerations, generations]);

  const convergenceLabel = useMemo(() => {
    if (convergenceScore >= 90) return { label: 'Mükemmel', color: 'success' as const };
    if (convergenceScore >= 75) return { label: 'İyi', color: 'primary' as const };
    if (convergenceScore >= 50) return { label: 'Orta', color: 'warning' as const };
    return { label: 'Zayıf', color: 'error' as const };
  }, [convergenceScore]);

  if (!hasMetrics) {
    return (
      <Card elevation={2} sx={{ bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🧬 Genetic Algorithm Metrikleri
          </Typography>
          <Alert severity="info">
            Detaylı performans metrikleri backend tarafından sağlanmadı.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2} sx={{ bgcolor: 'background.paper' }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🧬 Genetic Algorithm v1.7.1
          </Typography>
          <Chip 
            label={convergenceLabel.label}
            color={convergenceLabel.color}
            size="small"
            icon={<CheckCircleIcon />}
          />
        </Box>

        {/* Execution Summary */}
        <Alert severity="success" icon="⚡" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            Çalışma Süresi: <strong>{(executionTimeMs / 1000).toFixed(2)} saniye</strong>
            {' | '}
            Jenerasyon: <strong>{actualGenerations}/{generations}</strong>
            {' | '}
            Popülasyon: <strong>{populationSize} birey</strong>
          </Typography>
        </Alert>

        <Stack spacing={2}>
          {/* Convergence Section */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <TrendingUpIcon color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Konverjans Kalitesi
                </Typography>
                <Tooltip title="Algoritmanın ne kadar hızlı en iyi çözüme yakınsadığını gösterir">
                  <InfoIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
                </Tooltip>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {convergenceScore}/100
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={convergenceScore}
              color={convergenceLabel.color}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {convergenceReason}
            </Typography>
          </Box>

          <Divider />

          {/* Performance Metrics Grid */}
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
            {/* Convergence Rate */}
            <Box>
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <TimelineIcon color="primary" sx={{ fontSize: 18 }} />
                <Typography variant="caption" color="text.secondary">
                  Konverjans Oranı
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={600}>
                {convergenceRate.toFixed(1)}%
              </Typography>
            </Box>

            {/* Effective Complexity */}
            <Box>
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <MemoryIcon color="primary" sx={{ fontSize: 18 }} />
                <Typography variant="caption" color="text.secondary">
                  Karmaşıklık
                </Typography>
              </Box>
              <Tooltip title={`Hesaplanan: ${effectiveComplexity}`}>
                <Typography variant="h6" fontWeight={600} sx={{ cursor: 'help' }}>
                  {effectiveComplexity}
                </Typography>
              </Tooltip>
            </Box>

            {/* Scalability Score */}
            {performanceMetrics?.scalability !== undefined && performanceMetrics && (
              <Box>
                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                  <SpeedIcon color="primary" sx={{ fontSize: 18 }} />
                  <Typography variant="caption" color="text.secondary">
                    Ölçeklenebilirlik
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {performanceMetrics?.scalability}/10
                </Typography>
              </Box>
            )}

            {/* CPU Usage */}
            {performanceMetrics?.cpuUsage !== undefined && performanceMetrics && (
              <Box>
                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                  <MemoryIcon color="secondary" sx={{ fontSize: 18 }} />
                  <Typography variant="caption" color="text.secondary">
                    CPU Kullanımı
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {performanceMetrics?.cpuUsage?.toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>

          {/* Info Footer */}
          <Box mt={1} p={1.5} bgcolor="action.hover" borderRadius={1}>
            <Typography variant="caption" color="text.secondary">
              💡 <strong>Detaylar:</strong> Erken durdurma ve adaptif mutasyon kullanıldı.
              {actualGenerations < generations && 
                ` Algoritma ${generations} yerine ${actualGenerations} jenerasyonda optimum çözümü buldu.`
              }
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}


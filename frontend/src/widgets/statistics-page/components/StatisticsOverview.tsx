/**
 * @fileoverview Statistics Overview Component - Key Metrics Dashboard
 * @module StatisticsOverview
 * @version 1.0.0 - Executive Metrics Display
 */

import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  LinearProgress,
  Chip,
  Fade,
  Zoom
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface StatisticsOverviewProps {
  data: {
    totalCuttingLists: number;
    totalWorkOrders: number;
    totalProfiles: number;
    averageEfficiency: number;
    totalWasteReduction: number;
    optimizationSuccessRate: number;
    activeUsers: number;
    systemUptime: number;
  } | null;
}

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  subtitle?: string;
  progress?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  subtitle,
  progress
}) => (
  <Zoom in={true} timeout={500}>
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
          borderColor: color
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: color,
              boxShadow: `0 8px 24px ${color}30`
            }}
          >
            {icon}
          </Avatar>
          
          {trend !== undefined && (
            <Chip
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              size="small"
              sx={{
                background: trend >= 0 ? '#10b981' : '#ef4444',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          )}
        </Stack>

        <Typography variant="h4" sx={{ 
          fontWeight: 800, 
          color: '#1e293b',
          mb: 0.5,
          lineHeight: 1.2
        }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>

        <Typography variant="body2" sx={{ 
          color: '#64748b',
          fontWeight: 600,
          mb: progress !== undefined ? 2 : 0
        }}>
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{ 
            color: '#94a3b8',
            display: 'block',
            mb: progress !== undefined ? 2 : 0
          }}>
            {subtitle}
          </Typography>
        )}

        {progress !== undefined && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
                  borderRadius: 3
                }
              }}
            />
            <Typography variant="caption" sx={{ 
              color: '#64748b',
              mt: 1,
              display: 'block'
            }}>
              {progress.toFixed(1)}% verimlilik
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  </Zoom>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Statistics Overview Component
 */
export const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({ data }) => {
  if (!data) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  const formatUptime = (uptime: number): string => {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <Box>
      {/* Key Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Toplam Kesim Listesi"
            value={data.totalCuttingLists || 0}
            icon={<AssignmentIcon sx={{ fontSize: 24 }} />}
            color="#3b82f6"
            subtitle="Aktif kesim listeleri"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Toplam İş Emri"
            value={data.totalWorkOrders || 0}
            icon={<WorkIcon sx={{ fontSize: 24 }} />}
            color="#10b981"
            subtitle="Toplam sipariş sayısı"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Toplam Profil"
            value={data.totalProfiles || 0}
            icon={<CategoryIcon sx={{ fontSize: 24 }} />}
            color="#f59e0b"
            subtitle="Toplam profil adedi"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Ürün Kategorisi"
            value={0}
            icon={<TrendingUpIcon sx={{ fontSize: 24 }} />}
            color="#8b5cf6"
            subtitle="Farklı ürün türü"
          />
        </Grid>
      </Grid>

      {/* Secondary Metrics Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Tamamlanan İş Emri"
            value={0}
            icon={<CheckCircleIcon sx={{ fontSize: 24 }} />}
            color="#059669"
            subtitle="Tamamlanan siparişler"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Bekleyen İş Emri"
            value={0}
            icon={<ScheduleIcon sx={{ fontSize: 24 }} />}
            color="#f59e0b"
            subtitle="İşlenmeyi bekleyen"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="En Çok Kullanılan Renk"
            value={'N/A'}
            icon={<SpeedIcon sx={{ fontSize: 24 }} />}
            color="#ef4444"
            subtitle="Popüler renk seçimi"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="En Çok Kullanılan Ebat"
            value={'N/A'}
            icon={<PersonIcon sx={{ fontSize: 24 }} />}
            color="#06b6d4"
            subtitle="Popüler ebat seçimi"
          />
        </Grid>
      </Grid>

      {/* Summary Section */}
      <Fade in={true} timeout={800}>
        <Card sx={{ 
          mt: 4,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white',
          borderRadius: '16px'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Kesim Listesi Özeti
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              Kesim listesi yönetim sisteminiz aktif olarak çalışıyor:{' '}
              <strong>{data?.totalCuttingLists || 0}</strong> kesim listesi içinde{' '}
              <strong>{data?.totalWorkOrders || 0}</strong> iş emri bulunuyor. 
              Toplam <strong>{(data?.totalProfiles || 0).toLocaleString()}</strong> profil adedi{' '}
              <strong>0</strong> farklı ürün kategorisinde işleniyor. 
              <strong> 0</strong> iş emri tamamlandı,{' '}
              <strong>0</strong> iş emri bekliyor.
            </Typography>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

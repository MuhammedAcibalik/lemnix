/**
 * @fileoverview Premium Metrics Dashboard Section Component for HomePage
 * @module MetricsSection
 * @version 2.0.0 - Industrial Performance Focus
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Fade,
  Zoom,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  AttachMoney as CostIcon,
  RecyclingOutlined as WasteIcon,
  PrecisionManufacturing as ManufacturingIcon,
  Analytics as AnalyticsIcon,
  Timer as TimerIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon
} from '@mui/icons-material';
import { MetricsSectionProps } from '../types';

/**
 * Premium Metrics Dashboard Section Component
 */
export const MetricsSection: React.FC<MetricsSectionProps> = ({
  metrics = []
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);

  // Industrial performance metrics
  const industrialMetrics = [
    {
      id: 'waste-reduction',
      title: 'Atık Azalması',
      value: 42,
      unit: '%',
      description: 'Malzeme atık oranında azalma',
      icon: <WasteIcon sx={{ fontSize: 40 }} />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      trend: 'up',
      change: '+15%',
      target: 50
    },
    {
      id: 'cost-savings',
      title: 'Maliyet Tasarrufu',
      value: 285000,
      unit: 'TL',
      description: 'Yıllık maliyet tasarrufu',
      icon: <CostIcon sx={{ fontSize: 40 }} />,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      trend: 'up',
      change: '+23%',
      target: 300000
    },
    {
      id: 'production-speed',
      title: 'Üretim Hızı',
      value: 340,
      unit: '%',
      description: 'Kesim hızında artış',
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      trend: 'up',
      change: '+8%',
      target: 400
    },
    {
      id: 'accuracy-rate',
      title: 'Doğruluk Oranı',
      value: 96.8,
      unit: '%',
      description: 'Kesim doğruluk oranı',
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      trend: 'up',
      change: '+2.1%',
      target: 98
    },
    {
      id: 'efficiency-gain',
      title: 'Verimlilik Artışı',
      value: 78,
      unit: '%',
      description: 'Genel verimlilik artışı',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      trend: 'up',
      change: '+12%',
      target: 85
    },
    {
      id: 'time-savings',
      title: 'Zaman Tasarrufu',
      value: 45,
      unit: '%',
      description: 'Kesim süresinde azalma',
      icon: <TimerIcon sx={{ fontSize: 40 }} />,
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      trend: 'up',
      change: '+6%',
      target: 50
    }
  ];

  // Auto-rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetricIndex((prev) => (prev + 1) % industrialMetrics.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatValue = (value: number, unit: string) => {
    if (unit === 'TL') {
      return value.toLocaleString('tr-TR');
    }
    return value.toString();
  };

  return (
    <Box 
      sx={{ 
        py: { xs: 10, md: 15 },
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
          `,
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Chip
              label="📊 Performans Metrikleri"
              sx={{
                mb: 4,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                fontSize: '1rem',
                fontWeight: 600,
                px: 3,
                py: 1,
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            />
            
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.8rem', md: '4rem' },
                mb: 4,
                background: 'linear-gradient(135deg, #1e293b 0%, #10b981 50%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
                letterSpacing: '-0.02em'
              }}
            >
              Kanıtlanmış Sonuçlar
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                maxWidth: 800,
                mx: 'auto',
                color: 'text.secondary',
                lineHeight: 1.7,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                fontWeight: 400
              }}
            >
              LEMNIX ile elde edilen gerçek performans verileri. 
              İşletmenizin verimliliğini artıracak somut sonuçlar.
            </Typography>
          </Box>
        </Fade>

        {/* Main Metrics Grid */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {industrialMetrics.map((metric, index) => (
            <Grid item xs={12} sm={6} lg={4} key={metric.id}>
              <Zoom in timeout={600 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: metric.gradient,
                      opacity: currentMetricIndex === index ? 1 : 0,
                      transition: 'opacity 0.5s ease'
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 60px ${metric.color}20`,
                      '& .metric-icon': {
                        transform: 'scale(1.1) rotate(5deg)'
                      }
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box
                        className="metric-icon"
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 3,
                          background: metric.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 8px 24px ${metric.color}30`,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {metric.icon}
                      </Box>
                      
                      {/* Trend Indicator */}
                      <Chip
                        icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                        label={metric.change}
                        size="small"
                        sx={{
                          backgroundColor: `${metric.color}15`,
                          color: metric.color,
                          fontWeight: 600,
                          fontSize: '0.8rem'
                        }}
                      />
                    </Box>
                    
                    {/* Value */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 900,
                          color: metric.color,
                          fontSize: { xs: '2.5rem', md: '3rem' },
                          lineHeight: 1,
                          mb: 1
                        }}
                      >
                        {formatValue(metric.value, metric.unit)}
                        <Typography
                          component="span"
                          variant="h5"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 600,
                            ml: 1
                          }}
                        >
                          {metric.unit}
                        </Typography>
                      </Typography>
                      
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: '1.1rem',
                          mb: 1
                        }}
                      >
                        {metric.title}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.5
                        }}
                      >
                        {metric.description}
                      </Typography>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mt: 'auto' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Hedef: {metric.target}{metric.unit}
                        </Typography>
                        <Typography variant="caption" sx={{ color: metric.color, fontWeight: 700 }}>
                          {Math.round((metric.value / metric.target) * 100)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((metric.value / metric.target) * 100, 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: `${metric.color}15`,
                          '& .MuiLinearProgress-bar': {
                            background: metric.gradient,
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Summary Stats */}
        <Fade in timeout={1200}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.1)',
              borderRadius: 4,
              p: 4,
              mb: 8
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                    mb: 2
                  }}
                >
                  🎯 Ortalama Performans Artışı
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6
                  }}
                >
                  LEMNIX kullanan işletmeler ortalama %65 verimlilik artışı, 
                  %40 atık azalması ve %280 maliyet tasarrufu elde ediyor.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1
                    }}
                  >
                    %65
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600
                    }}
                  >
                    Ortalama Verimlilik Artışı
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Fade>

        {/* Action CTA */}
        <Fade in timeout={1400}>
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AnalyticsIcon />}
              sx={{
                px: 6,
                py: 2.5,
                fontSize: '1.2rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 40px rgba(16, 185, 129, 0.5)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Detaylı Raporları İncele
            </Button>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};
/**
 * @fileoverview Work Order Analysis Component
 * @module WorkOrderAnalysis
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  IconButton,
  Badge
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  CalendarMonth as CalendarMonthIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const COLORS = ['#1e40af', '#059669', '#f59e0b', '#ef4444', '#7c3aed']; // Industrial Harmony

// Premium Chart.js Themes - Industrial Harmony Renk Paletine Tam Uyum
const premiumTheme = {
  colors: {
    primary: '#1e40af',    // Deep Industrial Blue
    secondary: '#059669',  // Precision Green
    success: '#059669',    // Precision Green
    warning: '#f59e0b',    // Efficiency Orange
    error: '#ef4444',      // Error Red
    info: '#1e40af',       // Deep Industrial Blue
    purple: '#7c3aed'      // Tech Purple
  },
  gradients: {
    primary: ['#1e40af', '#7c3aed'],      // Premium Blue-Purple
    secondary: ['#059669', '#22c55e'],    // Precision Green
    success: ['#059669', '#22c55e'],      // Precision Green
    warning: ['#f59e0b', '#fbbf24'],      // Efficiency Orange
    info: ['#1e40af', '#3b82f6'],         // Deep Industrial Blue
    error: ['#ef4444', '#dc2626'],        // Error Red
    purple: ['#7c3aed', '#a855f7']        // Tech Purple
  }
};

// Premium Chart Options
const getPremiumChartOptions = (title: string, colors: string[] = premiumTheme.gradients.primary) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true
    }
  },
  animation: {
    duration: 2000,
    easing: 'easeInOutQuart' as const
  },
  interaction: {
    intersect: false,
    mode: 'index'
  }
});

const getPremiumDoughnutOptions = (title: string) => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true
    }
  },
  animation: {
    duration: 2000,
    easing: 'easeInOutQuart' as const
  }
});

interface WorkOrderAnalysisProps {
  cuttingListId?: string;
}

interface WorkOrderTrend {
  period: string;
  completed: number;
  pending: number;
  weekStart?: string;
  weekEnd?: string;
  weekDays?: string[];
}

interface WorkOrderStats {
  totalWorkOrders: number;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: string;
  }>;
  priorityDistribution: Array<{
    priority: string;
    count: number;
    percentage: string;
  }>;
  completionRate: number;
  averageProcessingTime: number;
  mostCommonStatus: string;
  mostCommonPriority: string;
  workOrderTrends: Array<{
    period: string;
    completed: number;
    pending: number;
    weekStart?: string;
    weekEnd?: string;
    weekDays?: string[];
  }>;
}

const WorkOrderAnalysis: React.FC<WorkOrderAnalysisProps> = ({ cuttingListId }) => {
  const [workOrderStats, setWorkOrderStats] = useState<WorkOrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<WorkOrderTrend | null>(null);

  useEffect(() => {
    const fetchWorkOrderAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = cuttingListId 
          ? `/api/statistics/work-order-analysis?cuttingListId=${cuttingListId}`
          : '/api/statistics/work-order-analysis';
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setWorkOrderStats(data.data);
        } else {
          setError(data.message || 'Work order analysis verisi alınamadı');
        }
      } catch (err) {
        setError('Work order analysis yüklenirken hata oluştu');
        console.error('Work order analysis error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrderAnalysis();
  }, [cuttingListId]);

  const handleWeekClick = (week: WorkOrderTrend) => {
    setSelectedWeek(week);
    setDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedWeek(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: premiumTheme.colors.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: '12px' }}>
        {error}
      </Alert>
    );
  }

  if (!workOrderStats) {
    return (
      <Alert severity="info" sx={{ borderRadius: '12px' }}>
        Work order analysis verisi bulunamadı
      </Alert>
    );
  }

  // Chart data preparation
  const statusDoughnutData = {
    labels: workOrderStats.statusDistribution.map(item => item.status),
    datasets: [
      {
        data: workOrderStats.statusDistribution.map(item => item.count),
        backgroundColor: [
          premiumTheme.colors.success,
          premiumTheme.colors.warning,
          premiumTheme.colors.error,
          premiumTheme.colors.info
        ],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const priorityDoughnutData = {
    labels: workOrderStats.priorityDistribution.map(item => item.priority),
    datasets: [
      {
        data: workOrderStats.priorityDistribution.map(item => item.count),
        backgroundColor: [
          premiumTheme.colors.error,
          premiumTheme.colors.warning,
          premiumTheme.colors.success,
          premiumTheme.colors.info
        ],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const trendChartData = workOrderStats.workOrderTrends;

  return (
    <Box sx={{ p: 2 }}>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${premiumTheme.gradients.success[0]} 0%, ${premiumTheme.gradients.success[1]} 100%)`,
            color: 'white',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  mr: 1.5,
                  width: 40,
                  height: 40
                }}>
                  <AssignmentIcon sx={{ fontSize: '1.2rem' }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold',
                    fontSize: '1.8rem',
                    mb: 0.5
                  }}>
                    {workOrderStats.totalWorkOrders}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: '0.85rem'
                  }}>
                    Toplam İş Emri
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${premiumTheme.gradients.info[0]} 0%, ${premiumTheme.gradients.info[1]} 100%)`,
            color: 'white',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  mr: 1.5,
                  width: 40,
                  height: 40
                }}>
                  <CheckCircleIcon sx={{ fontSize: '1.2rem' }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold',
                    fontSize: '1.8rem',
                    mb: 0.5
                  }}>
                    {workOrderStats.completionRate}%
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: '0.85rem'
                  }}>
                    Tamamlanma Oranı
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${premiumTheme.gradients.purple[0]} 0%, ${premiumTheme.gradients.purple[1]} 100%)`,
            color: 'white',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  mr: 1.5,
                  width: 40,
                  height: 40
                }}>
                  <ScheduleIcon sx={{ fontSize: '1.2rem' }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold',
                    fontSize: '1.8rem',
                    mb: 0.5
                  }}>
                    {workOrderStats.mostCommonStatus}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: '0.85rem'
                  }}>
                    En Yaygın Durum
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${premiumTheme.gradients.secondary[0]} 0%, ${premiumTheme.gradients.secondary[1]} 100%)`,
            color: 'white',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  mr: 1.5,
                  width: 40,
                  height: 40
                }}>
                  <TrendingUpIcon sx={{ fontSize: '1.2rem' }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold',
                    fontSize: '1.8rem',
                    mb: 0.5
                  }}>
                    {workOrderStats.mostCommonPriority}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: '0.85rem'
                  }}>
                    En Yaygın Öncelik
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status and Priority Analysis */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: '16px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                mb: 2,
                color: '#1e293b'
              }}>
                📊 Durum Dağılımı
              </Typography>
              
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
                <Box sx={{ 
                  width: 120,
                  height: 120,
                  position: 'relative'
                }}>
                  <Doughnut 
                    data={statusDoughnutData}
                    options={getPremiumDoughnutOptions('Status Distribution')}
                  />
                </Box>
                
                <Box sx={{ flex: 1, ml: 3 }}>
                  {workOrderStats.statusDistribution.map((item, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      borderRadius: '8px',
                      background: 'rgba(248, 250, 252, 0.8)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: statusDoughnutData.datasets[0].backgroundColor[index],
                          mr: 1
                        }} />
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold',
                          color: '#64748b'
                        }}>
                          {item.status}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 'bold',
                        color: '#1e293b'
                      }}>
                        {item.count} ({item.percentage}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: '16px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                mb: 2,
                color: '#1e293b'
              }}>
                🎯 Öncelik Dağılımı
              </Typography>
              
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
                <Box sx={{ 
                  width: 120,
                  height: 120,
                  position: 'relative'
                }}>
                  <Doughnut 
                    data={priorityDoughnutData}
                    options={getPremiumDoughnutOptions('Priority Distribution')}
                  />
                </Box>
                
                <Box sx={{ flex: 1, ml: 3 }}>
                  {workOrderStats.priorityDistribution.map((item, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      borderRadius: '8px',
                      background: 'rgba(248, 250, 252, 0.8)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: priorityDoughnutData.datasets[0].backgroundColor[index],
                          mr: 1
                        }} />
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold',
                          color: '#64748b'
                        }}>
                          {item.priority}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 'bold',
                        color: '#1e293b'
                      }}>
                        {item.count} ({item.percentage}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Premium Weekly Timeline - Ana Sayfa Stilinde */}
      <Box sx={{ 
        py: { xs: 8, lg: 12 },
        background: `
          linear-gradient(135deg, #ffffff 0%, #f8fafc 20%, #f1f5f9 40%, #e2e8f0 60%, #cbd5e1 80%, #94a3b8 100%),
          radial-gradient(ellipse at top left, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
          radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.08) 0%, transparent 60%)
        `,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 15% 85%, rgba(16, 185, 129, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 85% 15%, rgba(59, 130, 246, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)
          `,
          animation: 'premiumShimmer 8s ease-in-out infinite',
        },
        '@keyframes premiumShimmer': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.6 },
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1, px: 4 }}>
          {/* Premium Header */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="HAFTALIK İŞ EMRI ANALİZİ"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.15em',
                bgcolor: 'rgba(16, 185, 129, 0.15)',
                color: '#059669',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                mb: 4,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 12px 40px rgba(16, 185, 129, 0.3)',
                  bgcolor: 'rgba(16, 185, 129, 0.2)',
                }
              }}
            />
            
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', lg: '4.5rem' },
                fontWeight: 900,
                mb: 4,
                background: 'linear-gradient(135deg, #059669 0%, #10b981 30%, #3b82f6 60%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
              }}
            >
              📅 Haftalık İş Emri Analizi
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                color: '#6b7280',
                mb: 6,
                maxWidth: '1000px',
                mx: 'auto',
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              Mevcut haftanın gerçek iş emri verileri ile detaylı analiz. 
              Kesim listesindeki iş emirlerinin durumu ve haftanın 7 günü gösterilir.
            </Typography>
          </Box>

          {/* Premium Weekly Cards */}
          <Grid container spacing={{ xs: 4, lg: 6 }} sx={{ mb: 8 }}>
            {trendChartData.length > 0 ? (
              trendChartData.map((trend, index) => {
                const isCurrentWeek = true; // Artık sadece mevcut hafta var
                const weekDays = trend.weekDays || [];
                
                return (
                  <Grid key={index} item xs={12} md={8} lg={6} sx={{ mx: 'auto' }}>
                  <Box
                    onClick={() => handleWeekClick(trend)}
                    sx={{
                      height: '100%',
                      p: 5,
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: isCurrentWeek 
                        ? '2px solid rgba(16, 185, 129, 0.6)' 
                        : '2px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: 4,
                      backdropFilter: 'blur(20px)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
                        opacity: isCurrentWeek ? 1 : 0,
                        transition: 'opacity 0.4s ease',
                      },
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '2px solid rgba(16, 185, 129, 0.8)',
                        transform: 'translateY(-12px) scale(1.03)',
                        boxShadow: '0 30px 80px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.9)',
                        '&::before': {
                          opacity: 1,
                        }
                      }
                    }}
                  >
                    {/* Week Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          color: isCurrentWeek ? '#059669' : '#1f2937',
                          fontSize: { xs: '1.5rem', lg: '2rem' },
                          mb: 2
                        }}
                      >
                        {trend.period}
                      </Typography>
                      {isCurrentWeek && (
                        <Chip
                          label="MEVCUT HAFTA"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            bgcolor: 'rgba(16, 185, 129, 0.2)',
                            color: '#059669',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                          }}
                        />
                      )}
                    </Box>

                    {/* Weekly Days Display */}
                    {weekDays.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="body2" sx={{ 
                          color: '#6b7280', 
                          fontWeight: 600, 
                          mb: 2, 
                          textAlign: 'center' 
                        }}>
                          Haftanın Günleri
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: 1, 
                          justifyContent: 'center' 
                        }}>
                          {weekDays.map((day, dayIndex) => {
                            const date = new Date(day);
                            const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
                            const dayNumber = date.getDate();
                            
                            return (
                              <Box
                                key={dayIndex}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)',
                                  border: '2px solid rgba(59, 130, 246, 0.4)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.6rem',
                                  fontWeight: 'bold',
                                  color: '#3b82f6',
                                  textAlign: 'center',
                                  lineHeight: 1,
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                  }
                                }}
                                title={`${dayName} ${dayNumber}`}
                              >
                                <span style={{ fontSize: '0.5rem' }}>{dayName}</span>
                                <span style={{ fontSize: '0.7rem' }}>{dayNumber}</span>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}

                    {/* Stats Grid */}
                    <Box sx={{ 
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 3,
                      mb: 4
                    }}>
                      {/* Completed */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            width: 72,
                            height: 72,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${premiumTheme.colors.success}25, ${premiumTheme.colors.success}15)`,
                            border: `2px solid ${premiumTheme.colors.success}40`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 8px 24px ${premiumTheme.colors.success}20`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            mx: 'auto',
                            mb: 2,
                            '&:hover': {
                              transform: 'scale(1.1) rotate(5deg)',
                              boxShadow: `0 12px 32px ${premiumTheme.colors.success}30`,
                            }
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 28, color: premiumTheme.colors.success }} />
                        </Box>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 800,
                            color: '#1f2937',
                            fontSize: { xs: '2rem', lg: '2.5rem' },
                            mb: 1
                          }}
                        >
                          {trend.completed}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#6b7280',
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}>
                          Tamamlanan
                        </Typography>
                      </Box>
                      
                      {/* Pending */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            width: 72,
                            height: 72,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${premiumTheme.colors.warning}25, ${premiumTheme.colors.warning}15)`,
                            border: `2px solid ${premiumTheme.colors.warning}40`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 8px 24px ${premiumTheme.colors.warning}20`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            mx: 'auto',
                            mb: 2,
                            '&:hover': {
                              transform: 'scale(1.1) rotate(5deg)',
                              boxShadow: `0 12px 32px ${premiumTheme.colors.warning}30`,
                            }
                          }}
                        >
                          <ScheduleIcon sx={{ fontSize: 28, color: premiumTheme.colors.warning }} />
                        </Box>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 800,
                            color: '#1f2937',
                            fontSize: { xs: '2rem', lg: '2.5rem' },
                            mb: 1
                          }}
                        >
                          {trend.pending}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#6b7280',
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}>
                          Bekleyen
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Total & Progress */}
                    <Box sx={{ 
                      background: 'rgba(248, 250, 252, 0.8)',
                      borderRadius: 3,
                      p: 3,
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      textAlign: 'center'
                    }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700,
                        color: '#1f2937',
                        mb: 2
                      }}>
                        Toplam: {trend.completed + trend.pending}
                      </Typography>
                      
                      {/* Progress Bar */}
                      <Box sx={{ 
                        width: '100%',
                        height: 8,
                        background: 'rgba(226, 232, 240, 0.5)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        mb: 2
                      }}>
                        <Box sx={{ 
                          width: `${trend.completed + trend.pending > 0 ? (trend.completed / (trend.completed + trend.pending)) * 100 : 0}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #10b981, #059669)',
                          transition: 'width 0.8s ease'
                        }} />
                      </Box>
                      
                      <Typography variant="body2" sx={{ 
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        Tamamlanma: {trend.completed + trend.pending > 0 ? Math.round((trend.completed / (trend.completed + trend.pending)) * 100) : 0}%
                      </Typography>
                    </Box>
                    
                    {/* Detay Butonu */}
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                      <Button
                        variant="outlined"
                        startIcon={<AnalyticsIcon />}
                        sx={{
                          borderColor: premiumTheme.colors.primary,
                          color: premiumTheme.colors.primary,
                          fontWeight: 600,
                          borderRadius: 3,
                          px: 3,
                          py: 1,
                          '&:hover': {
                            borderColor: premiumTheme.colors.primary,
                            backgroundColor: `${premiumTheme.colors.primary}10`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${premiumTheme.colors.primary}30`
                          }
                        }}
                      >
                        Detayları Gör
                      </Button>
                    </Box>
                  </Box>
                </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 4,
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                  backdropFilter: 'blur(20px)'
                }}>
                  <Typography variant="h5" sx={{ 
                    color: '#6b7280',
                    mb: 2,
                    fontWeight: 600
                  }}>
                    📅 Bu Kesim Listesinde İş Emri Bulunamadı
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#9ca3af',
                    maxWidth: '600px',
                    mx: 'auto',
                    lineHeight: 1.6
                  }}>
                    Seçilen kesim listesinde henüz iş emri bulunmuyor. 
                    İş emri eklediğinizde burada timeline analizi görünecektir.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
          
          {/* Premium Summary */}
          {trendChartData.length > 0 && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  fontWeight: 700,
                  color: '#1f2937',
                  mb: 4,
                }}
              >
                📊 Haftalık Performans Özeti
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#6b7280',
                  maxWidth: '800px',
                  mx: 'auto',
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  mb: 4,
                }}
              >
                Mevcut haftada toplam{' '}
                <strong style={{ 
                  color: premiumTheme.colors.primary,
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  {trendChartData.reduce((sum, trend) => sum + trend.completed + trend.pending, 0)}
                </strong>{' '}
                iş emri bulunuyor. Kesim listesindeki gerçek iş emri verileri ile hesaplanan analiz.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Detaylı Hafta Analizi Dialog */}
      {detailDialogOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={handleCloseDialog}
        >
          <Box
            sx={{
              width: '95%',
              maxWidth: '1400px',
              maxHeight: '95vh',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <Box sx={{ 
              background: `linear-gradient(135deg, ${premiumTheme.colors.primary} 0%, ${premiumTheme.colors.secondary} 100%)`,
              color: 'white',
              textAlign: 'center',
              py: 3,
              position: 'relative'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <CalendarIcon sx={{ fontSize: '2rem' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {selectedWeek?.period} Detaylı Analizi
                </Typography>
              </Box>
            </Box>
        
            {/* Modal Content */}
            <Box sx={{ p: 4, overflow: 'auto', flex: 1 }}>
          {selectedWeek && (
            <Box>
              {/* Hafta Bilgileri */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    background: `linear-gradient(135deg, ${premiumTheme.colors.success}15 0%, ${premiumTheme.colors.success}25 100%)`,
                    border: `2px solid ${premiumTheme.colors.success}30`,
                    borderRadius: 3
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <CheckCircleOutlineIcon sx={{ 
                        fontSize: '3rem', 
                        color: premiumTheme.colors.success,
                        mb: 2 
                      }} />
                      <Typography variant="h3" sx={{ 
                        fontWeight: 'bold',
                        color: premiumTheme.colors.success,
                        mb: 1
                      }}>
                        {selectedWeek.completed}
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#6b7280' }}>
                        Tamamlanan İş Emri
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    background: `linear-gradient(135deg, ${premiumTheme.colors.warning}15 0%, ${premiumTheme.colors.warning}25 100%)`,
                    border: `2px solid ${premiumTheme.colors.warning}30`,
                    borderRadius: 3
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <ScheduleIcon sx={{ 
                        fontSize: '3rem', 
                        color: premiumTheme.colors.warning,
                        mb: 2 
                      }} />
                      <Typography variant="h3" sx={{ 
                        fontWeight: 'bold',
                        color: premiumTheme.colors.warning,
                        mb: 1
                      }}>
                        {selectedWeek.pending}
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#6b7280' }}>
                        Bekleyen İş Emri
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Haftanın Günleri Detaylı */}
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold', 
                mb: 3, 
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CalendarIcon sx={{ color: premiumTheme.colors.primary }} />
                Haftanın Günleri ({selectedWeek.weekStart} - {selectedWeek.weekEnd})
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {selectedWeek.weekDays?.map((day: string, dayIndex: number) => {
                  const date = new Date(day);
                  const dayName = date.toLocaleDateString('tr-TR', { weekday: 'long' });
                  const dayNumber = date.getDate();
                  const month = date.toLocaleDateString('tr-TR', { month: 'long' });
                  
                  return (
                    <Grid item xs={6} sm={4} md={3} key={dayIndex}>
                      <Card sx={{ 
                        textAlign: 'center',
                        p: 2,
                        background: 'rgba(248, 250, 252, 0.8)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)',
                          border: `1px solid ${premiumTheme.colors.primary}`
                        }
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 'bold',
                          color: premiumTheme.colors.primary,
                          mb: 1
                        }}>
                          {dayNumber}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#6b7280',
                          fontSize: '0.75rem'
                        }}>
                          {dayName}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: '#9ca3af',
                          fontSize: '0.7rem'
                        }}>
                          {month}
                        </Typography>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Hafta Tarih Aralığı */}
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold', 
                mb: 3, 
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CalendarMonthIcon sx={{ color: premiumTheme.colors.primary }} />
                Hafta Tarih Aralığı
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3, 
                    background: `linear-gradient(135deg, ${premiumTheme.colors.primary}10 0%, ${premiumTheme.colors.primary}20 100%)`,
                    border: `1px solid ${premiumTheme.colors.primary}30`
                  }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, color: premiumTheme.colors.primary }}>
                      Başlangıç Tarihi
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {selectedWeek.weekStart ? new Date(selectedWeek.weekStart).toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Bilinmiyor'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3, 
                    background: `linear-gradient(135deg, ${premiumTheme.colors.secondary}10 0%, ${premiumTheme.colors.secondary}20 100%)`,
                    border: `1px solid ${premiumTheme.colors.secondary}30`
                  }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, color: premiumTheme.colors.secondary }}>
                      Bitiş Tarihi
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {selectedWeek.weekEnd ? new Date(selectedWeek.weekEnd).toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Bilinmiyor'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Hafta Günleri Detayı */}
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold', 
                mb: 3, 
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CalendarIcon sx={{ color: premiumTheme.colors.primary }} />
                Hafta Günleri Detayı
              </Typography>
              
              <TableContainer component={Paper} sx={{ 
                borderRadius: 3, 
                mb: 4,
                background: 'rgba(248, 250, 252, 0.8)'
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: `linear-gradient(135deg, ${premiumTheme.colors.primary}10 0%, ${premiumTheme.colors.primary}20 100%)` }}>
                      <TableCell sx={{ fontWeight: 'bold', color: premiumTheme.colors.primary }}>
                        Gün
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: premiumTheme.colors.primary }}>
                        Tarih
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: premiumTheme.colors.primary }}>
                        Durum
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedWeek.weekDays && selectedWeek.weekDays.map((day: string, index: number) => {
                      const dayNames: string[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                      const dayDate = new Date(day);
                      const isWeekend = index === 5; // Cumartesi
                      
                      return (
                        <TableRow key={day} sx={{ 
                          '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.05)' }
                        }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            {dayNames[index]}
                          </TableCell>
                          <TableCell>
                            {dayDate.toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={isWeekend ? 'Hafta Sonu' : 'Çalışma Günü'}
                              color={isWeekend ? 'default' : 'success'}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 3 }} />

              {/* Performans Metrikleri */}
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold', 
                mb: 3, 
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AnalyticsIcon sx={{ color: premiumTheme.colors.primary }} />
                Performans Metrikleri
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 3, borderRadius: 3, background: 'rgba(248, 250, 252, 0.8)' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Toplam İş Emri
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      color: premiumTheme.colors.primary,
                      fontWeight: 'bold'
                    }}>
                      {selectedWeek.completed + selectedWeek.pending}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 3, borderRadius: 3, background: 'rgba(248, 250, 252, 0.8)' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Tamamlanma Oranı
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      color: premiumTheme.colors.success,
                      fontWeight: 'bold'
                    }}>
                      {selectedWeek.completed + selectedWeek.pending > 0 
                        ? Math.round((selectedWeek.completed / (selectedWeek.completed + selectedWeek.pending)) * 100)
                        : 0}%
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
            </Box>
            
            {/* Modal Footer */}
            <Box sx={{ p: 3, justifyContent: 'center', display: 'flex' }}>
              <Button
                onClick={handleCloseDialog}
                variant="contained"
                sx={{
                  background: `linear-gradient(135deg, ${premiumTheme.colors.primary} 0%, ${premiumTheme.colors.secondary} 100%)`,
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 'bold',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                  }
                }}
              >
                Kapat
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default WorkOrderAnalysis;
/**
 * @fileoverview Kesim Detayları Dialog Component - 3 Sekme ile
 * @module KesimDetaylariDialog
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import { WorkOrder, Cut, StockSummary } from '../types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Engineering as EngineeringIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  ContentCut as CutIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';

interface KesimDetaylariDialogProps {
  open: boolean;
  workOrder: WorkOrder;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`kesim-detaylari-tabpanel-${index}`}
      aria-labelledby={`kesim-detaylari-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const KesimDetaylariDialog: React.FC<KesimDetaylariDialogProps> = ({
  open,
  workOrder,
  onClose
}) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Veri hesaplamaları
  const summaryData = useMemo(() => {
    if (!workOrder) return null;

    const totalPieces = workOrder.totalSegments || 0;
    const profileCount = workOrder.stockCount || 0;
    const totalWaste = (workOrder.cuts as Cut[])?.reduce((sum: number, cut: Cut) => sum + (cut.remainingLength || 0), 0) || 0;
    const totalUsed = (workOrder.cuts as Cut[])?.reduce((sum: number, cut: Cut) => sum + (cut.usedLength || 0), 0) || 0;
    const efficiency = workOrder.efficiency || 0;

    return {
      totalPieces,
      profileCount,
      totalWaste,
      totalUsed,
      efficiency,
      avgWastePerProfile: profileCount > 0 ? Math.round(totalWaste / profileCount) : 0,
      avgPiecesPerProfile: profileCount > 0 ? Math.round(totalPieces / profileCount) : 0
    };
  }, [workOrder]);

  // Stock summary computation for multi-stock optimization display
  const stockSummary = useMemo(() => {
    if (!workOrder?.cuts) return [];

    // Group cuts by stock length
    const grouped = new Map<number, Cut[]>();
    (workOrder.cuts as Cut[]).forEach(cut => {
      const stockLength = cut.stockLength;
      if (!grouped.has(stockLength)) {
        grouped.set(stockLength, []);
      }
      grouped.get(stockLength)!.push(cut);
    });

    // Create summary for each stock length
    return Array.from(grouped.entries()).map(([stockLength, stockCuts]) => {
      // Group patterns by planLabel
      const patternMap = new Map<string, number>();
      stockCuts.forEach(cut => {
        const pattern = cut.planLabel || `${cut.segmentCount || cut.segments?.length || 0} segments`;
        patternMap.set(pattern, (patternMap.get(pattern) || 0) + 1);
      });

      const patterns = Array.from(patternMap.entries()).map(([pattern, count]) => ({
        pattern,
        count
      }));

      const totalWaste = stockCuts.reduce((sum, cut) => sum + (cut.remainingLength || 0), 0);
      const totalUsed = stockCuts.reduce((sum, cut) => sum + (cut.usedLength || 0), 0);
      const totalStock = stockCuts.reduce((sum, cut) => sum + cut.stockLength, 0);
      const efficiency = totalStock > 0 ? (totalUsed / totalStock) * 100 : 0;

      return {
        stockLength,
        cutCount: stockCuts.length,
        patterns,
        avgWaste: stockCuts.length > 0 ? totalWaste / stockCuts.length : 0,
        totalWaste,
        efficiency
      };
    });
  }, [workOrder]);

  // Profil detayları
  const profileDetails = useMemo(() => {
    if (!workOrder?.cuts) return [];

    return (workOrder.cuts as Cut[]).map((cut: Cut, index: number) => {
      const waste = cut.remainingLength || 0;
      const used = cut.usedLength || 0;
      const efficiency = cut.stockLength > 0 ? ((used / cut.stockLength) * 100) : 0;
      
      return {
        id: cut.id || index,
        stockLength: cut.stockLength || 0,
        usedLength: used,
        wasteLength: waste,
        efficiency: efficiency,
        segmentCount: cut.segmentCount || cut.segments?.length || 0,
        profileType: cut.profileType || 'N/A'
      };
    });
  }, [workOrder]);

  // Trend verileri (örnek veriler - gerçek uygulamada API'den gelecek)
  const trendData = useMemo(() => {
    if (!workOrder) return null;

    // Örnek trend verileri
    // Real data from API - no mock data
    const last7Days: Array<{ efficiency: number; date: string; waste: number; pieces: number }> = [];

    const avgEfficiency = last7Days.reduce((sum, day) => sum + day.efficiency, 0) / last7Days.length;
    const totalWaste = last7Days.reduce((sum, day) => sum + day.waste, 0);
    const totalPieces = last7Days.reduce((sum, day) => sum + day.pieces, 0);

    return {
      last7Days,
      avgEfficiency,
      totalWaste,
      totalPieces,
      improvement: avgEfficiency - (workOrder.efficiency || 0)
    };
  }, [workOrder]);

  if (!workOrder || !summaryData) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(30,64,175,0.1)', // Industrial Harmony
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08)',
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)', // Industrial Harmony
        color: 'white',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <EngineeringIcon />
        İş Emri: {workOrder.workOrderId} - Kesim Detayları
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="kesim detayları sekmeleri">
          <Tab 
            label="Genel Özet" 
            icon={<AssessmentIcon />} 
            iconPosition="start"
            sx={{ minHeight: 60 }}
          />
          <Tab 
            label="Profil Detayları" 
            icon={<InventoryIcon />} 
            iconPosition="start"
            sx={{ minHeight: 60 }}
          />
          <Tab 
            label="Trend Analizi" 
            icon={<TrendingUpIcon />} 
            iconPosition="start"
            sx={{ minHeight: 60 }}
          />
        </Tabs>
      </Box>

      {/* Sekme 1: Genel Özet */}
      <TabPanel value={tabValue} index={0}>
        {/* Stock Summary Cards - Multi-stock optimization display */}
        {stockSummary.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom sx={{ mb: 3 }}>
              Stok Bazında Kesim Özeti
            </Typography>
            <Grid container spacing={3}>
              {stockSummary.map((summary, index) => (
                <Grid item xs={12} md={6} lg={4} key={summary.stockLength}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, rgba(30,64,175,0.05) 0%, rgba(124,58,237,0.05) 100%)',
                    border: '1px solid rgba(30,64,175,0.1)',
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          {summary.stockLength}mm Profil
                        </Typography>
                        <Chip 
                          label={`${summary.cutCount} kesim`} 
                          color="primary" 
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Kesim Desenleri:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {summary.patterns.map((pattern, patternIndex) => (
                            <Chip
                              key={patternIndex}
                              label={`${pattern.pattern} (${pattern.count})`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                        </Stack>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Toplam Fire
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="warning.main">
                            {summary.totalWaste.toLocaleString()}mm
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Verimlilik
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="success.main">
                            {summary.efficiency.toFixed(1)}%
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Ortalama Fire/Kesim
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {summary.avgWaste.toFixed(0)}mm
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Grid container spacing={3}>
          {/* Toplam Parça */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(30,64,175,0.05) 0%, rgba(124,58,237,0.05) 100%)', // Industrial Harmony
              border: '1px solid rgba(30,64,175,0.1)', // Industrial Harmony
              borderRadius: 3,
              height: '100%'
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                  {summaryData.totalPieces}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toplam Parça
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Profil Adedi */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(5,150,105,0.05) 0%, rgba(34,197,94,0.05) 100%)', // Precision Green
              border: '1px solid rgba(5,150,105,0.1)', // Precision Green
              borderRadius: 3,
              height: '100%'
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <InventoryIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
                <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
                  {summaryData.profileCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Profil Adedi
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Fire Miktarı */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(251,191,36,0.05) 100%)',
              border: '1px solid rgba(245,158,11,0.1)',
              borderRadius: 3,
              height: '100%'
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
                <Typography variant="h4" fontWeight="bold" color="warning.main" gutterBottom>
                  {summaryData.totalWaste.toLocaleString()}mm
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toplam Fire
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Verimlilik Oranı */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(124,58,237,0.05) 0%, rgba(167,139,250,0.05) 100%)', // Tech Purple
              border: '1px solid rgba(124,58,237,0.1)', // Tech Purple
              borderRadius: 3,
              height: '100%'
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                </Box>
                <Typography variant="h4" fontWeight="bold" color="secondary.main" gutterBottom>
                  {summaryData.efficiency.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Verimlilik Oranı
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Detaylı Bilgiler */}
          <Grid item xs={12}>
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Detaylı Analiz
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <TimelineIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Ortalama Fire/Profil
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {summaryData.avgWastePerProfile}mm
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <CutIcon color="success" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Ortalama Parça/Profil
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {summaryData.avgPiecesPerProfile} adet
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                {/* Verimlilik Progress Bar */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Verimlilik Dağılımı
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={summaryData.efficiency}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(124,58,237,0.1)', // Tech Purple
                      '& .MuiLinearProgress-bar': {
                      backgroundColor: summaryData.efficiency >= 95 ? '#059669' : // Precision Green
                                      summaryData.efficiency >= 90 ? '#f59e0b' : '#ef4444', // Efficiency Orange
                        borderRadius: 4
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">0%</Typography>
                    <Typography variant="caption" color="text.secondary">100%</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Sekme 2: Profil Detayları */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Profil #</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Stok Uzunluğu</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Kullanılan</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fire</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Verimlilik</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Parça Sayısı</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Profil Tipi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profileDetails.map((profile, index) => (
                <TableRow key={profile.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EngineeringIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      {index + 1}
                    </Box>
                  </TableCell>
                  <TableCell>{profile.stockLength}mm</TableCell>
                  <TableCell>
                    <Typography color="success.main" fontWeight="bold">
                      {profile.usedLength}mm
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="warning.main" fontWeight="bold">
                      {profile.wasteLength}mm
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${profile.efficiency.toFixed(1)}%`}
                      color={profile.efficiency >= 95 ? 'success' : profile.efficiency >= 90 ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold">
                      {profile.segmentCount} adet
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={profile.profileType} variant="outlined" size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Özet Kartları */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {profileDetails.reduce((sum, p) => sum + p.usedLength, 0).toLocaleString()}mm
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Toplam Kullanılan
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
              <Typography variant="h6" color="warning.main" fontWeight="bold">
                {profileDetails.reduce((sum, p) => sum + p.wasteLength, 0).toLocaleString()}mm
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Toplam Fire
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
              <Typography variant="h6" color="success.main" fontWeight="bold">
                {profileDetails.reduce((sum, p) => sum + p.segmentCount, 0)} adet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Toplam Parça
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Sekme 3: Trend Analizi */}
      <TabPanel value={tabValue} index={2}>
        {trendData ? (
          <Stack spacing={3}>
            {/* Trend Özeti */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {trendData.avgEfficiency.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    7 Günlük Ort. Verimlilik
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <ShowChartIcon sx={{ fontSize: 40, color: trendData.improvement >= 0 ? 'success.main' : 'error.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold" color={trendData.improvement >= 0 ? 'success.main' : 'error.main'}>
                    {trendData.improvement >= 0 ? '+' : ''}{trendData.improvement.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Verimlilik Değişimi
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold" color="warning.main">
                    {Math.round(trendData.totalWaste)}mm
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    7 Günlük Toplam Fire
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <AssessmentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold" color="info.main">
                    {trendData.totalPieces}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    7 Günlük Toplam Parça
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Günlük Trend Tablosu */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Son 7 Gün Trend Analizi
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Tarih</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Verimlilik</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Fire</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Parça Sayısı</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Trend</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {trendData.last7Days.map((day, index) => (
                        <TableRow key={day.date}>
                          <TableCell>
                            {new Date(day.date).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${day.efficiency.toFixed(1)}%`}
                              color={day.efficiency >= 95 ? 'success' : day.efficiency >= 90 ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{day.waste.toFixed(0)}mm</TableCell>
                          <TableCell>{day.pieces} adet</TableCell>
                          <TableCell>
                            <TrendingUpIcon 
                              sx={{ 
                                color: day.efficiency >= 95 ? 'success.main' : 'warning.main',
                                transform: day.efficiency >= 95 ? 'none' : 'rotate(180deg)'
                              }} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Performans Önerileri */}
            <Alert severity={trendData.avgEfficiency >= 95 ? 'success' : trendData.avgEfficiency >= 90 ? 'warning' : 'error'}>
              <AlertTitle>
                {trendData.avgEfficiency >= 95 ? 'Mükemmel Performans!' : 
                 trendData.avgEfficiency >= 90 ? 'İyi Performans' : 'İyileştirme Gerekli'}
              </AlertTitle>
              {trendData.avgEfficiency >= 95 ? 
                'Verimlilik oranınız çok yüksek. Bu seviyeyi koruyun!' :
                trendData.avgEfficiency >= 90 ?
                'Verimlilik oranınız iyi seviyede. %95 hedefine odaklanın.' :
                'Verimlilik oranınızı artırmak için profil optimizasyonu önerilir.'
              }
            </Alert>
          </Stack>
        ) : (
          <Alert severity="info">
            <AlertTitle>Trend Verisi Yok</AlertTitle>
            Bu iş emri için henüz trend verisi bulunmuyor.
          </Alert>
        )}
      </TabPanel>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)', // Industrial Harmony
            color: 'white',
            fontWeight: 'bold',
            px: 3,
            py: 1,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(30,64,175,0.3)', // Industrial Harmony
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #1e40af 100%)', // Industrial Harmony
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(30,64,175,0.4)', // Industrial Harmony
            },
          }}
        >
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

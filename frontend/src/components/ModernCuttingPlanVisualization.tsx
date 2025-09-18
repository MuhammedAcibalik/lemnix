/**
 * @fileoverview Modern Cutting Plan Visualization Component
 * @module ModernCuttingPlanVisualization
 * @version 2.0.0 - Enterprise Grade Modern Design
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider,
  Paper,
  Avatar,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Slider,
  Alert,
  Fab,
  Menu,
  MenuItem
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Palette as PaletteIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  LocalFlorist as EcoIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
  Architecture as ArchitectureIcon,
  Straighten as StraightenIcon,
  ColorLens as ColorLensIcon,
  Save as SaveIcon,
  ContentCopy as CopyIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { OptimizationResult } from '../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface ModernCuttingPlanProps {
  optimizationResult: OptimizationResult;
  stockLength?: number;
  title?: string;
  showStatistics?: boolean;
  showExportOptions?: boolean;
  onExport?: (format: ExportFormat) => void;
}

export interface CuttingStock {
  id: number;
  cuts: CuttingPiece[];
  wasteLength: number;
  efficiency: number;
  utilization: number;
  stockLength: number;
}

export interface CuttingPiece {
  id: string;
  length: number;
  quantity: number;
  profileType: string;
  color?: string;
  workOrderId?: string;
  productName?: string;
  priority?: 'high' | 'medium' | 'low';
  totalLength: number; // Toplam uzunluk (length × quantity)
  size?: string;
  note?: string;
}

export interface VisualizationSettings {
  viewMode: 'detailed' | 'compact' | 'timeline';
  showLabels: boolean;
  showMeasurements: boolean;
  showColors: boolean;
  showWaste: boolean;
  zoomLevel: number;
  colorScheme: 'material' | 'rainbow' | 'monochrome' | 'productivity';
}

export type ExportFormat = 'pdf' | 'excel' | 'image' | 'json';

// ============================================================================
// MODERN CUTTING PLAN VISUALIZATION COMPONENT
// ============================================================================

export const ModernCuttingPlanVisualization: React.FC<ModernCuttingPlanProps> = ({
  optimizationResult,
  stockLength = 6000,
  title = "Kesim Planı",
  showStatistics = true,
  showExportOptions = true,
  onExport
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [settings, setSettings] = useState<VisualizationSettings>({
    viewMode: 'detailed',
    showLabels: true,
    showMeasurements: true,
    showColors: true,
    showWaste: true,
    zoomLevel: 1,
    colorScheme: 'material'
  });

  const [selectedStock, setSelectedStock] = useState<number | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredPiece, setHoveredPiece] = useState<string | null>(null);
  const [quickMenuAnchor, setQuickMenuAnchor] = useState<null | HTMLElement>(null);
  const [stocksPerPage, setStocksPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const processedData = useMemo(() => {
    if (!optimizationResult?.cuts) return [];

    // Tüm çubuklardaki segmentleri topla ve grupla
    const allSegments = optimizationResult.cuts.flatMap((stock, stockIndex) => 
      stock.segments?.map(segment => ({
        ...segment,
        stockIndex,
        stockId: stockIndex
      })) || []
    );

    // Aynı profil + aynı uzunluk = tek bar, tüm adetleri topla!
    const globalGrouped = allSegments.reduce((acc, segment) => {
      const key = `${segment.profileType || 'Unknown'}-${segment.length || 0}`;
      if (!acc[key]) {
        acc[key] = {
          id: key,
          length: segment.length || 0,
          quantity: 0,
          profileType: segment.profileType || 'Unknown',
          color: segment.color || generateColorFromProfile(segment.profileType || 'Unknown'),
          workOrderId: segment.workOrderId || segment.workOrderItemId || 'Bilinmeyen',
          productName: segment.productName || 'Ürün',
          priority: determinePriority(segment.length || 0),
          totalLength: 0,
          stockIds: new Set<number>(),
          workOrderIds: new Set<string>(), // İş emri ID'lerini toplamak için
          colors: new Set<string>(), // Renk bilgilerini toplamak için
          sizes: new Set<string>(), // Ebat bilgilerini toplamak için
          notes: new Set<string>() // Not bilgilerini toplamak için
        };
      }
      acc[key].quantity += segment.quantity || 1;
      acc[key].totalLength += (segment.length || 0) * (segment.quantity || 1);
      acc[key].stockIds.add(segment.stockIndex);
      if (segment.workOrderId || segment.workOrderItemId) {
        acc[key].workOrderIds.add(segment.workOrderId || segment.workOrderItemId);
      }
      if (segment.color) {
        acc[key].colors.add(segment.color);
      }
      if (segment.size) {
        acc[key].sizes.add(segment.size);
      }
      if (segment.note) {
        acc[key].notes.add(segment.note);
      }
      return acc;
    }, {} as Record<string, any>);

    // Her grup için tek bar oluştur - ENTERPRISE GRADE HESAPLAMA
    return Object.values(globalGrouped).map((group, index) => {
      const groupData = group as any;
      const stockCount = groupData.stockIds.size;
      const totalStockLength = stockCount * stockLength; // Toplam çubuk uzunluğu
      const usedLength = groupData.totalLength; // Kullanılan uzunluk
      const wasteLength = totalStockLength - usedLength; // Gerçek fire
      const efficiency = totalStockLength > 0 ? (usedLength / totalStockLength) * 100 : 0; // Gerçek verimlilik
      const utilization = efficiency; // Kullanım oranı = verimlilik
      
      // İş emri bilgisini düzenle
      const workOrderIds = Array.from(groupData.workOrderIds || []);
      const workOrderDisplay = workOrderIds.length === 0 ? 'Bilinmeyen' :
                              workOrderIds.length === 1 ? workOrderIds[0] :
                              `Çoklu İş Emri (${workOrderIds.length})`;

      // Renk bilgisini düzenle
      const colors = Array.from(groupData.colors || []);
      const colorDisplay = colors.length === 0 ? undefined :
                          colors.length === 1 ? colors[0] :
                          colors[0]; // İlk rengi kullan

      // Ebat bilgisini düzenle
      const sizes = Array.from(groupData.sizes || []);
      const sizeDisplay = sizes.length === 0 ? undefined :
                         sizes.length === 1 ? sizes[0] :
                         sizes[0]; // İlk ebatı kullan

      // Not bilgisini düzenle
      const notes = Array.from(groupData.notes || []);
      const noteDisplay = notes.length === 0 ? undefined :
                         notes.length === 1 ? notes[0] :
                         notes[0]; // İlk notu kullan

      return {
        id: index,
        cuts: [{
          ...group,
          workOrderId: workOrderDisplay,
          color: colorDisplay,
          size: sizeDisplay,
          note: noteDisplay
        }],
        wasteLength: Math.max(0, wasteLength), // Fire negatif olamaz
        efficiency: Math.min(100, Math.max(0, efficiency)), // Verimlilik 0-100 arası
        utilization: Math.min(100, Math.max(0, utilization)), // Kullanım 0-100 arası
        stockLength: stockLength,
        stockCount: stockCount,
        totalStockLength: totalStockLength,
        usedLength: usedLength
      };
    });
  }, [optimizationResult, stockLength]);

  const overallStatistics = useMemo(() => {
    // ENTERPRISE GRADE İSTATİSTİK HESAPLAMA
    const totalStocks = processedData.reduce((sum, stock) => sum + (stock as any).stockCount, 0);
    const totalWaste = processedData.reduce((sum, stock) => sum + stock.wasteLength, 0);
    const totalUsedLength = processedData.reduce((sum, stock) => sum + (stock as any).usedLength, 0);
    const totalStockLength = processedData.reduce((sum, stock) => sum + (stock as any).totalStockLength, 0);
    
    // Gerçek verimlilik hesaplama
    const overallEfficiency = totalStockLength > 0 ? (totalUsedLength / totalStockLength) * 100 : 0;
    
    // Ortalama verimlilik (ağırlıklı)
    const weightedEfficiency = processedData.length > 0 
      ? processedData.reduce((sum, stock) => sum + (stock.efficiency * (stock as any).stockCount), 0) / totalStocks
      : 0;
    
    const totalPieces = processedData.reduce((sum, stock) => sum + stock.cuts[0]?.quantity || 0, 0);
    const wastePercentage = totalStockLength > 0 ? (totalWaste / totalStockLength) * 100 : 0;
    
    // Maliyet hesaplama (örnek fiyat: 45.50 TL/m)
    const materialCost = (totalStockLength / 1000) * 45.50; // mm'den m'ye çevir
    const wasteCost = (totalWaste / 1000) * 45.50;
    const usedCost = (totalUsedLength / 1000) * 45.50;

    return {
      totalStocks,
      totalWaste,
      averageEfficiency: weightedEfficiency,
      overallEfficiency,
      totalPieces,
      totalUsedLength,
      totalStockLength,
      wastePercentage,
      materialCost,
      wasteCost,
      usedCost,
      costEfficiency: materialCost > 0 ? (usedCost / materialCost) * 100 : 0
    };
  }, [processedData, stockLength]);

  // Sadece sayfalama - gruplama yok!
  const paginatedData = useMemo(() => {
    const totalPages = Math.ceil(processedData.length / stocksPerPage);
    const startIndex = currentPage * stocksPerPage;
    const paginatedData = processedData.slice(startIndex, startIndex + stocksPerPage);

    return {
      data: paginatedData,
      totalPages,
      totalStocks: processedData.length,
      showingCount: paginatedData.length
    };
  }, [processedData, stocksPerPage, currentPage]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  function generateColorFromProfile(profileType: string): string {
    const colors = {
      'KAPALI ALT': '#1976d2',
      'AÇIK ALT': '#388e3c',
      'L': '#f57c00',
      'U': '#7b1fa2',
      'KARE': '#d32f2f',
      'YUVARLAK': '#00796b',
      'DEFAULT': '#616161'
    };
    
    return colors[profileType as keyof typeof colors] || colors.DEFAULT;
  }

  function determinePriority(length: number): 'high' | 'medium' | 'low' {
    if (length > 4000) return 'high';
    if (length > 2000) return 'medium';
    return 'low';
  }

  function getEfficiencyColor(efficiency: number): string {
    if (efficiency >= 90) return '#4caf50'; // Green
    if (efficiency >= 80) return '#ff9800'; // Orange
    if (efficiency >= 70) return '#ff5722'; // Red-Orange
    return '#f44336'; // Red
  }

  function formatLength(length: number): string {
    // Her zaman mm olarak göster
    return `${length}mm`;
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleZoom = (direction: 'in' | 'out') => {
    setSettings(prev => ({
      ...prev,
      zoomLevel: direction === 'in' 
        ? Math.min(prev.zoomLevel * 1.2, 3)
        : Math.max(prev.zoomLevel / 1.2, 0.5)
    }));
  };

  const handleExport = (format: ExportFormat) => {
    if (onExport) {
      onExport(format);
    } else {
      // Default export logic
      console.log(`Exporting as ${format}...`);
    }
  };

  const handleStockClick = (stockId: number) => {
    setSelectedStock(selectedStock === stockId ? null : stockId);
  };

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================


  const renderStockVisualization = (stock: CuttingStock) => {
    const scale = settings.zoomLevel;
    const maxWidth = 800; // Maximum visualization width
    const actualWidth = maxWidth * scale;
    
    return (
      <Card
        key={stock.id}
        elevation={selectedStock === stock.id ? 8 : 2}
        sx={{
          mb: 3,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: selectedStock === stock.id ? '2px solid #1976d2' : '1px solid transparent',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)'
          }
        }}
        onClick={() => handleStockClick(stock.id)}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Stock Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: getEfficiencyColor(stock.efficiency), width: 40, height: 40 }}>
                <ArchitectureIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                  {stock.cuts[0]?.profileType || 'Bilinmeyen Profil'}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#d32f2f',
                    fontSize: '1.1rem',
                    mt: 1,
                    p: 1,
                    bgcolor: '#fff3e0',
                    borderRadius: 1,
                    border: '2px solid #ff9800'
                  }}
                >
                  Her bir parçası {formatLength(stock.cuts[0]?.length || 0)} olacak şekilde toplam {stock.cuts[0]?.quantity || 0} adet kadar kesiniz
                </Typography>
                {(stock as any).stockCount > 1 && (
                  <Typography variant="caption" color="info.main" sx={{ display: 'block', mt: 0.5 }}>
                    ({stock.cuts[0]?.quantity || 0} adet × {(stock as any).stockCount} çubuk = {((stock.cuts[0]?.quantity || 0) * (stock as any).stockCount)} toplam)
                  </Typography>
                )}
              </Box>
            </Stack>
            
            <Stack direction="row" spacing={1}>
              <Chip
                icon={<SpeedIcon />}
                label={`${stock.efficiency.toFixed(1)}%`}
                color={stock.efficiency >= 85 ? 'success' : stock.efficiency >= 70 ? 'warning' : 'error'}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                icon={<EcoIcon />}
                label={`Fire: ${formatLength(stock.wasteLength)}`}
                variant="outlined"
                color={stock.wasteLength < 100 ? 'success' : 'warning'}
              />
            </Stack>
          </Stack>

          {/* Stock Visualization Bar */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                width: '100%',
                height: settings.viewMode === 'compact' ? 50 : 70,
                border: '2px solid #e0e0e0',
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 25%, #f1f3f4 50%, #ffffff 75%, #f8f9fa 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '40%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 100%)',
                  pointerEvents: 'none',
                  borderRadius: '3px 3px 0 0'
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '20%',
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.01) 100%)',
                  pointerEvents: 'none',
                  borderRadius: '0 0 3px 3px'
                }
              }}
            >
              {/* Cutting Pieces */}
              {stock.cuts.map((piece, index) => {
                const widthPercentage = (piece.totalLength / stock.stockLength) * 100;
                const leftPosition = stock.cuts
                  .slice(0, index)
                  .reduce((sum, p) => sum + (p.totalLength / stock.stockLength) * 100, 0);

                return (
                  <Tooltip
                    key={piece.id}
                    title={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {piece.profileType}
                        </Typography>
                        <Typography variant="body2">
                          Uzunluk: {formatLength(piece.length)} × {piece.quantity} adet
                        </Typography>
                        <Typography variant="body2">
                          Toplam: {formatLength(piece.totalLength)}
                        </Typography>
                        {piece.workOrderId && (
                          <Typography variant="body2">
                            İş Emri: {piece.workOrderId}
                          </Typography>
                        )}
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${leftPosition}%`,
                        width: `${widthPercentage}%`,
                        height: '100%',
                        background: settings.showColors 
                          ? `linear-gradient(135deg, ${piece.color} 0%, ${piece.color}cc 50%, ${piece.color}aa 100%)`
                          : 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
                        border: hoveredPiece === piece.id ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.3)',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: hoveredPiece === piece.id 
                          ? '0 8px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                          : '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '50%',
                          background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
                          borderRadius: '2px 2px 0 0',
                          pointerEvents: 'none'
                        },
                        '&:hover': {
                          transform: 'translateY(-2px) scaleY(1.05)',
                          zIndex: 10,
                          boxShadow: '0 12px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                          border: '2px solid #ffffff'
                        }
                      }}
                      onMouseEnter={() => setHoveredPiece(piece.id)}
                      onMouseLeave={() => setHoveredPiece(null)}
                    >
                      {settings.showLabels && widthPercentage > 8 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'white',
                            fontWeight: 600,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                            fontSize: settings.viewMode === 'compact' ? '0.7rem' : '0.75rem',
                            textAlign: 'center'
                          }}
                        >
                          {piece.profileType.length > 6 
                            ? piece.profileType.substring(0, 6) + '...'
                            : piece.profileType
                          }
                          {piece.quantity > 1 && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                fontSize: '0.6rem',
                                opacity: 0.9
                              }}
                            >
                              {piece.quantity}×
                            </Typography>
                          )}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                );
              })}

              {/* Waste Area */}
              {stock.wasteLength > 0 && settings.showWaste && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: 0,
                    width: `${(stock.wasteLength / stock.stockLength) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 25%, #ffcdd2 50%, #ffebee 75%, #ffebee 100%)',
                    border: '1px solid #f44336',
                    borderRadius: '0 2px 2px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 2px 4px rgba(244,67,54,0.1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '30%',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                      borderRadius: '0 2px 0 0',
                      pointerEvents: 'none'
                    }
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ 
                      color: '#d32f2f', 
                      fontWeight: 700,
                      textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                      fontSize: '0.75rem'
                    }}
                  >
                    FİRE
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Measurements */}
            {settings.showMeasurements && (
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, px: 2 }}>
                <Box sx={{ 
                  bgcolor: '#f5f5f5', 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                    0mm
                  </Typography>
                </Box>
                <Box sx={{ 
                  bgcolor: '#f5f5f5', 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                    {formatLength(stock.stockLength)}
                  </Typography>
                </Box>
              </Stack>
            )}
          </Box>

          {/* Detailed View */}
          {selectedStock === stock.id && (
            <Accordion sx={{ mt: 2 }} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Parça Detayları ({stock.cuts.length} parça)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {stock.cuts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Bu çubukta parça bulunmuyor.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {stock.cuts.map((piece, index) => (
                    <Grid item xs={12} key={piece.id}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            border: '1px solid #1976d2'
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={3}>
                          <Avatar
                            sx={{
                              bgcolor: piece.color || '#1976d2',
                              width: 40,
                              height: 40,
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              border: '2px solid #ffffff'
                            }}
                          >
                            {index + 1}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            {/* Ana Bilgi Satırı */}
                            <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', minWidth: 120 }}>
                                {piece.profileType}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#d32f2f', minWidth: 150 }}>
                                {formatLength(piece.length)} × {piece.quantity} adet
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                Toplam: {formatLength(piece.totalLength)}
                              </Typography>
                            </Stack>
                            
                            {/* Detay Bilgi Satırı */}
                            <Stack direction="row" alignItems="center" spacing={4}>
                              {/* İş Emri */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', minWidth: 60 }}>
                                  İş Emri:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                  {piece.workOrderId || 'Bilinmeyen'}
                                </Typography>
                              </Box>
                              
                              {/* Ürün */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', minWidth: 50 }}>
                                  Ürün:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                  {piece.productName || 'Bilinmeyen'}
                                </Typography>
                              </Box>
                              
                              {/* Ebat */}
                              {piece.size && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', minWidth: 40 }}>
                                    Ebat:
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                    {piece.size}
                                  </Typography>
                                </Box>
                              )}
                              
                              {/* Renk */}
                              {piece.color && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', minWidth: 40 }}>
                                    Renk:
                                  </Typography>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box
                                      sx={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        bgcolor: piece.color,
                                        border: '1px solid #ffffff',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                      }}
                                    />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                      {piece.color}
                                    </Typography>
                                  </Stack>
                                </Box>
                              )}
                              
                              {/* Not */}
                              {piece.note && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#e65100', minWidth: 40 }}>
                                    Not:
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#e65100', fontStyle: 'italic' }}>
                                    {piece.note}
                                  </Typography>
                                </Box>
                              )}
                              
                              {/* Öncelik */}
                              <Chip
                                size="small"
                                label={piece.priority?.toUpperCase() || 'NORMAL'}
                                color={
                                  piece.priority === 'high' ? 'error' :
                                  piece.priority === 'medium' ? 'warning' : 'success'
                                }
                                sx={{ 
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                  height: 24
                                }}
                              />
                            </Stack>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                    ))}
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderStatistics = () => (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
            <AnalyticsIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Optimizasyon İstatistikleri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kesim planı performans analizi
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                {overallStatistics.totalStocks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Çubuk
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatLength(overallStatistics.totalStockLength)} toplam
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e8' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {overallStatistics.overallEfficiency.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Genel Verimlilik
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatLength(overallStatistics.totalUsedLength)} kullanıldı
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {formatLength(overallStatistics.totalWaste)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Fire
              </Typography>
              <Typography variant="caption" color="text.secondary">
                %{overallStatistics.wastePercentage.toFixed(1)} fire oranı
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: '#fce4ec' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#e91e63' }}>
                ₺{overallStatistics.materialCost.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Maliyet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ₺{overallStatistics.wasteCost.toFixed(0)} fire maliyeti
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Efficiency Progress */}
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Genel Verimlilik
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {overallStatistics.overallEfficiency.toFixed(1)}% / 100%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={overallStatistics.overallEfficiency}
            sx={{
              height: 8,
              borderRadius: 4,
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: `linear-gradient(90deg, ${getEfficiencyColor(overallStatistics.overallEfficiency)}, ${getEfficiencyColor(overallStatistics.overallEfficiency)}aa)`
              }
            }}
          />
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Kullanılan: {formatLength(overallStatistics.totalUsedLength)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Fire: {formatLength(overallStatistics.totalWaste)} (%{overallStatistics.wastePercentage.toFixed(1)})
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );

  const renderControls = () => (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          {/* View Controls */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="Yakınlaştır">
              <IconButton onClick={() => handleZoom('in')} disabled={settings.zoomLevel >= 3}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Uzaklaştır">
              <IconButton onClick={() => handleZoom('out')} disabled={settings.zoomLevel <= 0.5}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Tam Ekran">
              <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ayarlar">
              <IconButton onClick={() => setShowSettingsDialog(true)}>
                <PaletteIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* View Mode Toggle */}
          <Stack direction="row" spacing={1}>
            <Button
              variant={settings.viewMode === 'detailed' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<ViewListIcon />}
              onClick={() => setSettings(prev => ({ ...prev, viewMode: 'detailed' }))}
            >
              Detaylı
            </Button>
            <Button
              variant={settings.viewMode === 'compact' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<ViewModuleIcon />}
              onClick={() => setSettings(prev => ({ ...prev, viewMode: 'compact' }))}
            >
              Kompakt
            </Button>
          </Stack>

          {/* Pagination Controls */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              ← Önceki
            </Button>
            
            <Typography variant="body2" sx={{ px: 1 }}>
              {currentPage + 1} / {paginatedData.totalPages}
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage >= paginatedData.totalPages - 1}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Sonraki →
            </Button>
          </Stack>

          {/* Export Options */}
          {showExportOptions && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('pdf')}
              >
                PDF
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
              >
                Yazdır
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!optimizationResult || !processedData.length) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body1">
          Görüntülenecek kesim planı bulunamadı. Önce optimizasyon çalıştırın.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box ref={containerRef} sx={{ maxWidth: '100%', mx: 'auto', p: 2 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {paginatedData.showingCount} / {paginatedData.totalStocks} profil • {overallStatistics.totalPieces} parça • %{overallStatistics.overallEfficiency.toFixed(1)} verimlilik • {formatLength(overallStatistics.totalWaste)} fire
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<InfoIcon />}
          onClick={() => setShowStatsDialog(true)}
          sx={{ borderRadius: 3 }}
        >
          Detaylı İstatistikler
        </Button>
      </Stack>

      {/* Controls */}
      {renderControls()}

      {/* Statistics */}
      {showStatistics && renderStatistics()}

      {/* Main Visualization */}
      <Box sx={{ transform: `scale(${settings.zoomLevel})`, transformOrigin: 'top left' }}>
        {paginatedData.data.map(renderStockVisualization)}
      </Box>

      {/* Pagination Info */}
      {paginatedData.totalPages > 1 && (
        <Card elevation={1} sx={{ mt: 3, bgcolor: 'grey.50' }}>
          <CardContent sx={{ py: 2 }}>
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Sayfa {currentPage + 1} / {paginatedData.totalPages} 
                • {paginatedData.showingCount} profil gösteriliyor
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Settings Dialog */}
      <Dialog
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Görünüm Ayarları</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showLabels}
                  onChange={(e) => setSettings(prev => ({ ...prev, showLabels: e.target.checked }))}
                />
              }
              label="Profil Etiketlerini Göster"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showMeasurements}
                  onChange={(e) => setSettings(prev => ({ ...prev, showMeasurements: e.target.checked }))}
                />
              }
              label="Ölçüleri Göster"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showColors}
                  onChange={(e) => setSettings(prev => ({ ...prev, showColors: e.target.checked }))}
                />
              }
              label="Renkleri Göster"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showWaste}
                  onChange={(e) => setSettings(prev => ({ ...prev, showWaste: e.target.checked }))}
                />
              }
              label="Fire Alanlarını Göster"
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Yakınlaştırma: {(settings.zoomLevel * 100).toFixed(0)}%
              </Typography>
              <Slider
                value={settings.zoomLevel}
                onChange={(_, value) => setSettings(prev => ({ ...prev, zoomLevel: value as number }))}
                min={0.5}
                max={3}
                step={0.1}
                marks={[
                  { value: 0.5, label: '50%' },
                  { value: 1, label: '100%' },
                  { value: 2, label: '200%' },
                  { value: 3, label: '300%' }
                ]}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettingsDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Quick Actions */}
      <Fab
        color="primary"
        aria-label="Hızlı İşlemler"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={(event) => setQuickMenuAnchor(event.currentTarget)}
      >
        <MoreVertIcon />
      </Fab>

      {/* Quick Actions Menu */}
      <Menu
        anchorEl={quickMenuAnchor}
        open={Boolean(quickMenuAnchor)}
        onClose={() => setQuickMenuAnchor(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { handleExport('json'); setQuickMenuAnchor(null); }}>
          <SaveIcon sx={{ mr: 1 }} /> Kaydet
        </MenuItem>
        <MenuItem onClick={() => { handleExport('image'); setQuickMenuAnchor(null); }}>
          <ShareIcon sx={{ mr: 1 }} /> Paylaş
        </MenuItem>
        <MenuItem onClick={() => { navigator.clipboard.writeText(JSON.stringify(optimizationResult)); setQuickMenuAnchor(null); }}>
          <CopyIcon sx={{ mr: 1 }} /> Kopyala
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ModernCuttingPlanVisualization;

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Alert,
  Chip,
  CircularProgress,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Fade,
  Zoom,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Refresh, 
  CheckCircle, 
  Inventory as ProductIcon,
  Assignment as WorkOrderIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PlayArrow as ApplyIcon,
  ExpandMore as ExpandMoreIcon,
  Category as ProfileIcon,
  Straighten as MeasurementIcon,
  Numbers as QuantityIcon,
  Work as WorkIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon
} from '@mui/icons-material';
import { excelApi, WorkOrderItem } from '../services/excelApi';
import { OptimizationItem } from '../types';

interface ExcelProductSelectorProps {
  onWorkOrdersSelected: (items: OptimizationItem[]) => void;
}

export const ExcelProductSelector: React.FC<ExcelProductSelectorProps> = ({ 
  onWorkOrdersSelected 
}) => {
  const [products, setProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Ürün listesini yükle
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await excelApi.getProductList();
      if (result.success && result.data) {
        setProducts([...result.data.products]);
        if (result.warnings && result.warnings.length > 0) {
          console.warn('Excel uyarıları:', result.warnings);
        }
      } else {
        setError(result.error || 'Ürün listesi alınamadı');
      }
    } catch (err) {
      setError('Ürün listesi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // İş emirlerini yükle
  const loadWorkOrders = async (productName: string) => {
    setLoading(true);
    setError(null);
    try {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('Loading work orders for product:', productName);
      }
      const result = await excelApi.getWorkOrdersByProduct(productName);
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('LoadWorkOrders result:', result);
      }
      
      if (result.success && result.data) {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          console.log('Setting work orders:', result.data.workOrders);
        }
        setWorkOrders([...result.data.workOrders]);
        if (result.warnings && result.warnings.length > 0) {
          console.warn('İş emri uyarıları:', result.warnings);
        }
      } else {
        console.error('LoadWorkOrders failed:', result.error, result.details);
        setError(result.error || 'İş emirleri alınamadı');
      }
    } catch (err) {
      console.error('LoadWorkOrders exception:', err);
      setError('İş emirleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };



  // Excel'i yenile
  const reloadExcel = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await excelApi.reloadExcelFile();
      if (result.success) {
        setSuccess('Excel dosyası başarıyla yenilendi');
        await loadProducts(); // Ürün listesini yeniden yükle
      } else {
        setError(result.error || 'Excel yenilenemedi');
      }
    } catch (err) {
      setError('Excel yenilenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // İş emirlerini OptimizationItem'a dönüştür
  const convertToOptimizationItems = (): OptimizationItem[] => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('Converting work orders to optimization items:', workOrders);
    }
    
    const converted: OptimizationItem[] = [];
    let itemIndex = 0;

    workOrders.forEach(workOrder => {
      try {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          console.log('Processing work order:', workOrder);
        }
        
        // Her profili ayrı bir optimization item olarak ekle
        workOrder.profiles.forEach(profile => {
          // Ölçüyü mm'ye çevir
          let lengthInMm = 1000; // Varsayılan 100cm = 1000mm
          
          if (profile.measurement) {
            const measurementStr = profile.measurement.toString().trim();
            if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
              console.log('Processing measurement:', measurementStr);
            }
            
            // MM etiketli veriler için
            if (measurementStr.toUpperCase().includes('MM')) {
              let cleanMeasurement = measurementStr.replace(/\s*MM$/i, '').trim();
              cleanMeasurement = cleanMeasurement.replace(',', '.');
              const lengthInMmValue = parseFloat(cleanMeasurement);
              if (!isNaN(lengthInMmValue) && lengthInMmValue > 0) {
                lengthInMm = Math.round(lengthInMmValue); // Already in mm, no conversion
                if (process.env.NODE_ENV !== 'production') {
                  console.log(`🔍 ExcelProductSelector: ${cleanMeasurement} MM → ${lengthInMm} MM (no conversion)`);
                }
              }
            }
            // CM etiketli veriler için
            else if (measurementStr.toUpperCase().includes('CM')) {
              let cleanMeasurement = measurementStr.replace(/\s*CM$/i, '').trim();
              cleanMeasurement = cleanMeasurement.replace(',', '.');
              const lengthInCm = parseFloat(cleanMeasurement);
              if (!isNaN(lengthInCm) && lengthInCm > 0) {
                lengthInMm = Math.round(lengthInCm * 10);
                // Debug: Check for potential double scaling
                if (process.env.NODE_ENV !== 'production') {
                  console.log(`🔍 ExcelProductSelector: ${cleanMeasurement} CM → ${lengthInMm} MM`);
                  if (lengthInMm > 10000) { // Suspiciously large (10m+)
                    console.warn(`⚠️ Warning: Very large length detected: ${lengthInMm}mm from ${cleanMeasurement}cm. Check if input is already in mm.`);
                  }
                }
              }
            }
            // Etiket yoksa varsayılan olarak cm kabul et
            else {
              let cleanMeasurement = measurementStr.replace(',', '.');
              const lengthInCm = parseFloat(cleanMeasurement);
              if (!isNaN(lengthInCm) && lengthInCm > 0) {
                lengthInMm = Math.round(lengthInCm * 10);
                if (process.env.NODE_ENV !== 'production') {
                  console.log(`🔍 ExcelProductSelector: ${cleanMeasurement} (no unit) → ${lengthInMm} MM (assumed cm)`);
                }
              }
            }
          }

          const item: OptimizationItem = {
            profileType: profile.profileType || 'Bilinmeyen Profil',
            length: lengthInMm,
            quantity: profile.quantity || 1,
            totalLength: lengthInMm * (profile.quantity || 1),
            originalIndex: itemIndex++,
            // Excel metadata bilgilerini ekle
            metadata: {
              color: workOrder.metadata.color || 'Standart',
              note: workOrder.metadata.note || '-',
              size: workOrder.metadata.size || `${lengthInMm}mm`,
              date: workOrder.metadata.date,
              version: workOrder.metadata.version,
              sipQuantity: workOrder.metadata.sipQuantity,
              workOrderId: workOrder.workOrderId
            }
          };

          if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            console.log('Converted profile to item:', item);
          }
          converted.push(item);
        });
      } catch (error) {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          console.log('Filtered out - conversion error:', workOrder, error);
        }
      }
    });
    
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('Final converted items:', converted);
    }
    return converted;
  };

  // İş emirlerini uygula
  const applyWorkOrders = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('Applying work orders for product:', selectedProduct);
      console.log('Total work orders available:', workOrders.length);
      console.log('Raw work orders data:', workOrders);
    }
    
    const items = convertToOptimizationItems();
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('Converted items count:', items.length);
      console.log('Converted items with metadata:', items);
    }
    
    if (items.length > 0) {
      onWorkOrdersSelected(items);
      setSuccess(`${items.length} adet profil başarıyla uygulandı`);
      setError(null);
    } else {
      // Daha detaylı hata mesajı
      console.error('No valid items found:', {
        workOrdersCount: workOrders.length,
        workOrdersData: workOrders,
        selectedProduct
      });
      
      if (workOrders.length === 0) {
        setError(`"${selectedProduct}" ürünü için iş emri bulunamadı. Bu ürün Excel dosyasında veri içermiyor olabilir.`);
      } else {
        // İş emirleri var ama profil verileri geçersiz
        const totalProfiles = workOrders.reduce((sum, wo) => sum + wo.profiles.length, 0);
        const totalQuantity = workOrders.reduce((sum, wo) => sum + wo.totalQuantity, 0);
        
        setError(`"${selectedProduct}" ürünü için ${workOrders.length} iş emri bulundu ancak geçerli profil verisi yok. (Profil: ${totalProfiles}, Miktar: ${totalQuantity}). Excel dosyasındaki veri formatını kontrol edin.`);
      }
      setSuccess(null);
    }
  };

  // Ürün seçildiğinde iş emirlerini yükle
  useEffect(() => {
    if (selectedProduct) {
      loadWorkOrders(selectedProduct);
    } else {
      setWorkOrders([]);
    }
  }, [selectedProduct]);

  // İlk yükleme
  useEffect(() => {
    loadProducts();
  }, []);

  const validItems = convertToOptimizationItems();
  const totalProfiles = workOrders.reduce((sum, wo) => sum + wo.profiles.length, 0);
  const totalQuantity = workOrders.reduce((sum, wo) => sum + wo.totalQuantity, 0);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Header Section */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
          color: 'white',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  width: 56,
                  height: 56
                }}
              >
                <ProductIcon sx={{ fontSize: 28 }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Ürün Seçimi ve Profil Yönetimi
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Excel dosyanızdan ürünleri seçin ve detaylı profil bilgileriyle optimizasyon yapın
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Detaylı Görünüm">
                  <IconButton
                    onClick={() => setShowDetailedView(!showDetailedView)}
                    sx={{
                      color: 'white',
                      bgcolor: showDetailedView ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                      }
                    }}
                  >
                    {showDetailedView ? <HideIcon /> : <ViewIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excel Dosyasını Yenile">
                  <IconButton
                    onClick={reloadExcel}
                    disabled={loading}
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                      }
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Status Alerts */}
      <Fade in={!!error || !!success}>
        <Box sx={{ mb: 3 }}>
          {error && (
            <Alert 
              severity="error" 
              icon={<WarningIcon />}
              sx={{ 
                borderRadius: 2,
                '& .MuiAlert-message': { fontWeight: 500 }
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert 
              severity="success" 
              icon={<CheckCircle />}
              sx={{ 
                borderRadius: 2,
                '& .MuiAlert-message': { fontWeight: 500 }
              }}
            >
              {success}
            </Alert>
          )}
        </Box>
      </Fade>

      <Grid container spacing={3}>
        {/* Product Selection Card */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              height: 'fit-content',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: '#1a237e',
                    width: 40,
                    height: 40,
                    mr: 2
                  }}
                >
                  <ProductIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                    Ürün Seçimi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {products.length} ürün mevcut
                  </Typography>
                </Box>
              </Box>

              {loading && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress sx={{ borderRadius: 1 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Yükleniyor...
                  </Typography>
                </Box>
              )}

              <FormControl fullWidth>
                <InputLabel sx={{ color: '#1a237e', fontWeight: 500 }}>
                  Ürün Seçin
                </InputLabel>
                <Select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  disabled={loading || products.length === 0}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.12)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1a237e',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1a237e',
                    },
                  }}
                >
                  {products.map((product, index) => (
                    <MenuItem key={`${product}-${index}`} value={product}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ProductIcon sx={{ mr: 1, fontSize: 18, color: '#1a237e' }} />
                        {product}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {products.length === 0 && !loading && (
                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  <InfoIcon sx={{ mr: 1 }} />
                  Henüz ürün bulunamadı. Excel dosyasını yükleyin.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Work Orders and Profiles Card */}
        <Grid item xs={12} md={8}>
          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: '#2196f3',
                    width: 40,
                    height: 40,
                    mr: 2
                  }}
                >
                  <WorkOrderIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2196f3' }}>
                    İş Emirleri ve Profiller
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedProduct ? `${selectedProduct} ürünü için detaylı profil bilgileri` : 'Ürün seçin'}
                  </Typography>
                </Box>
                {selectedProduct && workOrders.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Badge badgeContent={workOrders.length} color="primary">
                      <Chip
                        label="İş Emri"
                        size="small"
                        variant="outlined"
                        icon={<WorkOrderIcon sx={{ fontSize: 14 }} />}
                        sx={{ borderColor: '#2196f3', color: '#2196f3' }}
                      />
                    </Badge>
                    <Badge badgeContent={totalProfiles} color="secondary">
                      <Chip
                        label="Profil"
                        size="small"
                        variant="outlined"
                        icon={<ProfileIcon sx={{ fontSize: 14 }} />}
                        sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                      />
                    </Badge>
                    <Badge badgeContent={totalQuantity} color="success">
                      <Chip
                        label="Toplam"
                        size="small"
                        variant="outlined"
                        icon={<QuantityIcon sx={{ fontSize: 14 }} />}
                        sx={{ borderColor: '#4caf50', color: '#4caf50' }}
                      />
                    </Badge>
                  </Box>
                )}
              </Box>

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={40} sx={{ color: '#2196f3' }} />
                </Box>
              )}

              {selectedProduct && workOrders.length > 0 && !loading && (
                <>
                  {/* Summary Stats */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                        <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
                          {workOrders.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          İş Emri
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
                        <Typography variant="h6" sx={{ color: '#7b1fa2', fontWeight: 600 }}>
                          {totalProfiles}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Profil
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e8' }}>
                        <Typography variant="h6" sx={{ color: '#388e3c', fontWeight: 600 }}>
                          {totalQuantity}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Toplam Adet
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                        <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 600 }}>
                          {validItems.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Geçerli
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Work Orders Detail List */}
                  {showDetailedView && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#666' }}>
                        Detaylı İş Emri Görünümü
                      </Typography>
                      {workOrders.map((workOrder, index) => (
                        <Accordion 
                          key={`${workOrder.workOrderId}-${index}`}
                          sx={{ 
                            mb: 1, 
                            '&:before': { display: 'none' },
                            boxShadow: 'none',
                            border: '1px solid rgba(0,0,0,0.12)',
                            borderRadius: '8px !important'
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ 
                              bgcolor: 'rgba(33, 150, 243, 0.02)',
                              '&.Mui-expanded': { bgcolor: 'rgba(33, 150, 243, 0.05)' }
                            }}
                          >
                            <Grid container alignItems="center" spacing={2}>
                              <Grid item>
                                <Avatar sx={{ bgcolor: '#2196f3', width: 32, height: 32 }}>
                                  <WorkIcon sx={{ fontSize: 16 }} />
                                </Avatar>
                              </Grid>
                              <Grid item xs>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  İş Emri: {workOrder.workOrderId}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {workOrder.profiles.length} profil • {workOrder.totalQuantity} adet
                                  {workOrder.metadata.color && ` • Renk: ${workOrder.metadata.color}`}
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Chip
                                  label={`%${Math.round(workOrder.confidence * 100)}`}
                                  size="small"
                                  sx={{
                                    bgcolor: workOrder.confidence > 0.8 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                    color: workOrder.confidence > 0.8 ? '#4caf50' : '#ff9800'
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0 }}>
                            {/* Metadata */}
                            {(workOrder.metadata.note || workOrder.metadata.sipQuantity || workOrder.metadata.date) && (
                              <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                  Metadata
                                </Typography>
                                <Grid container spacing={1}>
                                  {workOrder.metadata.date && (
                                    <Grid item xs={6}>
                                      <Typography variant="caption" color="text.secondary">
                                        Tarih: {workOrder.metadata.date}
                                      </Typography>
                                    </Grid>
                                  )}
                                  {workOrder.metadata.version && (
                                    <Grid item xs={6}>
                                      <Typography variant="caption" color="text.secondary">
                                        Versiyon: {workOrder.metadata.version}
                                      </Typography>
                                    </Grid>
                                  )}
                                  {workOrder.metadata.sipQuantity && (
                                    <Grid item xs={6}>
                                      <Typography variant="caption" color="text.secondary">
                                        Sipariş Adedi: {workOrder.metadata.sipQuantity}
                                      </Typography>
                                    </Grid>
                                  )}
                                  {workOrder.metadata.note && (
                                    <Grid item xs={12}>
                                      <Typography variant="caption" color="text.secondary">
                                        Not: {workOrder.metadata.note}
                                      </Typography>
                                    </Grid>
                                  )}
                                </Grid>
                              </Box>
                            )}
                            
                            {/* Profiles Table */}
                            <TableContainer component={Paper} variant="outlined">
                              <Table size="small">
                                <TableHead>
                                  <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                    <TableCell><strong>Profil Tipi</strong></TableCell>
                                    <TableCell><strong>Ölçü</strong></TableCell>
                                    <TableCell align="right"><strong>Adet</strong></TableCell>
                                    <TableCell align="right"><strong>Güven</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {workOrder.profiles.map((profile, pIndex) => (
                                    <TableRow key={`${profile.profileType}-${profile.measurement}-${pIndex}`}>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <ProfileIcon sx={{ mr: 1, fontSize: 16, color: '#2196f3' }} />
                                          {profile.profileType}
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <MeasurementIcon sx={{ mr: 1, fontSize: 16, color: '#ff9800' }} />
                                          {profile.measurement}
                                        </Box>
                                      </TableCell>
                                      <TableCell align="right">
                                        <Chip
                                          label={profile.quantity}
                                          size="small"
                                          sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' }}
                                        />
                                      </TableCell>
                                      <TableCell align="right">
                                        <Chip
                                          label={`%${Math.round(profile.confidence * 100)}`}
                                          size="small"
                                          sx={{
                                            bgcolor: profile.confidence > 0.8 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                            color: profile.confidence > 0.8 ? '#4caf50' : '#ff9800'
                                          }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  )}

                  {/* Simple Work Orders List */}
                  {!showDetailedView && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#666' }}>
                        İş Emri Özeti
                      </Typography>
                      <List sx={{ bgcolor: 'rgba(33, 150, 243, 0.02)', borderRadius: 2, p: 0 }}>
                        {workOrders.slice(0, 5).map((workOrder, index) => (
                          <ListItem
                            key={`${workOrder.workOrderId}-${index}`}
                            sx={{
                              borderBottom: index < Math.min(workOrders.length, 5) - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                              '&:last-child': { borderBottom: 'none' }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor: '#2196f3',
                                  width: 32,
                                  height: 32
                                }}
                              >
                                <WorkOrderIcon sx={{ fontSize: 16 }} />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {workOrder.workOrderId}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {workOrder.profiles.length} profil • {workOrder.totalQuantity} adet
                                  {workOrder.metadata.color && ` • ${workOrder.metadata.color}`}
                                </Typography>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Chip
                                label={`%${Math.round(workOrder.confidence * 100)}`}
                                size="small"
                                sx={{
                                  bgcolor: workOrder.confidence > 0.8 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                  color: workOrder.confidence > 0.8 ? '#4caf50' : '#ff9800',
                                  fontWeight: 500
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                        {workOrders.length > 5 && (
                          <ListItem>
                            <ListItemText
                              primary={
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                  +{workOrders.length - 5} iş emri daha...
                                </Typography>
                              }
                            />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  )}

                  {/* Action Button */}
                  <Zoom in={validItems.length > 0}>
                    <Button
                      variant="contained"
                      startIcon={<ApplyIcon />}
                      onClick={applyWorkOrders}
                      disabled={loading || validItems.length === 0}
                      fullWidth
                      size="large"
                      sx={{
                        background: validItems.length > 0 
                          ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                          : 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        boxShadow: validItems.length > 0 
                          ? '0 4px 12px rgba(76, 175, 80, 0.3)'
                          : 'none',
                        '&:hover': {
                          background: validItems.length > 0
                            ? 'linear-gradient(135deg, #45a049 0%, #388e3c 100%)'
                            : 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
                          transform: validItems.length > 0 ? 'translateY(-1px)' : 'none',
                          boxShadow: validItems.length > 0 
                            ? '0 6px 16px rgba(76, 175, 80, 0.4)'
                            : 'none',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {validItems.length > 0 
                        ? `${validItems.length} Profili Optimizasyona Gönder`
                        : 'Geçerli Profil Yok'
                      }
                    </Button>
                  </Zoom>
                </>
              )}

              {selectedProduct && workOrders.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <WorkOrderIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    İş Emri Bulunamadı
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Seçilen ürün için iş emri bulunamadı. Lütfen başka bir ürün seçin.
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Not: Fallback iş emirleri de dahil edilmiştir.
                  </Typography>
                </Box>
              )}

              {!selectedProduct && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ProductIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Ürün seçin
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
/**
 * @fileoverview Enterprise Optimization Form - Advanced Form Interface
 * @module EnterpriseOptimizationForm
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
  Stack,
  FormControlLabel,
  Switch,
  Slider,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  CircularProgress,
  alpha,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Fade,
  Zoom,
  Slide,
  Skeleton,
  Backdrop,
  Snackbar,
  useMediaQuery,
  SxProps,
  Theme,
} from '@mui/material';

import { 
  ContentCut as CutIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Visibility as PreviewIcon,
  CompareArrows as CompareIcon,
  Speed as SpeedIcon,
  AttachMoney as CostIcon,
  RecyclingOutlined as WasteIcon,
  Timeline as TimelineIcon,
  Science as ScienceIcon,
  Architecture as AlgorithmIcon,
  Straighten as RulerIcon,
  SwapVert as SwapIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import { OptimizationItem, OptimizationFormData } from '../types';

// Types
interface CuttingListItem {
  id: string;
  workOrderId: string;        // İş Emri
  color: string;              // Renk
  version: string;            // Versiyon
  size: string;               // Ebat
  profileType: string;        // Profil Tipi
  length: number;             // Ölçü
  quantity: number;           // Adet
  cuttingPattern: string;     // Kesim Deseni
}

interface OptimizationParams {
  algorithm: string;
  objectives: Array<{
    type: string;
    weight: number;
    priority: string;
  }>;
  constraints: {
    kerfWidth: number;
    startSafety: number;
    endSafety: number;
    minScrapLength: number;
    maxWastePercentage: number;
    maxCutsPerStock: number;
  };
  stockLengths: number[];
  unit: 'mm' | 'cm' | 'm';
}

const ALGORITHMS = [
  { 
    value: 'ffd',
    label: 'First Fit Decreasing (FFD)',
    description: 'Hızlı ve etkili, büyük parçalardan başlar',
    speed: 5,
    accuracy: 4
  },
  { 
    value: 'bfd',
    label: 'Best Fit Decreasing (BFD)',
    description: 'En iyi uyumu bulur, düşük atık',
    speed: 4,
    accuracy: 5
  },
  { 
    value: 'genetic',
    label: 'Genetic Algorithm',
    description: 'Evrimsel algoritma, en iyi sonuç',
    speed: 2,
    accuracy: 5
  },
  { 
    value: 'branch-and-bound',
    label: 'Branch and Bound',
    description: 'Optimal çözüm, yavaş ama kesin',
    speed: 1,
    accuracy: 5
  }
];

const OBJECTIVES = [
  { type: 'minimize-waste', label: 'Atık Minimizasyonu', icon: <WasteIcon /> },
  { type: 'maximize-efficiency', label: 'Verimlilik Maksimizasyonu', icon: <SpeedIcon /> },
  { type: 'minimize-cost', label: 'Maliyet Minimizasyonu', icon: <CostIcon /> },
  { type: 'minimize-time', label: 'Zaman Minimizasyonu', icon: <TimelineIcon /> }
];

interface EnterpriseOptimizationFormProps {
  onSubmit: (data: OptimizationFormData) => void;
  isLoading?: boolean;
  initialItems?: OptimizationItem[];
  replaceItems?: boolean;
}

export const EnterpriseOptimizationForm: React.FC<EnterpriseOptimizationFormProps> = ({ 
  onSubmit, 
  isLoading = false, 
  initialItems = [],
  replaceItems = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // State management
  const [cuttingList, setCuttingList] = useState<CuttingListItem[]>([]);
  const [params, setParams] = useState<OptimizationParams>({
    algorithm: 'genetic',
    objectives: [
      { type: 'minimize-waste', weight: 0.4, priority: 'high' },
      { type: 'maximize-efficiency', weight: 0.3, priority: 'high' },
      { type: 'minimize-cost', weight: 0.2, priority: 'medium' },
      { type: 'minimize-time', weight: 0.1, priority: 'low' }
    ],
    constraints: {
      kerfWidth: 3.5,
      startSafety: 2.0,
      endSafety: 2.0,
      minScrapLength: 75,
      maxWastePercentage: 10,
      maxCutsPerStock: 50
    },
    stockLengths: [6100, 6500, 7000],
    unit: 'mm'
  });
  
  // UI state
  const [compareMode, setCompareMode] = useState(false);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['genetic']);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  // Unit conversion helper - Memoized
  type LengthUnit = 'mm' | 'cm' | 'm';
  
  const convertUnit = useCallback((value: number, from: LengthUnit, to: LengthUnit): number => {
    const conversions: Record<string, Record<string, number>> = {
      mm: { cm: 0.1, m: 0.001 },
      cm: { mm: 10, m: 0.01 },
      m: { mm: 1000, cm: 100 }
    };
    return value * (conversions[from]?.[to] || 1);
  }, []);

  const formatWithUnit = useCallback((value: number, unit: string): string => {
    return `${value} ${unit}`;
  }, []);

  // Memoized validation
  const validationErrors = useMemo(() => {
    const newErrors: Record<string, string> = {};
    
    if (cuttingList.length === 0) {
      newErrors.cuttingList = 'En az bir parça eklenmelidir';
    }
    
    if (params.stockLengths.length === 0) {
      newErrors.stockLengths = 'En az bir stok uzunluğu belirtilmelidir';
    }

    // Enhanced validation
    cuttingList.forEach((item, index) => {
      if (!item.workOrderId.trim()) {
        newErrors[`workOrder_${index}`] = 'İş emri boş olamaz';
      }
      if (!item.profileType.trim()) {
        newErrors[`profileType_${index}`] = 'Profil tipi boş olamaz';
      }
      if (item.length <= 0) {
        newErrors[`length_${index}`] = 'Ölçü 0\'dan büyük olmalıdır';
      }
      if (item.quantity <= 0) {
        newErrors[`quantity_${index}`] = 'Miktar 0\'dan büyük olmalıdır';
      }
    });

    // Constraint validation
    if (params.constraints.kerfWidth < 0) {
      newErrors.kerfWidth = 'Testere kalınlığı negatif olamaz';
    }
    if (params.constraints.maxWastePercentage < 0 || params.constraints.maxWastePercentage > 100) {
      newErrors.maxWastePercentage = 'Atık yüzdesi 0-100 arasında olmalıdır';
    }
    
    return newErrors;
  }, [cuttingList, params.stockLengths, params.constraints]);

  const isFormValid = useMemo(() => {
    return Object.keys(validationErrors).length === 0;
  }, [validationErrors]);

  // Enhanced validation with security checks
  useEffect(() => {
    setErrors(validationErrors);
    setIsValid(isFormValid);
  }, [validationErrors, isFormValid]);

  // Security: Input sanitization
  const sanitizeInput = useCallback((input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim()
      .substring(0, 100); // Limit length
  }, []);

  // Security: Number validation
  const validateNumber = useCallback((value: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number => {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return min;
    return Math.max(min, Math.min(max, num));
  }, []);

  // Optimized handlers with security
  const addCuttingItem = useCallback(() => {
    const newItem: CuttingListItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workOrderId: '',
      color: '',
      version: '',
      size: '',
      profileType: '',
      length: 0,
      quantity: 1,
      cuttingPattern: '',
    };
    setCuttingList(prev => [...prev, newItem]);
    setSnackbarMessage('Yeni parça eklendi');
    setSnackbarSeverity('success');
    setShowSnackbar(true);
  }, []);

  const updateCuttingItem = useCallback((id: string, field: keyof CuttingListItem, value: any) => {
    setCuttingList(prev => prev.map(item => {
      if (item.id === id) {
        const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : 
                              typeof value === 'number' ? validateNumber(value) : value;
        return { ...item, [field]: sanitizedValue };
      }
      return item;
    }));
  }, [sanitizeInput, validateNumber]);

  const deleteCuttingItem = useCallback((id: string) => {
    setCuttingList(prev => prev.filter(item => item.id !== id));
    setSnackbarMessage('Parça silindi');
    setSnackbarSeverity('info');
    setShowSnackbar(true);
  }, []);

  const addSampleItems = useCallback(() => {
    const sampleItems: CuttingListItem[] = [
      {
        id: `sample-1-${Date.now()}`,
        workOrderId: 'WO-001',
        color: 'Beyaz',
        version: 'V1.0',
        size: '120x60',
        profileType: 'KAPALI ALT',
        length: 2500,
        quantity: 10,
        cuttingPattern: 'Düz'
      },
      {
        id: `sample-2-${Date.now()}`,
        workOrderId: 'WO-002',
        color: 'Gri',
        version: 'V1.1',
        size: '100x50',
        profileType: 'AÇIK ALT',
        length: 1800,
        quantity: 15,
        cuttingPattern: 'Açılı'
      },
      {
        id: `sample-3-${Date.now()}`,
        workOrderId: 'WO-003',
        color: 'Siyah',
        version: 'V2.0',
        size: '80x40',
        profileType: 'LED PROFİL',
        length: 3200,
        quantity: 8,
        cuttingPattern: 'Düz'
      }
    ];
    setCuttingList(prev => [...prev, ...sampleItems]);
    setSnackbarMessage('Örnek veriler eklendi');
    setSnackbarSeverity('success');
    setShowSnackbar(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!isFormValid) {
      setSnackbarMessage('Lütfen tüm gerekli alanları doldurun');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }
    
    try {
      // Convert cutting list to optimization items with validation
      const items: OptimizationItem[] = cuttingList.map(item => ({
        id: item.id,
        workOrderId: sanitizeInput(item.workOrderId),
        productName: `${sanitizeInput(item.profileType)} - ${sanitizeInput(item.color)}`,
        profileType: sanitizeInput(item.profileType),
        measurement: item.length.toString(),
        length: validateNumber(item.length, 1, 10000),
        quantity: validateNumber(item.quantity, 1, 1000),
        totalLength: validateNumber(item.length * item.quantity, 1, 10000000),
        metadata: {
          color: sanitizeInput(item.color),
          version: sanitizeInput(item.version),
          size: sanitizeInput(item.size),
          cuttingPattern: sanitizeInput(item.cuttingPattern)
        }
      }));
      
      const formData: OptimizationFormData = {
        items,
        algorithm: params.algorithm as any,
        stockLength: validateNumber(params.stockLengths[0] || 6000, 100, 20000),
        materialStockLengths: params.stockLengths.map(length => ({
          profileType: 'Genel',
          stockLength: validateNumber(length, 100, 20000)
        }))
      };
      
      onSubmit(formData);
      setSnackbarMessage('Optimizasyon başlatıldı');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Submit error:', error);
      setSnackbarMessage('Optimizasyon başlatılırken hata oluştu');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
  }, [isFormValid, cuttingList, params, onSubmit, sanitizeInput, validateNumber]);

  // Responsive styles
  const containerSx: SxProps<Theme> = useMemo(() => ({
    maxWidth: isMobile ? '100%' : isTablet ? 1200 : 1400,
    mx: 'auto',
    p: isMobile ? 2 : 3,
    minHeight: '100vh',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  }), [isMobile, isTablet, theme.palette.mode]);

  return (
    <Box sx={containerSx}>
      {/* Header */}
              <Card
        variant="outlined" 
                sx={{
          mb: 3,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)',
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              <SettingsIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}>
                Enterprise Optimizasyon Formu
                  </Typography>
              <Typography variant="body1" color="text.secondary">
                Gelişmiş optimizasyon parametrelerini yapılandırın
                  </Typography>
            </Box>
          </Stack>
                </CardContent>
              </Card>

      {/* Cutting List Section */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <CutIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Kesim Listesi
            </Typography>
            <Chip 
              label={`${cuttingList.length} parça`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Stack>

          {/* Manual Entry Section */}
          <Card 
            variant="outlined" 
            sx={{ 
              mb: 3,
              background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(217,119,6,0.05) 100%)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                  }}
                >
                  <AddIcon sx={{ fontSize: 24, color: 'white' }} />
                </Box>
            <Box>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Manuel Parça Ekleme
              </Typography>
              <Typography variant="body2" color="text.secondary">
                    Mevcut kesim listesi yoksa manuel olarak parça ekleyebilirsiniz
              </Typography>
            </Box>
              </Stack>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
                      variant="contained"
            startIcon={<AddIcon />}
                      onClick={addCuttingItem}
                      sx={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(59,130,246,0.4)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Yeni Parça Ekle
          </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addSampleItems}
                      sx={{
                        border: '2px solid #f59e0b',
                        color: '#f59e0b',
                        '&:hover': {
                          border: '2px solid #d97706',
                          background: 'rgba(245,158,11,0.05)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Örnek Veriler Ekle
                    </Button>
                  </Stack>
                  </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Birim</InputLabel>
                      <Select
                      value={params.unit}
                      label="Birim"
                      onChange={(e) => setParams({...params, unit: e.target.value as any})}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    >
                      <MenuItem value="mm">Milimetre (mm)</MenuItem>
                      <MenuItem value="cm">Santimetre (cm)</MenuItem>
                      <MenuItem value="m">Metre (m)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
        </Grid>

              {cuttingList.length > 0 && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mt: 2,
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(5,150,105,0.05) 100%)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2">
                    {cuttingList.length} parça eklendi. Devam etmek için "Optimizasyonu Başlat" butonuna tıklayın.
            </Typography>
        </Alert>
              )}
      </CardContent>
    </Card>
          
          {cuttingList.length > 0 ? (
            <Fade in={true} timeout={500}>
              <TableContainer 
                component={Paper} 
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  overflow: 'auto',
                  maxHeight: isMobile ? 400 : 600,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: theme.palette.mode === 'dark' ? '#2d3748' : '#f1f1f1',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: theme.palette.mode === 'dark' ? '#4a5568' : '#c1c1c1',
                    borderRadius: '4px',
                    '&:hover': {
                      background: theme.palette.mode === 'dark' ? '#718096' : '#a8a8a8',
                    },
                  },
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#f8fafc' }}>
                        İş Emri
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#f8fafc' }}>
                        Renk
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#f8fafc' }}>
                        Versiyon
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#f8fafc' }}>
                        Ebat
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#f8fafc' }}>
                        Profil Tipi
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#f8fafc' }}>
                        Ölçü ({params.unit})
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#f8fafc' }}>
                        Adet
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#f8fafc' }}>
                        Kesim Deseni
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#f8fafc' }}>
                        İşlemler
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cuttingList.map((item, index) => (
                      <Zoom in={true} timeout={300 + index * 100} key={item.id}>
                        <TableRow 
                          hover
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                            },
                            '&:hover': {
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            },
                          }}
                        >
                          <TableCell>
            <TextField
                              size="small"
                              value={item.workOrderId}
                              onChange={(e) => updateCuttingItem(item.id, 'workOrderId', e.target.value)}
                              variant="outlined"
                              error={!!errors[`workOrder_${index}`]}
                              helperText={errors[`workOrder_${index}`]}
                              sx={{ minWidth: 120 }}
                            />
                          </TableCell>
                          <TableCell>
            <TextField
                              size="small"
                              value={item.color}
                              onChange={(e) => updateCuttingItem(item.id, 'color', e.target.value)}
                              variant="outlined"
                              sx={{ minWidth: 100 }}
                            />
                          </TableCell>
                          <TableCell>
            <TextField
                              size="small"
                              value={item.version}
                              onChange={(e) => updateCuttingItem(item.id, 'version', e.target.value)}
                              variant="outlined"
                              sx={{ minWidth: 80 }}
                            />
                          </TableCell>
                          <TableCell>
            <TextField
                              size="small"
                              value={item.size}
                              onChange={(e) => updateCuttingItem(item.id, 'size', e.target.value)}
                              variant="outlined"
                              sx={{ minWidth: 100 }}
                            />
                          </TableCell>
                          <TableCell>
            <TextField
                              size="small"
                              value={item.profileType}
                              onChange={(e) => updateCuttingItem(item.id, 'profileType', e.target.value)}
                              variant="outlined"
                              error={!!errors[`profileType_${index}`]}
                              helperText={errors[`profileType_${index}`]}
                              sx={{ minWidth: 120 }}
                            />
                          </TableCell>
                          <TableCell>
            <TextField
                              size="small"
              type="number"
                              value={item.length}
                              onChange={(e) => updateCuttingItem(item.id, 'length', Number(e.target.value))}
                              error={!!errors[`length_${index}`]}
                              helperText={errors[`length_${index}`]}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">{params.unit}</InputAdornment>
                              }}
                              variant="outlined"
                              sx={{ minWidth: 120 }}
                            />
                          </TableCell>
                          <TableCell>
            <TextField
                              size="small"
              type="number"
                              value={item.quantity}
                              onChange={(e) => updateCuttingItem(item.id, 'quantity', Number(e.target.value))}
                              error={!!errors[`quantity_${index}`]}
                              helperText={errors[`quantity_${index}`]}
                              sx={{ width: 80 }}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
            <TextField
                              size="small"
                              value={item.cuttingPattern}
                              onChange={(e) => updateCuttingItem(item.id, 'cuttingPattern', e.target.value)}
                              variant="outlined"
                              sx={{ minWidth: 120 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Parçayı Sil">
                              <IconButton
                                size="small"
                                onClick={() => deleteCuttingItem(item.id)}
                                color="error"
                                sx={{
                                  '&:hover': {
                                    backgroundColor: theme.palette.error.light + '20',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      </Zoom>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Fade>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }} variant="outlined">
              <CutIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                Henüz kesim listesi eklenmedi
            </Typography>
              </Paper>
          )}

          {errors.cuttingList && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {errors.cuttingList}
                    </Alert>
          )}
      </CardContent>
    </Card>

      {/* Optimization Parameters Section */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              <ScienceIcon />
          </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Optimizasyon Parametreleri
            </Typography>
          </Stack>

        <Grid container spacing={3}>
            {/* Algorithm Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Optimizasyon Algoritması
              </Typography>
              
          <FormControlLabel
            control={
              <Switch
                    checked={compareMode}
                    onChange={(e) => setCompareMode(e.target.checked)}
                  />
                }
                label="Algoritmaları Karşılaştır"
                sx={{ mb: 2 }}
              />
              
              {!compareMode ? (
                <Grid container spacing={2}>
                  {ALGORITHMS.map((algo) => (
                    <Grid item xs={12} md={6} key={algo.value}>
                      <Card
                        variant={params.algorithm === algo.value ? 'elevation' : 'outlined'}
                        sx={{
                          cursor: 'pointer',
                          border: params.algorithm === algo.value ? 2 : 1,
                          borderColor: params.algorithm === algo.value ? 'primary.main' : 'divider',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => setParams({...params, algorithm: algo.value})}
                      >
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            {algo.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {algo.description}
                          </Typography>
                          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <Chip
                              size="small"
                              icon={<SpeedIcon />}
                              label={`Hız: ${algo.speed}/5`}
                              color={algo.speed >= 4 ? 'success' : 'default'}
                            />
                            <Chip
                              size="small"
                              icon={<ScienceIcon />}
                              label={`Doğruluk: ${algo.accuracy}/5`}
                              color={algo.accuracy >= 4 ? 'success' : 'default'}
                            />
                          </Stack>
      </CardContent>
    </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <ToggleButtonGroup
                  value={selectedAlgorithms}
                  onChange={(e, newAlgos) => setSelectedAlgorithms(newAlgos)}
                  aria-label="algorithm selection"
                  sx={{ flexWrap: 'wrap' }}
                >
                  {ALGORITHMS.map((algo) => (
                    <ToggleButton value={algo.value} key={algo.value}>
                      {algo.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}
            </Grid>
            
            {/* Objectives */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Optimizasyon Hedefleri
            </Typography>
              <Grid container spacing={2}>
                {OBJECTIVES.map((obj) => {
                  const currentObj = params.objectives.find(o => o.type === obj.type);
                  const weight = currentObj?.weight || 0;
                  
                  return (
                    <Grid item xs={12} sm={6} key={obj.type}>
                      <Paper sx={{ p: 2 }} variant="outlined">
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          {obj.icon}
                          <Typography variant="body2">{obj.label}</Typography>
                        </Stack>
                        <Slider
                          value={weight * 100}
                          onChange={(e, value) => {
                            const newWeight = (value as number) / 100;
                            const newObjectives = params.objectives.map(o =>
                              o.type === obj.type ? {...o, weight: newWeight} : o
                            );
                            
                            // Normalize weights to sum to 1
                            const totalWeight = newObjectives.reduce((sum, o) => sum + o.weight, 0);
                            if (totalWeight > 0) {
                              newObjectives.forEach(o => o.weight = o.weight / totalWeight);
                            }
                            
                            setParams({...params, objectives: newObjectives});
                          }}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => `%${value}`}
                        />
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
            
            {/* Constraints */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Kısıtlamalar
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
                    label="Testere Kalınlığı (Kerf)"
              type="number"
                    value={params.constraints.kerfWidth}
                    onChange={(e) => setParams({
                      ...params,
                      constraints: {...params.constraints, kerfWidth: Number(e.target.value)}
                    })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">{params.unit}</InputAdornment>
                    }}
            />
          </Grid>
                <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
                    label="Başlangıç Güvenlik Payı"
              type="number"
                    value={params.constraints.startSafety}
                    onChange={(e) => setParams({
                      ...params,
                      constraints: {...params.constraints, startSafety: Number(e.target.value)}
                    })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">{params.unit}</InputAdornment>
                    }}
            />
          </Grid>
                <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
                    label="Bitiş Güvenlik Payı"
              type="number"
                    value={params.constraints.endSafety}
                    onChange={(e) => setParams({
                      ...params,
                      constraints: {...params.constraints, endSafety: Number(e.target.value)}
                    })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">{params.unit}</InputAdornment>
                    }}
            />
          </Grid>
                <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
                    label="Minimum Hurda Uzunluğu"
              type="number"
                    value={params.constraints.minScrapLength}
                    onChange={(e) => setParams({
                      ...params,
                      constraints: {...params.constraints, minScrapLength: Number(e.target.value)}
                    })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">{params.unit}</InputAdornment>
                    }}
            />
          </Grid>
                <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
                    label="Maksimum Atık %"
              type="number"
                    value={params.constraints.maxWastePercentage}
                    onChange={(e) => setParams({
                      ...params,
                      constraints: {...params.constraints, maxWastePercentage: Number(e.target.value)}
                    })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
            />
          </Grid>
                <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
                    label="Stok Başına Maks. Kesim"
              type="number"
                    value={params.constraints.maxCutsPerStock}
                    onChange={(e) => setParams({
                      ...params,
                      constraints: {...params.constraints, maxCutsPerStock: Number(e.target.value)}
                    })}
            />
          </Grid>
        </Grid>
            </Grid>

            {/* Stock Lengths */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Stok Uzunlukları
                </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                {params.stockLengths.map((length, index) => (
                  <Chip
                    key={index}
                    label={formatWithUnit(length, params.unit)}
                    onDelete={() => {
                      const newLengths = params.stockLengths.filter((_, i) => i !== index);
                      setParams({...params, stockLengths: newLengths});
                    }}
                  />
                ))}
                <TextField
                  size="small"
                  placeholder="Yeni uzunluk"
                  type="number"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = Number((e.target as HTMLInputElement).value);
                      if (value > 0) {
                        setParams({
                          ...params,
                          stockLengths: [...params.stockLengths, value]
                        });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{params.unit}</InputAdornment>
                  }}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="center" spacing={2}>
              <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
              disabled={!isValid || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <PlayIcon />}
            sx={{ 
                minWidth: 200,
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
              },
              '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)',
                }
              }}
            >
              {isLoading ? 'Optimizasyon Yapılıyor...' : 'Optimizasyonu Başlat'}
          </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Loading Backdrop */}
      <Backdrop
            sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
        open={isLoading}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Optimizasyon Yapılıyor...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lütfen bekleyin, bu işlem biraz zaman alabilir.
          </Typography>
      </Box>
      </Backdrop>

      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '0.95rem',
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnterpriseOptimizationForm;
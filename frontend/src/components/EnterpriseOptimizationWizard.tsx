/**
 * @fileoverview Enterprise Optimization Wizard - Complete Flow
 * @module EnterpriseOptimizationWizard
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  CircularProgress,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
import { useTheme, alpha } from '@mui/material/styles';
import { CuttingListSelector } from './CuttingListSelector';
import { EnterpriseOptimizationResults } from './EnterpriseOptimizationResults';
import { OptimizationInfoDialog } from './OptimizationInfoDialog';
import axios from 'axios';

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
    description: 'En hızlı, büyük parçaları önce yerleştirir',
    speed: 5,
    accuracy: 3
  },
  { 
    value: 'bfd', 
    label: 'Best Fit Decreasing (BFD)', 
    description: 'En az atık bırakan yeri bulur',
    speed: 4,
    accuracy: 4
  },
  { 
    value: 'nfd', 
    label: 'Next Fit Decreasing (NFD)', 
    description: 'Basit ve hızlı, sıralı yerleştirme',
    speed: 5,
    accuracy: 2
  },
  { 
    value: 'wfd', 
    label: 'Worst Fit Decreasing (WFD)', 
    description: 'En çok boşluk olan yere yerleştirir',
    speed: 4,
    accuracy: 3
  },
  { 
    value: 'genetic', 
    label: 'Genetic Algorithm', 
    description: 'Evrimsel optimizasyon, en iyi sonuç',
    speed: 2,
    accuracy: 5
  },
  { 
    value: 'simulated-annealing', 
    label: 'Simulated Annealing', 
    description: 'Isıl işlem simülasyonu ile optimizasyon',
    speed: 2,
    accuracy: 5
  },
  { 
    value: 'branch-and-bound', 
    label: 'Branch and Bound', 
    description: 'Matematiksel kesin çözüm',
    speed: 1,
    accuracy: 5
  }
];

const OBJECTIVES = [
  { type: 'minimize-waste', label: 'Atığı Minimize Et', icon: <WasteIcon /> },
  { type: 'minimize-cost', label: 'Maliyeti Minimize Et', icon: <CostIcon /> },
  { type: 'minimize-time', label: 'Zamanı Minimize Et', icon: <TimelineIcon /> },
  { type: 'maximize-efficiency', label: 'Verimliliği Maksimize Et', icon: <SpeedIcon /> }
];

export const EnterpriseOptimizationWizard: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
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
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['genetic']);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [cuttingLists, setCuttingLists] = useState<any[]>([]);
  const [loadingCuttingLists, setLoadingCuttingLists] = useState(false);
  const [selectedCuttingList, setSelectedCuttingList] = useState<any | null>(null);
  const [showDetailedSelection, setShowDetailedSelection] = useState(false);
  const [conversionResult, setConversionResult] = useState<any>(null);
  const [conversionInProgress, setConversionInProgress] = useState(false);
  
  // Unit conversion helper
  type LengthUnit = 'mm' | 'cm' | 'm';
  
  const convertUnit = (value: number, from: LengthUnit, to: LengthUnit): number => {
    if (from === to) return value;
    
    // Convert to mm first
    let mmValue = value;
    if (from === 'cm') mmValue = value * 10;
    if (from === 'm') mmValue = value * 1000;
    
    // Convert from mm to target
    if (to === 'mm') return mmValue;
    if (to === 'cm') return mmValue / 10;
    if (to === 'm') return mmValue / 1000;
    
    return value;
  };
  
  // Format value with unit
  const formatWithUnit = (value: number, unit: LengthUnit): string => {
    const precision = unit === 'mm' ? 0 : unit === 'cm' ? 1 : 2;
    return `${value.toFixed(precision)} ${unit}`;
  };
  
  // Add sample cutting list item
  const addCuttingItem = () => {
    const newItem: CuttingListItem = {
      id: `item-${Date.now()}`,
      workOrderId: `WO-${Math.floor(Math.random() * 10000)}`,
      color: 'Eloksal',
      version: 'V1.0',
      size: '40x40',
      profileType: 'AL-6063',
      length: 2500,
      quantity: 10,
      cuttingPattern: 'Düz'
    };
    setCuttingList([...cuttingList, newItem]);
  };

  // Add multiple sample items for testing
  const addSampleItems = () => {
    const sampleItems: CuttingListItem[] = [
      {
        id: `item-1`,
        workOrderId: 'WO-001',
        color: 'Eloksal',
        version: 'V1.0',
        size: '40x40',
        profileType: 'AL-6063',
        length: 2500,
        quantity: 5,
        cuttingPattern: 'Düz'
      },
      {
        id: `item-2`,
        workOrderId: 'WO-002',
        color: 'Anodize',
        version: 'V1.1',
        size: '50x50',
        profileType: 'AL-6063',
        length: 1800,
        quantity: 3,
        cuttingPattern: '45° Açılı'
      },
      {
        id: `item-3`,
        workOrderId: 'WO-003',
        color: 'Eloksal',
        version: 'V2.0',
        size: '60x60',
        profileType: 'AL-7075',
        length: 3000,
        quantity: 2,
        cuttingPattern: '90° Köşe'
      }
    ];
    setCuttingList(prevList => {
      const newList = [...prevList, ...sampleItems];
      return newList;
    });
  };
  
  // Update cutting item
  const updateCuttingItem = (id: string, field: string, value: any) => {
    setCuttingList(cuttingList.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  // Delete cutting item
  const deleteCuttingItem = (id: string) => {
    setCuttingList(cuttingList.filter(item => item.id !== id));
  };
  
  // Load cutting lists from API
  const loadCuttingLists = async () => {
    setLoadingCuttingLists(true);
    try {
      const response = await axios.get('http://localhost:3001/api/cutting-list');
      
      if (response.data.success && response.data.data) {
        const lists = Array.isArray(response.data.data) ? response.data.data : [];
        setCuttingLists(lists);
      } else {
        setCuttingLists([]);
      }
    } catch (error) {
      console.error('Kesim listeleri yüklenemedi:', error);
      setCuttingLists([]);
    } finally {
      setLoadingCuttingLists(false);
    }
  };

  // Handle detailed cutting list selection
  const handleDetailedSelection = (list: any) => {
    setSelectedCuttingList(list);
    setShowDetailedSelection(true);
  };

  // Handle selection from detailed selector
  const handleSelectionFromDetailed = (items: any[]) => {
    const convertedItems: CuttingListItem[] = items.map(item => ({
      id: `${item.workOrderId}-${item.profileType}`,
      workOrderId: item.workOrderId,
      color: item.color || 'Eloksal',
      version: item.version || 'V1.0',
      size: item.size || '40x40',
      profileType: item.profileType,
      length: item.length,
      quantity: item.quantity,
      cuttingPattern: item.cuttingPattern || 'Düz'
    }));
    setCuttingList(convertedItems);
  };

  // Handle conversion complete from detailed selector
  const handleConversionFromDetailed = (result: any) => {
    setConversionResult(result);
    if (result.success && result.items.length > 0) {
      setShowDetailedSelection(false);
      setActiveStep(1);
    }
  };
  
  // Calculate preview metrics
  const calculatePreviewMetrics = () => {
    const totalLength = cuttingList.reduce((sum, item) => 
      sum + (item.length * item.quantity), 0
    );
    const totalPieces = cuttingList.reduce((sum, item) => 
      sum + item.quantity, 0
    );
    const avgLength = totalPieces > 0 ? totalLength / totalPieces : 0;
    const stockNeeded = Math.ceil(totalLength / Math.min(...params.stockLengths));
    
    return {
      totalLength,
      totalPieces,
      avgLength,
      stockNeeded,
      estimatedWaste: stockNeeded * Math.min(...params.stockLengths) - totalLength
    };
  };
  
  // Run optimization
  const runOptimization = async () => {
    setIsOptimizing(true);
    
    try {
      // Convert cutting list to optimization items
      const items = cuttingList.map(item => ({
        profileType: item.profileType,
        length: convertUnit(item.length, params.unit, 'mm'),
        quantity: item.quantity,
        totalLength: convertUnit(item.length, params.unit, 'mm') * item.quantity, // Backend requirement
        workOrderId: item.workOrderId,
        color: item.color,
        version: item.version,
        size: item.size,
        cuttingPattern: item.cuttingPattern
      }));
      
      // Prepare request
      const request = {
        items,
        algorithm: params.algorithm,
        objectives: params.objectives,
        constraints: {
          ...params.constraints,
          kerfWidth: convertUnit(params.constraints.kerfWidth, params.unit, 'mm'),
          startSafety: convertUnit(params.constraints.startSafety, params.unit, 'mm'),
          endSafety: convertUnit(params.constraints.endSafety, params.unit, 'mm'),
          minScrapLength: convertUnit(params.constraints.minScrapLength, params.unit, 'mm')
        },
        performance: {
          maxIterations: 1000,
          convergenceThreshold: 0.001,
          parallelProcessing: true,
          cacheResults: true,
          populationSize: params.algorithm === 'genetic' ? 50 : undefined,
          generations: params.algorithm === 'genetic' ? 100 : undefined
        },
        costModel: {
          materialCost: 0.05,
          cuttingCost: 0.10,
          setupCost: 2.00,
          wasteCost: 0.03,
          timeCost: 0.50,
          energyCost: 0.15
        },
        materialStockLengths: params.stockLengths.map(length => ({
          stockLength: convertUnit(length, params.unit, 'mm'),
          available: 1000
        }))
      };
      
      // Debug: Log algorithm selection (development only)
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('🔍 Frontend: Selected algorithm:', params.algorithm);
        console.log('🔍 Frontend: Items count:', items.length);
        console.log('🔍 Frontend: First 3 items:', items.slice(0, 3).map(i => ({ length: i.length, quantity: i.quantity })));
      }
      
      // Call API
      const response = await fetch('/api/enterprise/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          console.log('🔍 Backend response:', result);
          console.log('🔍 result.data:', result.data);
          console.log('🔍 result.data.optimizationResult:', result.data.optimizationResult);
        }
        setOptimizationResult(result.data.optimizationResult); // ← Asıl veriyi set et
        setActiveStep(3); // Go to results
      } else {
        console.error('Optimization failed:', result.error);
      }
    } catch (error) {
      console.error('Error running optimization:', error);
    } finally {
      setIsOptimizing(false);
    }
  };
  
  // Compare algorithms
  const compareAlgorithms = async () => {
    setIsOptimizing(true);
    
    try {
      const items = cuttingList.map(item => ({
        profileType: item.profileType,
        length: convertUnit(item.length, params.unit, 'mm'),
        quantity: item.quantity,
        totalLength: convertUnit(item.length, params.unit, 'mm') * item.quantity, // Backend requirement
        workOrderId: item.workOrderId,
        color: item.color,
        version: item.version,
        size: item.size,
        cuttingPattern: item.cuttingPattern
      }));
      
      const response = await fetch('/api/enterprise/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          algorithms: selectedAlgorithms
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          console.log('🔍 Compare algorithms response:', result);
        }
        setOptimizationResult(result.data); // Comparison data is different structure
        setActiveStep(3);
      }
    } catch (error) {
      console.error('Error comparing algorithms:', error);
    } finally {
      setIsOptimizing(false);
    }
  };
  
  const steps = [
    'Kesim Listesi Seçimi',
    'Algoritma ve Parametreler',
    'Ön İzleme ve Doğrulama',
    'Optimizasyon Sonuçları'
  ];

  useEffect(() => {
    loadCuttingLists();
  }, []);
  
  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Premium Hero Section */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(0,0,0,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #1a237e 0%, #ff6f00 50%, #1a237e 100%)',
            zIndex: 1,
          }
        }}
      >
        <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a237e 0%, #ff6f00 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(26,35,126,0.3)',
                }}
              >
                <AlgorithmIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #1a237e 0%, #ff6f00 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5,
                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                    lineHeight: 1.2,
                  }}
                >
          Enterprise Alüminyum Profil Kesim Optimizasyonu
        </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ 
                    fontWeight: 500,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    opacity: 0.8,
                  }}
                >
                  Adım {activeStep + 1}: {steps[activeStep]}
                </Typography>
              </Box>
            </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Optimizasyon Sistemi Hakkında Bilgi">
            <IconButton 
              onClick={() => setShowInfoDialog(true)}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(26,35,126,0.2)',
              }}
            >
              <InfoIcon color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
        </CardContent>
      </Card>
      
      {/* Detailed Selection Dialog */}
      <Dialog
        open={showDetailedSelection}
        onClose={() => setShowDetailedSelection(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Kesim Listesi Detay Seçimi
          <IconButton
            onClick={() => setShowDetailedSelection(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedCuttingList && (
            <CuttingListSelector
              cuttingList={selectedCuttingList}
              onSelectionChange={handleSelectionFromDetailed}
              onConversionComplete={handleConversionFromDetailed}
              isConverting={conversionInProgress}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Premium Step Progress */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(0,0,0,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%)',
            zIndex: 1,
          }
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              }}
            >
              <TimelineIcon sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary">
                Optimizasyon Adımları
        </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeStep + 1} / {steps.length} adım tamamlandı
              </Typography>
            </Box>
          </Box>
          
        <LinearProgress 
          variant="determinate" 
          value={(activeStep / (steps.length - 1)) * 100} 
            sx={{ 
              mb: 3,
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
              }
            }}
          />
          
          <Grid container spacing={2}>
          {steps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: index === activeStep 
                      ? 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(29,78,216,0.1) 100%)'
                      : 'transparent',
                    border: index === activeStep 
                      ? '2px solid #3b82f6'
                      : '2px solid transparent',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(59,130,246,0.2)',
                      border: '2px solid rgba(59,130,246,0.5)',
                    },
                  }}
                  onClick={() => setActiveStep(index)}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: index === activeStep 
                        ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                        : index < activeStep
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      boxShadow: index === activeStep 
                        ? '0 4px 12px rgba(59,130,246,0.3)'
                        : index < activeStep
                        ? '0 4px 12px rgba(16,185,129,0.3)'
                        : '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    {index < activeStep ? (
                      <CheckIcon sx={{ fontSize: 20, color: 'white' }} />
                    ) : (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: index === activeStep ? 'white' : '#6b7280',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}
                      >
                        {index + 1}
                      </Typography>
                    )}
      </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: index === activeStep ? '#3b82f6' : '#1a237e',
                      fontSize: '0.8rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {step}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Step Content */}
      {activeStep === 0 && (
        <Card
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(0,0,0,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #10b981 100%)',
              zIndex: 1,
            }
          }}
        >
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                }}
              >
                <CutIcon sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="primary">
                Optimizasyon için Kesim Listesi Seçin
              </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mevcut kesim listelerinden optimizasyon yapılacakları seçin veya manuel olarak parça ekleyin
                </Typography>
              </Box>
            </Box>
              
              {/* Premium Conversion Progress */}
              {conversionInProgress && (
                <Card
                  sx={{
                    mb: 3,
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(29,78,216,0.05) 100%)',
                    border: '2px solid rgba(59,130,246,0.2)',
                    boxShadow: '0 8px 32px rgba(59,130,246,0.1), 0 4px 16px rgba(59,130,246,0.05)',
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                        }}
                      >
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          Dönüştürme İşlemi Devam Ediyor
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                        Kesim listesi veriler optimizasyon formatına dönüştürülüyor...
                      </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Premium Conversion Results */}
              {conversionResult && !conversionInProgress && (
                <Card
                  sx={{
                    mb: 3,
                    background: conversionResult.success 
                      ? 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(5,150,105,0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(220,38,38,0.05) 100%)',
                    border: conversionResult.success 
                      ? '2px solid rgba(16,185,129,0.2)'
                      : '2px solid rgba(239,68,68,0.2)',
                    boxShadow: conversionResult.success 
                      ? '0 8px 32px rgba(16,185,129,0.1), 0 4px 16px rgba(16,185,129,0.05)'
                      : '0 8px 32px rgba(239,68,68,0.1), 0 4px 16px rgba(239,68,68,0.05)',
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: conversionResult.success 
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: conversionResult.success 
                            ? '0 4px 12px rgba(16,185,129,0.3)'
                            : '0 4px 12px rgba(239,68,68,0.3)',
                        }}
                      >
                        {conversionResult.success ? (
                          <CheckIcon sx={{ fontSize: 24, color: 'white' }} />
                        ) : (
                          <WarningIcon sx={{ fontSize: 24, color: 'white' }} />
                        )}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: conversionResult.success ? 'success.main' : 'error.main' }}>
                          {conversionResult.success ? 'Dönüştürme Başarılı' : 'Dönüştürme Başarısız'}
                    </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {conversionResult.success ? 'Tüm veriler başarıyla işlendi' : 'Bazı veriler işlenemedi'}
                        </Typography>
                      </Box>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          background: 'rgba(16,185,129,0.05)',
                          border: '1px solid rgba(16,185,129,0.1)',
                          borderRadius: 2,
                        }}>
                          <Typography variant="h6" fontWeight="bold" color="success.main">
                            {conversionResult.statistics?.convertedItems || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Başarılı
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          background: (conversionResult.statistics?.failedConversions || 0) > 0 ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)',
                          border: (conversionResult.statistics?.failedConversions || 0) > 0 ? '1px solid rgba(239,68,68,0.1)' : '1px solid rgba(16,185,129,0.1)',
                          borderRadius: 2,
                        }}>
                          <Typography variant="h6" fontWeight="bold" color={(conversionResult.statistics?.failedConversions || 0) > 0 ? 'error.main' : 'success.main'}>
                            {conversionResult.statistics?.failedConversions || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Başarısız
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          background: 'rgba(245,158,11,0.05)',
                          border: '1px solid rgba(245,158,11,0.1)',
                          borderRadius: 2,
                        }}>
                          <Typography variant="h6" fontWeight="bold" color="warning.main">
                            {conversionResult.warnings?.length || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Uyarı
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          background: 'rgba(59,130,246,0.05)',
                          border: '1px solid rgba(59,130,246,0.1)',
                          borderRadius: 2,
                        }}>
                          <Typography variant="h6" fontWeight="bold" color="info.main">
                            {(conversionResult.statistics?.processingTime || 0).toFixed(1)}ms
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Süre
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {loadingCuttingLists ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
                    }}
                  >
                    <CircularProgress size={32} sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                    Kesim Listeleri Yükleniyor
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lütfen bekleyin...
                  </Typography>
                </Box>
              ) : cuttingLists.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
                    }}
                  >
                    <WarningIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600, mb: 1 }}>
                    Kesim Listesi Bulunamadı
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Henüz kesim listesi bulunamadı. Önce "Kesim Listesi" sayfasından bir liste oluşturun.
                  </Typography>
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
                    Manuel Parça Ekle
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {cuttingLists.map((list) => (
                    <Grid item xs={12} md={6} lg={4} key={list.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                          backdropFilter: 'blur(20px)',
                          border: cuttingList.length > 0 && cuttingList[0]?.workOrderId?.includes(list.id) 
                            ? '2px solid #3b82f6' 
                            : '2px solid rgba(0,0,0,0.08)',
                          boxShadow: cuttingList.length > 0 && cuttingList[0]?.workOrderId?.includes(list.id)
                            ? '0 8px 32px rgba(59,130,246,0.2), 0 4px 16px rgba(59,130,246,0.1)'
                            : '0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
                          borderRadius: 2,
                          overflow: 'hidden',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: cuttingList.length > 0 && cuttingList[0]?.workOrderId?.includes(list.id)
                              ? 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
                              : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                            zIndex: 1,
                          },
                          '&:hover': { 
                            transform: 'translateY(-4px)',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)',
                            border: '2px solid rgba(59,130,246,0.3)',
                          },
                          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        }}
                        onClick={() => handleDetailedSelection(list)}
                      >
                        <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                              }}
                            >
                              <CutIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {list.title}
                          </Typography>
                              <Typography variant="body2" color="text.secondary">
                            {list.weekNumber}. Hafta
                          </Typography>
                            </Box>
                          </Box>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Paper sx={{ 
                                p: 1.5, 
                                textAlign: 'center',
                                background: 'rgba(16,185,129,0.05)',
                                border: '1px solid rgba(16,185,129,0.1)',
                                borderRadius: 2,
                              }}>
                                <Typography variant="h6" fontWeight="bold" color="success.main">
                                  {list.sections?.length || 0}
                          </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Ürün
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={6}>
                              <Paper sx={{ 
                                p: 1.5, 
                                textAlign: 'center',
                                background: 'rgba(59,130,246,0.05)',
                                border: '1px solid rgba(59,130,246,0.1)',
                                borderRadius: 2,
                              }}>
                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                  {list.sections?.reduce((total: number, section: any) => total + (section.items?.length || 0), 0) || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  İş Emri
                                </Typography>
                              </Paper>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
            </Card>
      )}

      {/* Step 2: Algoritma ve Parametreler - Premium Design */}
      {activeStep === 1 && (
            <Box sx={{ mb: 3 }}>
          {/* Premium Header */}
          <Card
            variant="outlined" 
            sx={{
              mb: 4,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 12px 40px rgba(139, 92, 246, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #8b5cf6, #7c3aed, #6d28d9)',
                borderRadius: '20px 20px 0 0',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '20px',
                      padding: '2px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'xor',
                    }
                  }}
                >
                  <AlgorithmIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 800, 
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    letterSpacing: '-0.02em'
                  }}>
                    Algoritma ve Parametreler
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Optimizasyon algoritmasını seçin ve parametreleri ayarlayın
                  </Typography>
                </Box>
                <Chip
                  label="7 Algoritma"
                  sx={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    px: 2,
                    py: 1,
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                  }}
                />
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={4}>
            {/* Premium Algorithm Selection */}
                <Grid item xs={12}>
              <Card
                variant="outlined"
                sx={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(59, 130, 246, 0.15)',
                  borderRadius: '20px',
                  boxShadow: '0 12px 40px rgba(59, 130, 246, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #3b82f6, #1d4ed8, #1e40af)',
                    borderRadius: '20px 20px 0 0',
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 16px 48px rgba(59, 130, 246, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                      }}
                    >
                      <ScienceIcon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                    Optimizasyon Algoritması
                  </Typography>
                  </Stack>
                  
                  {/* Premium Compare Mode Toggle */}
                  <Box
                    sx={{
                      p: 3,
                      mb: 4,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.08) 100%)',
                      border: '2px solid rgba(245, 158, 11, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.12) 100%)',
                        transform: 'scale(1.01)',
                      }
                    }}
                  >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={compareMode}
                        onChange={(e) => setCompareMode(e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#f59e0b',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#f59e0b',
                              },
                            },
                            '& .MuiSwitch-track': {
                              backgroundColor: 'rgba(245, 158, 11, 0.3)',
                            },
                          }}
                        />
                      }
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CompareIcon sx={{ color: '#f59e0b' }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#f59e0b' }}>
                            Algoritmaları Karşılaştır
                          </Typography>
                        </Stack>
                      }
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 5 }}>
                      Birden fazla algoritma seçerek performanslarını karşılaştırabilirsiniz
                    </Typography>
                  </Box>
                  
                  {!compareMode ? (
                    <Grid container spacing={3}>
                      {ALGORITHMS.map((algo) => {
                        const isSelected = params.algorithm === algo.value;
                        const speedColor = algo.speed >= 4 ? '#10b981' : algo.speed >= 3 ? '#f59e0b' : '#ef4444';
                        const accuracyColor = algo.accuracy >= 4 ? '#10b981' : algo.accuracy >= 3 ? '#f59e0b' : '#ef4444';
                        
                        return (
                          <Grid item xs={12} md={6} lg={4} key={algo.value}>
                          <Card
                              variant="outlined"
                            sx={{
                              cursor: 'pointer',
                                borderRadius: '20px',
                                background: isSelected 
                                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)'
                                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%)',
                                border: isSelected 
                                  ? '3px solid #3b82f6' 
                                  : '2px solid rgba(59, 130, 246, 0.2)',
                                boxShadow: isSelected 
                                  ? '0 12px 32px rgba(59, 130, 246, 0.3)'
                                  : '0 8px 24px rgba(59, 130, 246, 0.1)',
                                backdropFilter: 'blur(20px)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': isSelected ? {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: '4px',
                                  background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                                  borderRadius: '20px 20px 0 0',
                                } : {},
                                '&:hover': {
                                  transform: 'translateY(-8px) scale(1.02)',
                                  boxShadow: '0 16px 40px rgba(59, 130, 246, 0.25)',
                                  border: '3px solid #3b82f6',
                                }
                            }}
                            onClick={() => {
                              if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
                                console.log('🔍 Frontend: Algorithm clicked:', algo.value);
                              }
                              setParams({...params, algorithm: algo.value});
                            }}
                          >
                              <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: '12px',
                                      background: isSelected 
                                        ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                                        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: isSelected 
                                        ? '0 4px 12px rgba(59, 130, 246, 0.4)'
                                        : '0 2px 8px rgba(59, 130, 246, 0.2)',
                                    }}
                                  >
                                    <ScienceIcon sx={{ 
                                      fontSize: 20, 
                                      color: isSelected ? 'white' : '#3b82f6' 
                                    }} />
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ 
                                      fontWeight: 700,
                                      color: isSelected ? '#3b82f6' : 'text.primary',
                                      mb: 0.5
                                    }}>
                                {algo.label}
                              </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                {algo.description}
                              </Typography>
                                  </Box>
                                  {isSelected && (
                                    <Box
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                                      }}
                                    >
                                      <CheckIcon sx={{ fontSize: 16, color: 'white' }} />
                                    </Box>
                                  )}
                                </Stack>
                                
                                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                  <Box
                                    sx={{
                                      flex: 1,
                                      p: 2,
                                      borderRadius: '12px',
                                      background: `linear-gradient(135deg, ${speedColor}15, ${speedColor}08)`,
                                      border: `1px solid ${speedColor}30`,
                                      textAlign: 'center',
                                    }}
                                  >
                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                                      <SpeedIcon sx={{ fontSize: 16, color: speedColor }} />
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: speedColor }}>
                                        Hız
                                      </Typography>
                                    </Stack>
                                    <Typography variant="h6" sx={{ 
                                      fontWeight: 800,
                                      color: speedColor
                                    }}>
                                      {algo.speed}/5
                                    </Typography>
                                  </Box>
                                  
                                  <Box
                                    sx={{
                                      flex: 1,
                                      p: 2,
                                      borderRadius: '12px',
                                      background: `linear-gradient(135deg, ${accuracyColor}15, ${accuracyColor}08)`,
                                      border: `1px solid ${accuracyColor}30`,
                                      textAlign: 'center',
                                    }}
                                  >
                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                                      <ScienceIcon sx={{ fontSize: 16, color: accuracyColor }} />
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: accuracyColor }}>
                                        Doğruluk
                                      </Typography>
                                    </Stack>
                                    <Typography variant="h6" sx={{ 
                                      fontWeight: 800,
                                      color: accuracyColor
                                    }}>
                                      {algo.accuracy}/5
                                    </Typography>
                                  </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Box
                      sx={{
                        p: 4,
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
                        border: '2px solid rgba(139, 92, 246, 0.2)',
                      }}
                    >
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        mb: 3,
                        color: '#8b5cf6',
                        textAlign: 'center'
                      }}>
                        Karşılaştırılacak Algoritmaları Seçin
                      </Typography>
                    <ToggleButtonGroup
                      value={selectedAlgorithms}
                      onChange={(e, newAlgos) => setSelectedAlgorithms(newAlgos)}
                      aria-label="algorithm selection"
                        sx={{ 
                          flexWrap: 'wrap',
                          gap: 2,
                          justifyContent: 'center',
                          '& .MuiToggleButton-root': {
                            borderRadius: '12px',
                            border: '2px solid rgba(139, 92, 246, 0.3)',
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.1))',
                              transform: 'translateY(-2px)',
                            },
                            '&.Mui-selected': {
                              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                              color: 'white',
                              border: '2px solid #8b5cf6',
                              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                            }
                          }
                        }}
                    >
                      {ALGORITHMS.map((algo) => (
                          <ToggleButton value={algo.value} key={algo.value} sx={{ px: 3, py: 1.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {algo.label}
                            </Typography>
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    </Box>
                  )}
                </CardContent>
              </Card>
                </Grid>
                
            {/* Premium Objectives - Professional Colors */}
            <Grid item xs={12}>
              <Card
                variant="outlined"
                sx={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(100, 116, 139, 0.15)',
                  borderRadius: '20px',
                  boxShadow: '0 12px 40px rgba(100, 116, 139, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #64748b, #475569, #334155)',
                    borderRadius: '20px 20px 0 0',
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 16px 48px rgba(100, 116, 139, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 20px rgba(100, 116, 139, 0.4)',
                      }}
                    >
                      <SpeedIcon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #64748b, #475569)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      Optimizasyon Hedefleri
                    </Typography>
                  </Stack>
                  
                  <Grid container spacing={3}>
                    {OBJECTIVES.map((obj) => {
                      const currentObj = params.objectives.find(o => o.type === obj.type);
                      const weight = currentObj?.weight || 0;
                      const priority = currentObj?.priority || 'medium';
                      
                      // Professional color scheme based on priority
                      const priorityColor = priority === 'high' ? '#dc2626' : 
                                           priority === 'medium' ? '#d97706' : '#2563eb';
                      const priorityBg = priority === 'high' ? 'rgba(220, 38, 38, 0.08)' : 
                                        priority === 'medium' ? 'rgba(217, 119, 6, 0.08)' : 'rgba(37, 99, 235, 0.08)';
                      
                      return (
                        <Grid item xs={12} sm={6} md={3} key={obj.type}>
                          <Box
                            sx={{
                              p: 3,
                              borderRadius: '20px',
                              background: `linear-gradient(135deg, ${priorityBg} 0%, ${priorityBg.replace('0.08', '0.04')} 100%)`,
                              border: `2px solid ${priorityColor}20`,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                transform: 'translateY(-4px) scale(1.02)',
                                boxShadow: `0 12px 32px ${priorityColor}20`,
                                background: `linear-gradient(135deg, ${priorityBg.replace('0.08', '0.12')} 0%, ${priorityBg.replace('0.08', '0.06')} 100%)`,
                              }
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '12px',
                                  background: `linear-gradient(135deg, ${priorityColor}, ${priorityColor}dd)`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: `0 4px 12px ${priorityColor}40`,
                                }}
                              >
                                {React.cloneElement(obj.icon, { 
                                  sx: { fontSize: 20, color: 'white' } 
                                })}
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ 
                                  fontWeight: 600, 
                                  mb: 0.5,
                                  color: priorityColor
                                }}>
                                  {obj.label}
                                </Typography>
                                <Chip
                                  label={priority === 'high' ? 'Yüksek' : 
                                         priority === 'medium' ? 'Orta' : 'Düşük'}
                                  size="small"
                                  sx={{
                                    background: `linear-gradient(135deg, ${priorityColor}, ${priorityColor}dd)`,
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                  }}
                                />
                              </Box>
                            </Stack>
                            
                            <Box sx={{ mb: 2 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                  Ağırlık
                                </Typography>
                                <Typography variant="h6" sx={{ 
                                  fontWeight: 800,
                                  color: priorityColor
                                }}>
                                  {Math.round(weight * 100)}%
                                </Typography>
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
                                sx={{ 
                                  height: 6,
                                  '& .MuiSlider-thumb': {
                                    background: '#64748b',
                                    border: '2px solid white',
                                    boxShadow: '0 2px 6px rgba(100, 116, 139, 0.3)',
                                    width: 20,
                                    height: 20,
                                    '&:hover': {
                                      boxShadow: '0 4px 12px rgba(100, 116, 139, 0.4)',
                                    }
                                  },
                                  '& .MuiSlider-track': {
                                    background: '#64748b',
                                    border: 'none',
                                    height: 6,
                                  },
                                  '& .MuiSlider-rail': {
                                    background: 'rgba(100, 116, 139, 0.2)',
                                    height: 6,
                                  }
                                }}
                              />
                            </Box>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
                
            {/* Premium Constraints */}
                <Grid item xs={12}>
              <Card
                variant="outlined"
                sx={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(245, 158, 11, 0.15)',
                  borderRadius: '20px',
                  boxShadow: '0 12px 40px rgba(245, 158, 11, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #f59e0b, #d97706, #b45309)',
                    borderRadius: '20px 20px 0 0',
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 16px 48px rgba(245, 158, 11, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
                      }}
                    >
                      <RulerIcon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                    Kısıtlamalar
                  </Typography>
                  </Stack>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.08) 100%)',
                          border: '2px solid rgba(245, 158, 11, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.12) 100%)',
                            transform: 'scale(1.02)',
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                            }}
                          >
                            <CutIcon sx={{ fontSize: 16, color: 'white' }} />
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f59e0b' }}>
                            Testere Kalınlığı
                          </Typography>
                        </Stack>
                      <TextField
                        fullWidth
                        type="number"
                        value={params.constraints.kerfWidth}
                        onChange={(e) => setParams({
                          ...params,
                          constraints: {...params.constraints, kerfWidth: Number(e.target.value)}
                        })}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">{params.unit}</InputAdornment>,
                            sx: {
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)',
                          border: '2px solid rgba(16, 185, 129, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.12) 100%)',
                            transform: 'scale(1.02)',
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                            }}
                          >
                            <CheckIcon sx={{ fontSize: 16, color: 'white' }} />
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#10b981' }}>
                            Başlangıç Güvenlik
                          </Typography>
                        </Stack>
                      <TextField
                        fullWidth
                        type="number"
                        value={params.constraints.startSafety}
                        onChange={(e) => setParams({
                          ...params,
                          constraints: {...params.constraints, startSafety: Number(e.target.value)}
                        })}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">{params.unit}</InputAdornment>,
                            sx: {
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)',
                          border: '2px solid rgba(16, 185, 129, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.12) 100%)',
                            transform: 'scale(1.02)',
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                            }}
                          >
                            <CheckIcon sx={{ fontSize: 16, color: 'white' }} />
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#10b981' }}>
                            Bitiş Güvenlik
                          </Typography>
                        </Stack>
                      <TextField
                        fullWidth
                        type="number"
                        value={params.constraints.endSafety}
                        onChange={(e) => setParams({
                          ...params,
                          constraints: {...params.constraints, endSafety: Number(e.target.value)}
                        })}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">{params.unit}</InputAdornment>,
                            sx: {
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
                          border: '2px solid rgba(139, 92, 246, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.12) 100%)',
                            transform: 'scale(1.02)',
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                            }}
                          >
                            <RulerIcon sx={{ fontSize: 16, color: 'white' }} />
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#8b5cf6' }}>
                            Min. Hurda Uzunluğu
                          </Typography>
                        </Stack>
                      <TextField
                        fullWidth
                        type="number"
                        value={params.constraints.minScrapLength}
                        onChange={(e) => setParams({
                          ...params,
                          constraints: {...params.constraints, minScrapLength: Number(e.target.value)}
                        })}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">{params.unit}</InputAdornment>,
                            sx: {
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.08) 100%)',
                          border: '2px solid rgba(239, 68, 68, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.12) 100%)',
                            transform: 'scale(1.02)',
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                            }}
                          >
                            <WasteIcon sx={{ fontSize: 16, color: 'white' }} />
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ef4444' }}>
                            Maksimum Atık %
                          </Typography>
                        </Stack>
                      <TextField
                        fullWidth
                        type="number"
                        value={params.constraints.maxWastePercentage}
                        onChange={(e) => setParams({
                          ...params,
                          constraints: {...params.constraints, maxWastePercentage: Number(e.target.value)}
                        })}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            sx: {
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)',
                          border: '2px solid rgba(59, 130, 246, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.12) 100%)',
                            transform: 'scale(1.02)',
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                            }}
                          >
                            <CutIcon sx={{ fontSize: 16, color: 'white' }} />
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                            Stok Başına Maks. Kesim
                          </Typography>
                        </Stack>
                      <TextField
                        fullWidth
                        type="number"
                        value={params.constraints.maxCutsPerStock}
                        onChange={(e) => setParams({
                          ...params,
                          constraints: {...params.constraints, maxCutsPerStock: Number(e.target.value)}
                        })}
                          InputProps={{
                            sx: {
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
                </Grid>
                
            {/* Premium Stock Lengths */}
                <Grid item xs={12}>
              <Card
                variant="outlined"
                sx={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.15)',
                  borderRadius: '20px',
                  boxShadow: '0 12px 40px rgba(139, 92, 246, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #8b5cf6, #7c3aed, #6d28d9)',
                    borderRadius: '20px 20px 0 0',
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 16px 48px rgba(139, 92, 246, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                      }}
                    >
                      <RulerIcon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                    Stok Uzunlukları
                  </Typography>
                  </Stack>
                  
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
                      border: '2px solid rgba(139, 92, 246, 0.2)',
                    }}
                  >
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      mb: 3,
                      color: '#8b5cf6',
                      textAlign: 'center'
                    }}>
                      Mevcut Stok Uzunlukları
                    </Typography>
                    
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    {params.stockLengths.map((length, index) => (
                      <Chip
                        key={index}
                        label={formatWithUnit(length, params.unit)}
                        onDelete={() => {
                          const newLengths = params.stockLengths.filter((_, i) => i !== index);
                          setParams({...params, stockLengths: newLengths});
                        }}
                          sx={{
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            px: 2,
                            py: 1,
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                            '& .MuiChip-deleteIcon': {
                              color: 'white',
                              '&:hover': {
                                color: 'rgba(255, 255, 255, 0.8)',
                              }
                            }
                        }}
                      />
                    ))}
                    </Stack>
                    
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
                        border: '2px solid rgba(139, 92, 246, 0.2)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 600, 
                        mb: 2,
                        color: '#8b5cf6'
                      }}>
                        Yeni Stok Uzunluğu Ekle
                      </Typography>
                    <TextField
                        fullWidth
                        placeholder="Uzunluk girin..."
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
                          endAdornment: <InputAdornment position="end">{params.unit}</InputAdornment>,
                          sx: {
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Enter tuşuna basarak ekleyin
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
                </Grid>
              </Grid>
              
          {/* Premium Action Buttons */}
          <Box sx={{ 
            mt: 6, 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 3,
            flexWrap: 'wrap'
          }}>
            <Button 
              onClick={() => setActiveStep(0)} 
              variant="outlined"
              size="large"
              sx={{
                minWidth: 160,
                py: 2,
                px: 4,
                borderRadius: '16px',
                border: '2px solid rgba(107, 114, 128, 0.3)',
                background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.05) 0%, rgba(75, 85, 99, 0.05) 100%)',
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  border: '2px solid rgba(107, 114, 128, 0.5)',
                  background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.1) 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(107, 114, 128, 0.2)',
                }
              }}
            >
              ← Geri
                </Button>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => setActiveStep(2)}
              sx={{
                minWidth: 200,
                py: 2,
                px: 6,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s',
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
                  transform: 'translateY(-3px) scale(1.02)',
                  boxShadow: '0 12px 40px rgba(139, 92, 246, 0.5)',
                  '&::before': {
                    left: '100%',
                  }
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <CheckIcon sx={{ fontSize: 24 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Devam Et
                </Typography>
              </Stack>
                </Button>
              </Box>
            </Box>
      )}

      {/* Step 3: Ön İzleme ve Doğrulama - Premium Design */}
      {activeStep === 2 && (
        <Box sx={{ mb: 3 }}>
          {/* Premium Header */}
          <Card
            variant="outlined" 
            sx={{
              mb: 4,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 12px 40px rgba(16, 185, 129, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #10b981, #059669, #047857)',
                borderRadius: '20px 20px 0 0',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '20px',
                      padding: '2px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'xor',
                    }
                  }}
                >
                  <PreviewIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 800, 
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    letterSpacing: '-0.02em'
                  }}>
            Ön İzleme ve Doğrulama
          </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Optimizasyon parametrelerini kontrol edin ve başlatın
                  </Typography>
                </Box>
                <Chip
                  label="Hazır"
                  sx={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    px: 2,
                    py: 1,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Premium Success Alert */}
          <Alert 
            severity="success" 
            sx={{ 
              mb: 4,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)',
              border: '2px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.1)',
              '& .MuiAlert-icon': {
                fontSize: '2rem',
                color: '#10b981'
              },
              '& .MuiAlert-message': {
                py: 1
              }
            }}
          >
            <AlertTitle sx={{ 
              fontSize: '1.2rem', 
              fontWeight: 700,
              color: '#059669',
              mb: 1
            }}>
              🎯 Optimizasyon Hazır!
            </AlertTitle>
            <Typography variant="body1" sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
              Tüm parametreler başarıyla ayarlandı. Aşağıdaki detaylı özeti inceleyip optimizasyonu başlatabilirsiniz.
            </Typography>
          </Alert>
          
          {/* Premium Preview Metrics */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card
                variant="outlined"
                sx={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(59, 130, 246, 0.15)',
                  borderRadius: '20px',
                  boxShadow: '0 12px 40px rgba(59, 130, 246, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #3b82f6, #1d4ed8, #1e40af)',
                    borderRadius: '20px 20px 0 0',
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 48px rgba(59, 130, 246, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                      }}
                    >
                      <CutIcon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                    Kesim Listesi Özeti
                  </Typography>
                  </Stack>
                  
                  {(() => {
                    const metrics = calculatePreviewMetrics();
                    return (
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 3,
                              borderRadius: '16px',
                              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)',
                              border: '1px solid rgba(59, 130, 246, 0.2)',
                              textAlign: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.12) 100%)',
                                transform: 'scale(1.02)',
                              }
                            }}
                          >
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                            Toplam Parça
                          </Typography>
                            <Typography variant="h4" sx={{ 
                              fontWeight: 800,
                              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}>
                            {metrics.totalPieces}
                          </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 3,
                              borderRadius: '16px',
                              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              textAlign: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.12) 100%)',
                                transform: 'scale(1.02)',
                              }
                            }}
                          >
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                            Toplam Uzunluk
                          </Typography>
                            <Typography variant="h4" sx={{ 
                              fontWeight: 800,
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}>
                            {formatWithUnit(metrics.totalLength, params.unit)}
                          </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 3,
                              borderRadius: '16px',
                              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.08) 100%)',
                              border: '1px solid rgba(245, 158, 11, 0.2)',
                              textAlign: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.12) 100%)',
                                transform: 'scale(1.02)',
                              }
                            }}
                          >
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                            Ortalama Uzunluk
                          </Typography>
                            <Typography variant="h4" sx={{ 
                              fontWeight: 800,
                              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}>
                            {formatWithUnit(metrics.avgLength, params.unit)}
                          </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 3,
                              borderRadius: '16px',
                              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
                              border: '1px solid rgba(139, 92, 246, 0.2)',
                              textAlign: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.12) 100%)',
                                transform: 'scale(1.02)',
                              }
                            }}
                          >
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                            Tahmini Stok
                          </Typography>
                            <Typography variant="h4" sx={{ 
                              fontWeight: 800,
                              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}>
                            {metrics.stockNeeded}
                          </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card
                variant="outlined"
                sx={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.15)',
                  borderRadius: '20px',
                  boxShadow: '0 12px 40px rgba(139, 92, 246, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #8b5cf6, #7c3aed, #6d28d9)',
                    borderRadius: '20px 20px 0 0',
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 48px rgba(139, 92, 246, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                      }}
                    >
                      <SettingsIcon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                    Optimizasyon Ayarları
                  </Typography>
                  </Stack>
                  
                  <Stack spacing={3}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.12) 100%)',
                          transform: 'scale(1.01)',
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                          }}
                        >
                          <AlgorithmIcon sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Algoritma
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {compareMode ? 
                          `${selectedAlgorithms.length} algoritma karşılaştırılacak` :
                          ALGORITHMS.find(a => a.value === params.algorithm)?.label
                        }
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.12) 100%)',
                          transform: 'scale(1.01)',
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                          }}
                        >
                          <RulerIcon sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Testere Kalınlığı
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatWithUnit(params.constraints.kerfWidth, params.unit)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.08) 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.12) 100%)',
                          transform: 'scale(1.01)',
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                          }}
                        >
                          <WasteIcon sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Maksimum Atık
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            %{params.constraints.maxWastePercentage}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.12) 100%)',
                          transform: 'scale(1.01)',
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          <CutIcon sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Stok Uzunlukları
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {params.stockLengths.map(l => formatWithUnit(l, params.unit)).join(', ')}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Premium Objectives Summary */}
            <Grid item xs={12}>
              <Card
                variant="outlined"
                sx={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: '20px',
                  boxShadow: '0 12px 40px rgba(16, 185, 129, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #10b981, #059669, #047857)',
                    borderRadius: '20px 20px 0 0',
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 48px rgba(16, 185, 129, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      <SpeedIcon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                    Optimizasyon Hedefleri
                  </Typography>
                  </Stack>
                  
                  <Grid container spacing={3}>
                    {params.objectives
                      .filter(obj => obj.weight > 0)
                      .sort((a, b) => b.weight - a.weight)
                      .map((obj) => {
                        const objInfo = OBJECTIVES.find(o => o.type === obj.type);
                        const priorityColor = obj.priority === 'high' ? '#ef4444' : 
                                             obj.priority === 'medium' ? '#f59e0b' : '#3b82f6';
                        const priorityBg = obj.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 
                                          obj.priority === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)';
                        
                        return (
                          <Grid item xs={12} sm={6} md={3} key={obj.type}>
                            <Box
                              sx={{
                                p: 3,
                                borderRadius: '20px',
                                background: `linear-gradient(135deg, ${priorityBg} 0%, ${priorityBg.replace('0.1', '0.05')} 100%)`,
                                border: `2px solid ${priorityColor}20`,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  transform: 'translateY(-4px) scale(1.02)',
                                  boxShadow: `0 12px 32px ${priorityColor}20`,
                                  background: `linear-gradient(135deg, ${priorityBg.replace('0.1', '0.15')} 0%, ${priorityBg.replace('0.1', '0.08')} 100%)`,
                                }
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '12px',
                                    background: `linear-gradient(135deg, ${priorityColor}, ${priorityColor}dd)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 4px 12px ${priorityColor}40`,
                                  }}
                                >
                              {objInfo?.icon}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" sx={{ 
                                    fontWeight: 600, 
                                    mb: 0.5,
                                    color: priorityColor
                                  }}>
                                  {objInfo?.label}
                                </Typography>
                                  <Chip
                                    label={obj.priority === 'high' ? 'Yüksek' : 
                                           obj.priority === 'medium' ? 'Orta' : 'Düşük'}
                                    size="small"
                                    sx={{
                                      background: `linear-gradient(135deg, ${priorityColor}, ${priorityColor}dd)`,
                                      color: 'white',
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                    }}
                                />
                              </Box>
                              </Stack>
                              
                              <Box sx={{ mb: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Ağırlık
                                  </Typography>
                                  <Typography variant="h6" sx={{ 
                                    fontWeight: 800,
                                    color: priorityColor
                                  }}>
                                %{Math.round(obj.weight * 100)}
                              </Typography>
                            </Stack>
                                <LinearProgress
                                  variant="determinate"
                                  value={obj.weight * 100}
                                  sx={{ 
                                    height: 8,
                                    borderRadius: 4,
                                    background: `${priorityColor}20`,
                                    '& .MuiLinearProgress-bar': {
                                      background: `linear-gradient(90deg, ${priorityColor}, ${priorityColor}dd)`,
                                      borderRadius: 4,
                                    }
                                  }}
                                />
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Premium Action Buttons */}
          <Box sx={{ 
            mt: 6, 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 3,
            flexWrap: 'wrap'
          }}>
            <Button 
              onClick={() => setActiveStep(1)} 
              variant="outlined"
              size="large"
              sx={{
                minWidth: 160,
                py: 2,
                px: 4,
                borderRadius: '16px',
                border: '2px solid rgba(107, 114, 128, 0.3)',
                background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.05) 0%, rgba(75, 85, 99, 0.05) 100%)',
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  border: '2px solid rgba(107, 114, 128, 0.5)',
                  background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.1) 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(107, 114, 128, 0.2)',
                }
              }}
            >
              ← Geri
            </Button>
            
            <Button
              variant="contained"
              size="large"
              onClick={compareMode ? compareAlgorithms : runOptimization}
              disabled={isOptimizing}
              startIcon={isOptimizing ? <CircularProgress size={24} color="inherit" /> : <PlayIcon />}
              sx={{
                minWidth: 240,
                py: 2,
                px: 6,
                borderRadius: '20px',
                background: isOptimizing 
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: isOptimizing 
                  ? '0 4px 12px rgba(156, 163, 175, 0.3)'
                  : '0 8px 32px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s',
                },
                '&:hover': !isOptimizing ? {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
                  transform: 'translateY(-3px) scale(1.02)',
                  boxShadow: '0 12px 40px rgba(16, 185, 129, 0.5)',
                  '&::before': {
                    left: '100%',
                  }
                } : {},
                '&:disabled': {
                  background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'not-allowed',
                }
              }}
            >
              {isOptimizing ? (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CircularProgress size={20} color="inherit" />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Optimizasyon Yapılıyor...
                  </Typography>
                </Stack>
              ) : (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <PlayIcon sx={{ fontSize: 24 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {compareMode ? 'Algoritmaları Karşılaştır' : 'Optimizasyonu Başlat'}
                  </Typography>
                </Stack>
              )}
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 4: Sonuçlar */}
      {activeStep === 3 && (
            <Box sx={{ mb: 3 }}>
              {optimizationResult && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  <AlertTitle>Optimizasyon Tamamlandı!</AlertTitle>
                  {compareMode ? 
                    `${selectedAlgorithms.length} algoritma başarıyla karşılaştırıldı.` :
                    `${ALGORITHMS.find(a => a.value === params.algorithm)?.label} algoritması ile optimizasyon tamamlandı.`
                  }
                </Alert>
              )}
              
              {/* Results Display */}
              {optimizationResult && optimizationResult.cuts ? (
                <EnterpriseOptimizationResults
                  result={optimizationResult}
                  cuttingList={cuttingList}
                  onNewOptimization={() => {
                    setActiveStep(0);
                    setOptimizationResult(null);
                    setCuttingList([]);
                  }}
                  onExport={() => {
                    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
                      console.log('Exporting results...', optimizationResult);
                    }
                  }}
                />
              ) : optimizationResult && optimizationResult.comparison ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Algoritma Karşılaştırma Sonuçları
                  </Typography>
                  <Grid container spacing={2}>
                    {optimizationResult.comparison.map((comp: any, index: number) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" color="primary">
                              {ALGORITHMS.find(a => a.value === comp.algorithm)?.label}
                            </Typography>
                            <Typography variant="body2">
                              Verimlilik: %{comp.efficiency?.toFixed(1) || 0}
                            </Typography>
                            <Typography variant="body2">
                              Atık: {comp.waste?.toFixed(0) || 0}mm
                            </Typography>
                            <Typography variant="body2">
                              Maliyet: {comp.cost?.toFixed(2) || 0} TL
                            </Typography>
                            <Typography variant="body2">
                              Süre: {comp.executionTime?.toFixed(0) || 0}ms
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="error" gutterBottom>
                    Optimizasyon sonucu bulunamadı
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lütfen optimizasyon parametrelerini kontrol edin ve tekrar deneyin.
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Button onClick={() => {
                  setActiveStep(0);
                  setOptimizationResult(null);
                  setCuttingList([]);
                }}>
                  Yeni Optimizasyon
                </Button>
              </Box>
            </Box>
      )}

      {/* Optimization Info Dialog */}
      <OptimizationInfoDialog 
        open={showInfoDialog}
        onClose={() => setShowInfoDialog(false)}
      />

    </Box>
  );
};

/**
 * @fileoverview Advanced Cutting List Selection Component
 * @module CuttingListSelector
 * @version 2.0.0 - Multi-Product & Work Order Support
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Chip,
  Grid,
  Divider,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Alert,
  LinearProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Inventory as ProductIcon,
  Assignment as WorkOrderIcon,
  Architecture as ProfileIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  IndeterminateCheckBox as IndeterminateIcon
} from '@mui/icons-material';
import { 
  CuttingListData, 
  CuttingListSection, 
  CuttingListItem,
  ConversionResult as ServiceConversionResult
} from '../services/cuttingListOptimizationService';
import { OptimizationItem } from '../types';

// ============================================================================
// INTERFACES
// ============================================================================

export interface CuttingListSelectorProps {
  cuttingList: CuttingListData;
  onSelectionChange: (selectedItems: OptimizationItem[]) => void;
  onConversionComplete: (result: ServiceConversionResult) => void;
  isConverting?: boolean;
}

export interface SelectionState {
  products: { [productId: string]: ProductSelectionState };
  totalSelectedItems: number;
  totalSelectedProfiles: number;
  estimatedTotalLength: number;
}

export interface ProductSelectionState {
  selected: boolean;
  indeterminate: boolean;
  workOrders: { [workOrderId: string]: WorkOrderSelectionState };
}

export interface WorkOrderSelectionState {
  selected: boolean;
  indeterminate: boolean;
  profiles: { [profileId: string]: boolean };
}

// Using ServiceConversionResult instead of local interface

// ============================================================================
// CUTTING LIST SELECTOR COMPONENT
// ============================================================================

export const CuttingListSelector: React.FC<CuttingListSelectorProps> = ({
  cuttingList,
  onSelectionChange,
  onConversionComplete,
  isConverting = false
}) => {
  const [selectionState, setSelectionState] = useState<SelectionState>({
    products: {},
    totalSelectedItems: 0,
    totalSelectedProfiles: 0,
    estimatedTotalLength: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<{ [key: string]: boolean }>({});

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return cuttingList.sections || [];
    
    return cuttingList.sections?.filter(section => 
      section.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.items?.some(item => 
        item.workOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.size.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) || [];
  }, [cuttingList.sections, searchTerm]);

  const totalStatistics = useMemo(() => {
    let totalProfiles = 0;
    let totalItems = 0;
    let totalLength = 0;

    cuttingList.sections?.forEach(section => {
      section.items?.forEach(item => {
        totalItems++;
        item.profiles?.forEach(profile => {
          totalProfiles++;
          const length = parseFloat(profile.measurement) || 0;
          totalLength += length * profile.quantity;
        });
      });
    });

    return { totalProfiles, totalItems, totalLength };
  }, [cuttingList]);

  // ============================================================================
  // SELECTION HANDLERS
  // ============================================================================

  const handleProductToggle = (sectionId: string, section: CuttingListSection) => {
    const newState = { ...selectionState };
    const currentProductState = newState.products[sectionId] || {
      selected: false,
      indeterminate: false,
      workOrders: {}
    };

    const newSelected = !currentProductState.selected;
    
    // Update product state
    newState.products[sectionId] = {
      selected: newSelected,
      indeterminate: false,
      workOrders: {}
    };

    // Update all work orders under this product
    section.items?.forEach(item => {
      newState.products[sectionId].workOrders[item.id] = {
        selected: newSelected,
        indeterminate: false,
        profiles: {}
      };

      // Update all profiles under this work order
      item.profiles?.forEach(profile => {
        newState.products[sectionId].workOrders[item.id].profiles[profile.id] = newSelected;
      });
    });

    setSelectionState(newState);
    updateConversion(newState);
  };

  const handleWorkOrderToggle = (sectionId: string, itemId: string, item: CuttingListItem) => {
    const newState = { ...selectionState };
    
    if (!newState.products[sectionId]) {
      newState.products[sectionId] = { selected: false, indeterminate: false, workOrders: {} };
    }

    const currentWorkOrderState = newState.products[sectionId].workOrders[itemId] || {
      selected: false,
      indeterminate: false,
      profiles: {}
    };

    const newSelected = !currentWorkOrderState.selected;
    
    // Update work order state
    newState.products[sectionId].workOrders[itemId] = {
      selected: newSelected,
      indeterminate: false,
      profiles: {}
    };

    // Update all profiles under this work order
    item.profiles?.forEach(profile => {
      newState.products[sectionId].workOrders[itemId].profiles[profile.id] = newSelected;
    });

    // Update product state based on work orders
    updateProductState(newState, sectionId);

    setSelectionState(newState);
    updateConversion(newState);
  };

  const handleProfileToggle = (sectionId: string, itemId: string, profileId: string) => {
    const newState = { ...selectionState };
    
    if (!newState.products[sectionId]) {
      newState.products[sectionId] = { selected: false, indeterminate: false, workOrders: {} };
    }
    
    if (!newState.products[sectionId].workOrders[itemId]) {
      newState.products[sectionId].workOrders[itemId] = {
        selected: false,
        indeterminate: false,
        profiles: {}
      };
    }

    // Toggle profile
    const currentSelected = newState.products[sectionId].workOrders[itemId].profiles[profileId] || false;
    newState.products[sectionId].workOrders[itemId].profiles[profileId] = !currentSelected;

    // Update work order state based on profiles
    updateWorkOrderState(newState, sectionId, itemId);
    
    // Update product state based on work orders
    updateProductState(newState, sectionId);

    setSelectionState(newState);
    updateConversion(newState);
  };

  const updateWorkOrderState = (state: SelectionState, sectionId: string, itemId: string) => {
    const workOrderState = state.products[sectionId].workOrders[itemId];
    const profileStates = Object.values(workOrderState.profiles);
    
    const allSelected = profileStates.length > 0 && profileStates.every(selected => selected);
    const someSelected = profileStates.some(selected => selected);
    
    workOrderState.selected = allSelected;
    workOrderState.indeterminate = someSelected && !allSelected;
  };

  const updateProductState = (state: SelectionState, sectionId: string) => {
    const productState = state.products[sectionId];
    const workOrderStates = Object.values(productState.workOrders);
    
    const allSelected = workOrderStates.length > 0 && workOrderStates.every(wo => wo.selected);
    const someSelected = workOrderStates.some(wo => wo.selected || wo.indeterminate);
    
    productState.selected = allSelected;
    productState.indeterminate = someSelected && !allSelected;
  };

  const updateConversion = (state: SelectionState) => {
    const selectedItems: OptimizationItem[] = [];
    let totalLength = 0;
    let totalQuantity = 0;

    cuttingList.sections?.forEach(section => {
      const productState = state.products[section.id];
      if (!productState) return;

      section.items?.forEach(item => {
        const workOrderState = productState.workOrders[item.id];
        if (!workOrderState) return;

        item.profiles?.forEach(profile => {
          const isSelected = workOrderState.profiles[profile.id];
          if (!isSelected) return;

          const length = parseFloat(profile.measurement) || 0;
          totalLength += length * profile.quantity;
          totalQuantity += profile.quantity;

          selectedItems.push({
            id: `${item.id}-${profile.id}`,
            workOrderId: item.workOrderId,
            productName: section.productName,
            profileType: profile.profile || 'Genel',
            measurement: profile.measurement,
            length: length,
            quantity: profile.quantity,
            totalLength: length * profile.quantity,
            size: item.size,
            color: item.color,
            note: item.note || '',
            version: item.version,
            date: item.date,
            metadata: {
              color: item.color,
              note: item.note || '',
              size: item.size,
              date: item.date,
              version: item.version,
              sipQuantity: item.orderQuantity,
              workOrderId: item.workOrderId
            }
          });
        });
      });
    });

    // Update selection statistics
    state.totalSelectedItems = selectedItems.length;
    state.totalSelectedProfiles = selectedItems.length;
    state.estimatedTotalLength = totalLength;

    // Notify parent components
    onSelectionChange(selectedItems);
    onConversionComplete({
      success: true,
      items: selectedItems,
      errors: [],
      warnings: [],
      statistics: {
        totalSections: 0,
        totalItems: selectedItems.length,
        totalProfiles: selectedItems.length,
        convertedItems: selectedItems.length,
        failedConversions: 0,
        totalLength: totalLength,
        totalQuantity: totalQuantity,
        averageLength: selectedItems.length > 0 ? totalLength / selectedItems.length : 0,
        processingTime: 0
      }
    });
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const selectAll = () => {
    const newState: SelectionState = {
      products: {},
      totalSelectedItems: 0,
      totalSelectedProfiles: 0,
      estimatedTotalLength: 0
    };

    cuttingList.sections?.forEach(section => {
      newState.products[section.id] = {
        selected: true,
        indeterminate: false,
        workOrders: {}
      };

      section.items?.forEach(item => {
        newState.products[section.id].workOrders[item.id] = {
          selected: true,
          indeterminate: false,
          profiles: {}
        };

        item.profiles?.forEach(profile => {
          newState.products[section.id].workOrders[item.id].profiles[profile.id] = true;
        });
      });
    });

    setSelectionState(newState);
    updateConversion(newState);
  };

  const clearAll = () => {
    const newState: SelectionState = {
      products: {},
      totalSelectedItems: 0,
      totalSelectedProfiles: 0,
      estimatedTotalLength: 0
    };

    setSelectionState(newState);
    updateConversion(newState);
  };

  const getCheckboxIcon = (selected: boolean, indeterminate: boolean) => {
    if (indeterminate) return <IndeterminateIcon color="primary" />;
    if (selected) return <CheckIcon color="primary" />;
    return <UncheckedIcon />;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)',
      minHeight: '100vh',
      p: 0
    }}>
      {/* Premium Header */}
      <Card 
        sx={{ 
          mb: 3,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a237e 0%, #ff6f00 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(26,35,126,0.3)',
              }}
            >
              <ProductIcon sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #1a237e 0%, #ff6f00 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  lineHeight: 1.2,
                }}
              >
                {cuttingList.title}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ 
                fontWeight: 500,
                fontSize: { xs: '0.9rem', md: '1rem' },
                opacity: 0.8,
              }}>
                Detaylı Ürün ve İş Emri Seçimi
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Chip 
                icon={<ProductIcon />} 
                label={`${filteredSections.length} Ürün`} 
                size="medium" 
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  px: 2,
                  py: 1,
                  boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                  '& .MuiChip-icon': {
                    color: 'white',
                    fontSize: '1.2rem',
                  },
                  '& .MuiChip-label': {
                    px: 2
                  }
                }}
              />
              <Chip 
                icon={<WorkOrderIcon />} 
                label={`${totalStatistics.totalItems} İş Emri`} 
                size="medium" 
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  px: 2,
                  py: 1,
                  boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                  '& .MuiChip-icon': {
                    color: 'white',
                    fontSize: '1.2rem',
                  },
                  '& .MuiChip-label': {
                    px: 2
                  }
                }}
              />
              <Chip 
                icon={<ProfileIcon />} 
                label={`${totalStatistics.totalProfiles} Profil`} 
                size="medium" 
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  px: 2,
                  py: 1,
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  '& .MuiChip-icon': {
                    color: 'white',
                    fontSize: '1.2rem',
                  },
                  '& .MuiChip-label': {
                    px: 2
                  }
                }}
              />
            </Stack>
          </Box>

          {/* Premium Search */}
          <TextField
            fullWidth
            size="large"
            placeholder="Ürün adı, iş emri, renk veya ebat ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#1a237e', fontSize: 24 }} />
                </InputAdornment>
              )
            }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(0,0,0,0.08)',
                fontSize: '1.1rem',
                py: 1,
                '&:hover': {
                  border: '2px solid rgba(26,35,126,0.2)',
                  background: 'rgba(255, 255, 255, 1)',
                  boxShadow: '0 4px 12px rgba(26,35,126,0.1)',
                },
                '&.Mui-focused': {
                  border: '2px solid #1a237e',
                  background: 'rgba(255, 255, 255, 1)',
                  boxShadow: '0 8px 24px rgba(26,35,126,0.15)',
                }
              }
            }}
          />

          {/* Premium Quick Actions */}
          <Stack direction="row" spacing={3} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" 
                variant="contained" 
                onClick={selectAll}
                disabled={isConverting}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(59,130,246,0.4)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    transform: 'none',
                    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Tümünü Seç
              </Button>
              <Button 
                size="large" 
                variant="outlined" 
                onClick={clearAll}
                disabled={isConverting}
                sx={{
                  border: '2px solid #ef4444',
                  color: '#ef4444',
                  fontWeight: 700,
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  background: 'rgba(239,68,68,0.05)',
                  '&:hover': {
                    background: 'rgba(239,68,68,0.1)',
                    border: '2px solid #dc2626',
                    color: '#dc2626',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(239,68,68,0.2)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    transform: 'none',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Temizle
              </Button>
            </Stack>
            
            {selectionState.totalSelectedProfiles > 0 && (
              <Stack direction="row" spacing={2}>
                <Chip 
                  label={`${selectionState.totalSelectedProfiles} Seçili`} 
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    px: 2,
                    py: 1,
                    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                    '& .MuiChip-label': {
                      px: 2
                    }
                  }}
                />
                <Chip 
                  label={`${(selectionState.estimatedTotalLength / 1000).toFixed(1)}m`} 
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    px: 2,
                    py: 1,
                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                    '& .MuiChip-label': {
                      px: 2
                    }
                  }}
                />
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Premium Conversion Progress */}
      {isConverting && (
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
              background: 'linear-gradient(90deg, #f59e0b, #f97316, #ef4444)',
            }
          }}
        >
          <CardContent sx={{ py: 3, px: 3 }}>
            <Stack spacing={2} alignItems="center">
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: '#1e40af',
                  textAlign: 'center'
                }}
              >
                Optimizasyon Formatına Dönüştürülüyor...
              </Typography>
              <Box sx={{ width: '100%', maxWidth: 400 }}>
                <LinearProgress 
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    background: 'rgba(59, 130, 246, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)',
                      borderRadius: 4,
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Lütfen bekleyin, seçili veriler işleniyor...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <Box>
        {filteredSections.length === 0 ? (
          <Alert severity="info">
            {searchTerm ? 'Arama kriterlerine uygun ürün bulunamadı.' : 'Bu kesim listesinde ürün bulunamadı.'}
          </Alert>
        ) : (
          filteredSections.map((section) => {
            const productState = selectionState.products[section.id] || {
              selected: false,
              indeterminate: false,
              workOrders: {}
            };

            return (
              <Accordion 
                key={section.id}
                expanded={expandedProducts[section.id] || false}
                onChange={() => setExpandedProducts(prev => ({
                  ...prev,
                  [section.id]: !prev[section.id]
                }))}
                sx={{ 
                  mb: 2,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
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
                    background: productState.selected 
                      ? 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
                      : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                    zIndex: 1,
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 6px 20px rgba(0,0,0,0.08)',
                    border: '2px solid rgba(26,35,126,0.2)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon sx={{ color: '#1a237e', fontSize: 28 }} />}
                  sx={{ 
                    p: 3,
                    position: 'relative',
                    zIndex: 2,
                    '& .MuiAccordionSummary-content': {
                      margin: 0,
                    }
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={3} sx={{ width: '100%' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={productState.selected}
                          indeterminate={productState.indeterminate}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleProductToggle(section.id, section);
                          }}
                          icon={getCheckboxIcon(false, false)}
                          checkedIcon={getCheckboxIcon(true, false)}
                          indeterminateIcon={getCheckboxIcon(false, true)}
                          sx={{
                            '& .MuiSvgIcon-root': {
                              fontSize: 28,
                            }
                          }}
                        />
                      }
                      label=""
                      sx={{ m: 0 }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700, 
                        color: '#1a237e',
                        fontSize: '1.2rem',
                        mb: 0.5
                      }}>
                        {section.productName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        fontWeight: 500,
                        fontSize: '0.9rem'
                      }}>
                        {section.items?.length || 0} iş emri
                      </Typography>
                    </Box>

                    <Badge 
                      badgeContent={Object.values(productState.workOrders).filter(wo => wo.selected).length}
                      color="primary"
                      sx={{ 
                        mr: 2,
                        '& .MuiBadge-badge': {
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          minWidth: 24,
                          height: 24,
                        }
                      }}
                    >
                      <WorkOrderIcon sx={{ color: '#1a237e', fontSize: 28 }} />
                    </Badge>
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 3, position: 'relative', zIndex: 2 }}>
                  <Stack spacing={3}>
                    {section.items?.map((item) => {
                      const workOrderState = productState.workOrders[item.id] || {
                        selected: false,
                        indeterminate: false,
                        profiles: {}
                      };

                      return (
                        <Card 
                          key={item.id} 
                          sx={{ 
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid rgba(0,0,0,0.05)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.02)',
                            borderRadius: 2,
                            overflow: 'hidden',
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '3px',
                              background: workOrderState.selected 
                                ? 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
                                : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                              zIndex: 1,
                            },
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
                              border: '2px solid rgba(26,35,126,0.1)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={workOrderState.selected}
                                    indeterminate={workOrderState.indeterminate}
                                    onChange={() => handleWorkOrderToggle(section.id, item.id, item)}
                                    icon={getCheckboxIcon(false, false)}
                                    checkedIcon={getCheckboxIcon(true, false)}
                                    indeterminateIcon={getCheckboxIcon(false, true)}
                                    sx={{
                                      '& .MuiSvgIcon-root': {
                                        fontSize: 24,
                                      }
                                    }}
                                  />
                                }
                                label=""
                                sx={{ m: 0 }}
                              />
                              
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ 
                                  fontWeight: 700,
                                  color: '#1a237e',
                                  fontSize: '1.1rem',
                                  mb: 1
                                }}>
                                  İş Emri: {item.workOrderId}
                                </Typography>
                                <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                  <Chip 
                                    label={item.color} 
                                    size="medium" 
                                    sx={{
                                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                      color: 'white',
                                      fontWeight: 600,
                                      fontSize: '0.8rem',
                                      px: 2,
                                      py: 0.5,
                                      boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                                    }}
                                  />
                                  <Chip 
                                    label={item.size} 
                                    size="medium" 
                                    sx={{
                                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                      color: 'white',
                                      fontWeight: 600,
                                      fontSize: '0.8rem',
                                      px: 2,
                                      py: 0.5,
                                      boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                                    }}
                                  />
                                  <Chip 
                                    label={`${item.orderQuantity} adet`} 
                                    size="medium" 
                                    sx={{
                                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                      color: 'white',
                                      fontWeight: 600,
                                      fontSize: '0.8rem',
                                      px: 2,
                                      py: 0.5,
                                      boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                                    }}
                                  />
                                  <Chip 
                                    label={item.version} 
                                    size="medium" 
                                    sx={{
                                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                      color: 'white',
                                      fontWeight: 600,
                                      fontSize: '0.8rem',
                                      px: 2,
                                      py: 0.5,
                                      boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
                                    }}
                                  />
                                </Stack>
                              </Box>
                            </Stack>

                            {/* Premium Profiles */}
                            <Grid container spacing={2}>
                              {item.profiles?.map((profile) => {
                                const isSelected = workOrderState.profiles[profile.id] || false;
                                
                                return (
                                  <Grid item xs={12} sm={6} md={4} key={profile.id}>
                                    <Card 
                                      sx={{ 
                                        background: isSelected 
                                          ? 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(29,78,216,0.05) 100%)'
                                          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                                        backdropFilter: 'blur(10px)',
                                        border: isSelected ? '2px solid #3b82f6' : '2px solid rgba(0,0,0,0.05)',
                                        boxShadow: isSelected 
                                          ? '0 8px 24px rgba(59,130,246,0.15), 0 4px 12px rgba(59,130,246,0.08)'
                                          : '0 4px 16px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.02)',
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        '&::before': {
                                          content: '""',
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          height: '3px',
                                          background: isSelected 
                                            ? 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
                                            : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                          zIndex: 1,
                                        },
                                        '&:hover': { 
                                          transform: 'translateY(-2px)',
                                          boxShadow: isSelected 
                                            ? '0 12px 32px rgba(59,130,246,0.2), 0 6px 16px rgba(59,130,246,0.12)'
                                            : '0 8px 24px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
                                          border: isSelected ? '2px solid #1d4ed8' : '2px solid rgba(26,35,126,0.1)',
                                        },
                                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                      }}
                                      onClick={() => handleProfileToggle(section.id, item.id, profile.id)}
                                    >
                                      <CardContent sx={{ p: 2.5, position: 'relative', zIndex: 2 }}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                          <Checkbox
                                            checked={isSelected}
                                            size="medium"
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => handleProfileToggle(section.id, item.id, profile.id)}
                                            sx={{
                                              '& .MuiSvgIcon-root': {
                                                fontSize: 20,
                                              }
                                            }}
                                          />
                                          <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" sx={{ 
                                              fontWeight: 700,
                                              color: isSelected ? '#1d4ed8' : '#1a237e',
                                              fontSize: '0.9rem',
                                              mb: 0.5
                                            }}>
                                              {profile.profile || 'Genel'}
                                            </Typography>
                                            <Typography variant="h6" sx={{ 
                                              fontWeight: 600,
                                              color: isSelected ? '#3b82f6' : '#059669',
                                              fontSize: '1rem',
                                              mb: 0.5
                                            }}>
                                              {profile.measurement}mm
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ 
                                              fontWeight: 500,
                                              fontSize: '0.8rem'
                                            }}>
                                              {profile.quantity} adet
                                            </Typography>
                                          </Box>
                                        </Stack>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default CuttingListSelector;

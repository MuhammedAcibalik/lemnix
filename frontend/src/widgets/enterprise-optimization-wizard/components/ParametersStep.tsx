/**
 * @fileoverview Parameters Panel Component - Design System v2.0
 * @module ParametersPanel
 * @version 2.0.0
 * 
 * Tab 2: Optimization Parameters Configuration
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Alert,
  alpha,
  type SelectChangeEvent,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Psychology as PsychologyIcon,
  ExpandMore as ExpandMoreIcon,
  Straighten as RulerIcon,
  Check as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import { AlgorithmModeSelector } from '@/widgets/algorithm-selector';
import type { ParametersStepProps, AlgorithmType } from '../types';

/**
 * ParametersPanel Component (formerly ParametersStep)
 * Modern tab-based panel with Design System v2.0
 */
export const ParametersStep: React.FC<ParametersStepProps> = ({
  params,
  onParamsChange,
  algorithmMode = 'standard',
  onAlgorithmModeChange,
  itemCount,
}) => {
  const ds = useDesignSystem();

  const handleAlgorithmChange = (algorithm: AlgorithmType) => {
    onParamsChange({ ...params, algorithm });
  };

  const handleObjectiveToggle = (objectiveKey: string) => {
    const currentObjectives = params.objectives || [];
    const isSelected = currentObjectives.some(obj => obj.type === objectiveKey);
    
    let newObjectives;
    if (isSelected) {
      // Remove objective
      newObjectives = currentObjectives.filter(obj => obj.type !== objectiveKey);
    } else {
      // Add objective with default values
      newObjectives = [
        ...currentObjectives,
        { 
          type: objectiveKey as 'minimize-waste' | 'minimize-cost' | 'minimize-time' | 'maximize-efficiency', 
          weight: 1, 
          priority: 'medium' as const 
        }
      ];
    }
    
    onParamsChange({ ...params, objectives: newObjectives });
  };

  const objectives = [
    { 
      key: 'maximize-efficiency', 
      label: 'Verimlilik Maksimizasyonu', 
      description: 'Malzeme kullanım oranını maksimize eder',
      color: ds.colors.primary.main,
      icon: '📈'
    },
    { 
      key: 'minimize-waste', 
      label: 'Atık Minimizasyonu', 
      description: 'Kesim artıklarını ve fire miktarını azaltır',
      color: ds.colors.success.main,
      icon: '♻️'
    },
    { 
      key: 'minimize-cost', 
      label: 'Maliyet Minimizasyonu', 
      description: 'Toplam malzeme ve işçilik maliyetini düşürür',
      color: ds.colors.warning.main,
      icon: '💰'
    },
    { 
      key: 'minimize-time', 
      label: 'Zaman Minimizasyonu', 
      description: 'Kurulum ve kesim süresini optimize eder',
      color: ds.colors.secondary.main,
      icon: '⚡'
    }
  ];
  
  const isObjectiveSelected = (key: string) => {
    return params.objectives?.some(obj => obj.type === key) || false;
  };

  return (
    <Box sx={{ 
      p: 0,
      height: '100%',
    }}>
      {/* Enterprise Algorithm Configuration */}
      <Grid container spacing={ds.spacing['4']}>
        
        {/* Algorithm Engine Selection */}
        <Grid item xs={12}>
          <Card sx={{
            background: `linear-gradient(135deg, ${alpha(ds.colors.primary.main, 0.03)} 0%, ${alpha(ds.colors.secondary.main, 0.02)} 100%)`,
            border: `2px solid ${alpha(ds.colors.primary.main, 0.08)}`,
            borderRadius: `${ds.borderRadius.xl}px`,
            boxShadow: ds.shadows.soft.lg,
            position: 'relative',
        overflow: 'hidden',
            transition: ds.transitions.base,
            '&:hover': {
              borderColor: alpha(ds.colors.primary.main, 0.15),
              boxShadow: ds.shadows.soft.xl,
            },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
              height: '3px',
              background: ds.gradients.primary,
            }
          }}>
            <CardContent sx={{ p: ds.spacing['6'] }}>
              {/* Header */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: ds.spacing['6']
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['3'] }}>
                  <Box sx={{
                    p: ds.spacing['3'],
                    borderRadius: `${ds.borderRadius.xl}px`,
                    background: alpha(ds.colors.primary.main, 0.08),
                    border: `1px solid ${alpha(ds.colors.primary.main, 0.15)}`,
                  }}>
                    <PsychologyIcon sx={{ fontSize: 28, color: ds.colors.primary.main }} />
                  </Box>
                  <Box>
                    <Typography sx={{
                      fontSize: '1.375rem',
                      fontWeight: ds.typography.fontWeight.bold,
                      color: ds.colors.text.primary,
                      mb: ds.spacing['1'],
                      letterSpacing: ds.typography.letterSpacing.tight,
                    }}>
                      Algoritma Motoru
        </Typography>
                    <Typography sx={{
                      fontSize: '0.9375rem',
                      color: ds.colors.text.secondary,
                      fontWeight: ds.typography.fontWeight.medium,
                    }}>
                      Optimizasyon algoritmasını seçin ve yapılandırın
        </Typography>
                  </Box>
                </Box>
                
                <Chip
                  label="Enterprise"
                  size="small"
              sx={{
                    height: 28,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: alpha(ds.colors.primary.main, 0.08),
                    color: ds.colors.primary.main,
                    border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                    borderRadius: `${ds.borderRadius.md}px`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                />
              </Box>

              {/* Algorithm Selection */}
              <Box sx={{ mb: ds.spacing['2'] }}>
                <Typography sx={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: ds.colors.text.primary,
                  mb: ds.spacing['1'],
                }}>
                  Algoritma Seçimi
                </Typography>
                <Typography sx={{
                  fontSize: '0.8125rem',
                  color: ds.colors.text.secondary,
                }}>
                  Optimizasyon algoritmasını seçin
                </Typography>
              </Box>

              {/* Advanced Mode Info Alert */}
              {algorithmMode === 'advanced' && (
                <Alert 
                  severity="info" 
                  icon={<InfoIcon />}
                  sx={{ 
                    mb: ds.spacing['3'],
                    borderRadius: `${ds.borderRadius.xl}px`,
                    backgroundColor: alpha(ds.colors.primary.main, 0.05),
                    border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                    '& .MuiAlert-icon': {
                      color: ds.colors.primary.main,
                    }
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: ds.spacing['1'] }}>
                    Gelişmiş Mod Aktif
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                    Çok hedefli optimizasyon için <strong>NSGA-II algoritması</strong> kullanılacaktır. 
                    Bu mod Pareto front analizi ve alternatif çözümler sağlar.
                  </Typography>
                </Alert>
              )}
              
              {/* Algorithm Cards Grid - SQUARE CARDS */}
              <Grid container spacing={ds.spacing['3']}>
                {[
                  {
                    id: 'ffd',
                    name: 'FFD',
                    shortName: 'First Fit',
                    description: 'Hızlı • Basit',
                    icon: '⚡',
                    color: ds.colors.warning.main,
                  },
                  {
                    id: 'bfd',
                    name: 'BFD',
                    shortName: 'Best Fit',
                    description: 'Akıllı • Verimli',
                    icon: '🎯',
                    color: ds.colors.primary.main,
                  },
                  {
                    id: 'genetic',
                    name: 'GA',
                    shortName: 'Genetic',
                    description: 'AI • Çok Hedefli',
                    icon: '🧬',
                    color: ds.colors.secondary.main,
                  },
                  {
                    id: 'pooling',
                    name: 'Pool',
                    shortName: 'Pooling',
                    description: 'Grup • Havuz',
                    icon: '📊',
                    color: ds.colors.success.main,
                  },
                  {
                    id: 'pattern-exact',
                    name: 'Pattern',
                    shortName: 'Exact',
                    description: 'Kesin • Optimal',
                    icon: '🎖️',
                    color: ds.colors.info.main || ds.colors.primary.main,
                  }
                ].map((algorithm) => {
                  const isSelected = params.algorithm === algorithm.id;
                  const isDisabled = algorithmMode === 'advanced'; // Disable in advanced mode
                  
                  return (
                    <Grid item xs={6} sm={4} key={algorithm.id}>
                      <Card
                        sx={{
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          border: `2px solid ${isSelected ? algorithm.color : alpha(ds.colors.neutral[300], 0.2)}`,
                          borderRadius: `${ds.borderRadius.xl}px`,
                          background: isSelected 
                            ? `linear-gradient(135deg, ${alpha(algorithm.color, 0.08)} 0%, ${alpha(algorithm.color, 0.03)} 100%)`
                            : `linear-gradient(135deg, ${alpha(ds.colors.neutral[100], 0.3)} 0%, ${alpha(ds.colors.neutral[50], 0.5)} 100%)`,
                          transition: ds.transitions.base,
                          aspectRatio: '1', // PERFECT SQUARE!
                          position: 'relative',
                          opacity: isDisabled ? 0.5 : 1,
                          pointerEvents: isDisabled ? 'none' : 'auto',
                          '&:hover': !isDisabled ? {
                            borderColor: algorithm.color,
                            background: `linear-gradient(135deg, ${alpha(algorithm.color, 0.05)} 0%, ${alpha(algorithm.color, 0.02)} 100%)`,
                            transform: 'translateY(-4px)',
                            boxShadow: ds.shadows.soft.lg,
                          } : {}
                        }}
                        onClick={() => !isDisabled && handleAlgorithmChange(algorithm.id as AlgorithmType)}
                      >
                        {/* Selection Badge */}
                        {isSelected && (
                          <Box sx={{
                            position: 'absolute',
                            top: ds.spacing['2'],
                            right: ds.spacing['2'],
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: algorithm.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `2px solid ${ds.colors.background.paper}`,
                            boxShadow: ds.shadows.soft.md,
                            zIndex: 1,
                          }}>
                            <CheckIcon sx={{ fontSize: 16, color: 'white' }} />
                          </Box>
                        )}
                        
                        <CardContent sx={{ 
                          p: ds.spacing['3'], 
                          textAlign: 'center', 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          {/* Icon - Bigger for square */}
                          <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: isSelected 
                              ? `linear-gradient(135deg, ${alpha(algorithm.color, 0.15)} 0%, ${alpha(algorithm.color, 0.08)} 100%)`
                              : `linear-gradient(135deg, ${alpha(ds.colors.neutral[300], 0.1)} 0%, ${alpha(ds.colors.neutral[200], 0.05)} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: ds.spacing['2'],
                            border: `2px solid ${isSelected ? alpha(algorithm.color, 0.2) : alpha(ds.colors.neutral[300], 0.1)}`,
                            transition: ds.transitions.base,
                          }}>
                            <Typography sx={{
                              fontSize: '2.5rem',
                            }}>
                              {algorithm.icon}
                            </Typography>
                          </Box>
                          
                          {/* Title - Compact */}
                          <Typography sx={{
                            fontSize: '1.125rem',
                            fontWeight: ds.typography.fontWeight.bold,
                            color: isSelected ? algorithm.color : ds.colors.text.primary,
                            mb: ds.spacing['1'],
                            letterSpacing: ds.typography.letterSpacing.tight,
                          }}>
                            {algorithm.name}
                          </Typography>
                          
                          {/* Short Name */}
                          <Typography sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: ds.colors.text.secondary,
                            mb: ds.spacing['2'],
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}>
                            {algorithm.shortName}
                          </Typography>
                          
                          {/* Description - Compact */}
                          <Typography sx={{
                            fontSize: '0.75rem',
                            color: ds.colors.text.secondary,
                            fontWeight: ds.typography.fontWeight.medium,
                            lineHeight: 1.3,
                            textAlign: 'center',
                          }}>
                            {algorithm.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              
              {/* GPU Status Card */}
              <Box sx={{
                mt: ds.spacing['4'],
                p: ds.spacing['4'],
                background: `linear-gradient(135deg, ${alpha(ds.colors.success.main, 0.08)} 0%, ${alpha(ds.colors.success.main, 0.03)} 100%)`,
                borderRadius: `${ds.borderRadius.xl}px`,
                border: `2px solid ${alpha(ds.colors.success.main, 0.15)}`,
                textAlign: 'center',
                transition: ds.transitions.base,
                '&:hover': {
                  borderColor: alpha(ds.colors.success.main, 0.25),
                  transform: 'translateY(-2px)',
                }
              }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: alpha(ds.colors.success.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: ds.spacing['2'],
                }}>
                  <Typography sx={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: ds.colors.success.main,
                  }}>
                    ⚡
                  </Typography>
                </Box>
                <Typography sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: ds.colors.success.main,
                  mb: ds.spacing['1'],
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  GPU ACCELERATED
                </Typography>
                <Typography sx={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: ds.colors.text.primary,
                }}>
                  WebGPU Ready
                </Typography>
              </Box>
              </CardContent>
            </Card>
          </Grid>

        {/* Algorithm Mode Section (Hybrid Approach) */}
        {onAlgorithmModeChange && (
          <Grid item xs={12}>
            <Card
              sx={{
                border: `2px solid ${alpha(ds.colors.secondary.main, 0.08)}`,
                borderRadius: `${ds.borderRadius.xl}px`,
                boxShadow: ds.shadows.soft.lg,
                background: `linear-gradient(135deg, ${alpha(ds.colors.secondary.main, 0.02)} 0%, ${alpha(ds.colors.primary.main, 0.02)} 100%)`,
                transition: ds.transitions.base,
                '&:hover': {
                  borderColor: alpha(ds.colors.secondary.main, 0.15),
                  boxShadow: ds.shadows.soft.xl,
                },
              }}
            >
              <CardContent sx={{ p: ds.spacing['6'] }}>
                <AlgorithmModeSelector
                  value={algorithmMode}
                  onChange={onAlgorithmModeChange}
                  itemCount={itemCount}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Optimization Objectives */}
        <Grid item xs={12}>
          <Card sx={{
            border: `2px solid ${alpha(ds.colors.secondary.main, 0.08)}`,
            borderRadius: `${ds.borderRadius.xl}px`,
            boxShadow: ds.shadows.soft.lg,
            background: `linear-gradient(135deg, ${alpha(ds.colors.secondary.main, 0.03)} 0%, ${alpha(ds.colors.success.main, 0.02)} 100%)`,
            transition: ds.transitions.base,
            '&:hover': {
              borderColor: alpha(ds.colors.secondary.main, 0.15),
              boxShadow: ds.shadows.soft.xl,
            },
          }}>
            <CardContent sx={{ p: ds.spacing['6'] }}>
              {/* Header */}
              <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                gap: ds.spacing['3'],
                mb: ds.spacing['6']
              }}>
                <Box sx={{
                  p: ds.spacing['3'],
                  borderRadius: `${ds.borderRadius.xl}px`,
                  background: alpha(ds.colors.secondary.main, 0.08),
                  border: `1px solid ${alpha(ds.colors.secondary.main, 0.15)}`,
                }}>
                  <SettingsIcon sx={{ fontSize: 28, color: ds.colors.secondary.main }} />
                </Box>
                <Box>
                  <Typography sx={{
                    fontSize: '1.375rem',
                    fontWeight: ds.typography.fontWeight.bold,
                    color: ds.colors.text.primary,
                    mb: ds.spacing['1'],
                    letterSpacing: ds.typography.letterSpacing.tight,
                  }}>
                  Optimizasyon Hedefleri
                </Typography>
                  <Typography sx={{
                    fontSize: '0.9375rem',
                    color: ds.colors.text.secondary,
                    fontWeight: ds.typography.fontWeight.medium,
                  }}>
                    Algoritmanın optimize edeceği hedefleri seçin
                  </Typography>
                </Box>
              </Box>
              
              {/* Objectives Grid */}
              <Grid container spacing={ds.spacing['4']}>
                {objectives.map((objective) => {
                  const isSelected = isObjectiveSelected(objective.key);
                  return (
                    <Grid item xs={12} sm={6} md={3} key={objective.key}>
                      <Card
                      sx={{
                          cursor: 'pointer',
                          border: `2px solid ${isSelected ? objective.color : alpha(ds.colors.neutral[300], 0.2)}`,
                          borderRadius: `${ds.borderRadius.xl}px`,
                          background: isSelected 
                            ? `linear-gradient(135deg, ${alpha(objective.color, 0.08)} 0%, ${alpha(objective.color, 0.03)} 100%)`
                            : `linear-gradient(135deg, ${alpha(ds.colors.neutral[100], 0.3)} 0%, ${alpha(ds.colors.neutral[50], 0.5)} 100%)`,
                          transition: ds.transitions.base,
                          height: '100%',
                        '&:hover': {
                            borderColor: objective.color,
                            background: `linear-gradient(135deg, ${alpha(objective.color, 0.05)} 0%, ${alpha(objective.color, 0.02)} 100%)`,
                            transform: 'translateY(-4px)',
                            boxShadow: ds.shadows.soft.lg,
                          }
                        }}
                        onClick={() => handleObjectiveToggle(objective.key)}
                      >
                        <CardContent sx={{ p: ds.spacing['4'], textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Box>
                            <Box sx={{
                              width: 64,
                              height: 64,
                              borderRadius: '50%',
                              background: isSelected 
                                ? `linear-gradient(135deg, ${alpha(objective.color, 0.15)} 0%, ${alpha(objective.color, 0.08)} 100%)`
                                : `linear-gradient(135deg, ${alpha(ds.colors.neutral[300], 0.1)} 0%, ${alpha(ds.colors.neutral[200], 0.05)} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: ds.spacing['3'],
                              border: `2px solid ${isSelected ? alpha(objective.color, 0.2) : alpha(ds.colors.neutral[300], 0.1)}`,
                              transition: ds.transitions.base,
                              position: 'relative',
                            }}>
                              {isSelected && (
                                <Box sx={{
                                  position: 'absolute',
                                  top: -4,
                                  right: -4,
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  background: objective.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: `2px solid ${ds.colors.background.paper}`,
                                  boxShadow: ds.shadows.soft.md,
                                }}>
                                  <CheckIcon sx={{ fontSize: 16, color: 'white' }} />
                                </Box>
                              )}
                              <Typography sx={{
                                fontSize: '2rem',
                              }}>
                                {objective.icon}
                              </Typography>
                            </Box>
                            <Typography sx={{
                              fontSize: '0.9375rem',
                              fontWeight: ds.typography.fontWeight.bold,
                              color: isSelected ? objective.color : ds.colors.text.primary,
                              mb: ds.spacing['2'],
                              letterSpacing: ds.typography.letterSpacing.tight,
                            }}>
                              {objective.label}
                            </Typography>
                </Box>
                          <Typography sx={{
                            fontSize: '0.8125rem',
                            color: ds.colors.text.secondary,
                            fontWeight: ds.typography.fontWeight.medium,
                            lineHeight: 1.5,
                            mt: 'auto',
                          }}>
                            {objective.description}
                  </Typography>
              </CardContent>
            </Card>
          </Grid>
                  );
                })}
              </Grid>
              
              {/* Selection Summary */}
              <Box sx={{
                mt: ds.spacing['6'],
                p: ds.spacing['6'],
                background: `linear-gradient(135deg, ${alpha(ds.colors.primary.main, 0.08)} 0%, ${alpha(ds.colors.primary.main, 0.03)} 100%)`,
                borderRadius: `${ds.borderRadius.xl}px`,
                border: `2px solid ${alpha(ds.colors.primary.main, 0.1)}`,
                textAlign: 'center',
                transition: ds.transitions.base,
                '&:hover': {
                  borderColor: alpha(ds.colors.primary.main, 0.2),
                  transform: 'translateY(-2px)',
                }
              }}>
                <Typography sx={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: ds.colors.text.primary,
                  mb: ds.spacing['1'],
                }}>
                  {params.objectives?.length || 0} Hedef Seçildi
                </Typography>
                <Typography sx={{
                  fontSize: '0.8125rem',
                  color: ds.colors.text.secondary,
                  fontWeight: ds.typography.fontWeight.medium,
                }}>
                  {params.objectives?.length === 0 
                    ? 'En az bir hedef seçmelisiniz' 
                    : 'Çok hedefli optimizasyon aktif'
                  }
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stock Lengths Configuration */}
        <Grid item xs={12}>
          <Card
            sx={{
              border: `2px solid ${alpha(ds.colors.info.main, 0.08)}`,
              borderRadius: `${ds.borderRadius.xl}px`,
              boxShadow: ds.shadows.soft.lg,
              background: `linear-gradient(135deg, ${alpha(ds.colors.info.main, 0.02)} 0%, ${alpha(ds.colors.neutral[50], 0.5)} 100%)`,
              transition: ds.transitions.base,
              '&:hover': {
                borderColor: alpha(ds.colors.info.main, 0.15),
                boxShadow: ds.shadows.soft.xl,
              },
            }}
          >
            <CardContent sx={{ p: ds.spacing['6'] }}>
              {/* Header */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: ds.spacing['3'],
                mb: ds.spacing['4'],
              }}>
                <Box sx={{
                  p: ds.spacing['3'],
                  borderRadius: `${ds.borderRadius.xl}px`,
                  background: alpha(ds.colors.info.main, 0.08),
                  border: `1px solid ${alpha(ds.colors.info.main, 0.15)}`,
                }}>
                  <RulerIcon sx={{ fontSize: 28, color: ds.colors.info.main }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{
                    fontSize: '1.375rem',
                    fontWeight: ds.typography.fontWeight.bold,
                    color: ds.colors.text.primary,
                    mb: ds.spacing['1'],
                    letterSpacing: ds.typography.letterSpacing.tight,
                  }}>
                    Stok Boy Uzunlukları
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.9375rem',
                    color: ds.colors.text.secondary,
                    fontWeight: ds.typography.fontWeight.medium,
                  }}>
                    Optimizasyonda kullanılacak alüminyum profil stok boyları
                  </Typography>
                </Box>
              </Box>

              {/* Stock Lengths Display */}
              <Stack 
                direction="row" 
                spacing={ds.spacing['2']} 
                flexWrap="wrap"
                useFlexGap
                sx={{
                  p: ds.spacing['3'],
                  backgroundColor: alpha(ds.colors.info.main, 0.03),
                  borderRadius: `${ds.borderRadius.lg}px`,
                  border: `1px dashed ${alpha(ds.colors.info.main, 0.2)}`,
                  minHeight: 60,
                  alignItems: 'center',
                }}
              >
                {params.stockLengths.map((length) => (
                  <Chip
                    key={length}
                    label={`${length} mm`}
                    icon={<RulerIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      height: 32,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      backgroundColor: ds.colors.info.main,
                      color: 'white',
                      '& .MuiChip-icon': {
                        color: 'rgba(255, 255, 255, 0.8)',
                      }
                    }}
                  />
                ))}
              </Stack>

              {/* Info */}
              <Alert 
                severity="info" 
                icon={<InfoIcon />}
                sx={{ 
                  mt: ds.spacing['3'],
                  borderRadius: `${ds.borderRadius.md}px`,
                  fontSize: '0.8125rem',
                  backgroundColor: alpha(ds.colors.info.main, 0.05),
                  border: `1px solid ${alpha(ds.colors.info.main, 0.15)}`,
                }}
              >
                Stok boy uzunluklarını değiştirmek için iş emri seçim adımına geri dönün ve yeniden seçim yapın.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Advanced Parameters */}
        <Grid item xs={12}>
          <Accordion
            sx={{ 
              border: `2px solid ${alpha(ds.colors.warning.main, 0.08)}`,
              borderRadius: `${ds.borderRadius.xl}px !important`,
              boxShadow: ds.shadows.soft.sm,
              background: `linear-gradient(135deg, ${alpha(ds.colors.warning.main, 0.02)} 0%, ${alpha(ds.colors.neutral[50], 0.5)} 100%)`,
              '&:before': {
                display: 'none',
              },
              '&.Mui-expanded': {
                margin: 0,
                boxShadow: ds.shadows.soft.lg,
                borderColor: alpha(ds.colors.warning.main, 0.15),
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ fontSize: 24, color: ds.colors.warning.main }} />}
            sx={{ 
                px: ds.spacing['6'],
                py: ds.spacing['6'],
                '& .MuiAccordionSummary-content': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: ds.spacing['3'],
                }
              }}
            >
              <Box sx={{
                p: ds.spacing['3'],
                borderRadius: `${ds.borderRadius.xl}px`,
                background: alpha(ds.colors.warning.main, 0.08),
                border: `1px solid ${alpha(ds.colors.warning.main, 0.15)}`,
              }}>
                <RulerIcon sx={{ fontSize: 28, color: ds.colors.warning.main }} />
              </Box>
              <Box>
                <Typography sx={{
                  fontSize: '1.25rem',
                  fontWeight: ds.typography.fontWeight.bold,
                  color: ds.colors.text.primary,
                  letterSpacing: ds.typography.letterSpacing.tight,
                }}>
                  Gelişmiş Parametreler
                </Typography>
                <Typography sx={{
                  fontSize: '0.9375rem',
                  color: ds.colors.text.secondary,
                  fontWeight: ds.typography.fontWeight.medium,
                }}>
                  Kesim toleransları ve güvenlik ayarları
                </Typography>
              </Box>
              <Chip
                label="Opsiyonel"
                size="small"
                sx={{
                  height: 28,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: alpha(ds.colors.warning.main, 0.08),
                  color: ds.colors.warning.main,
                  border: `1px solid ${alpha(ds.colors.warning.main, 0.2)}`,
                  borderRadius: `${ds.borderRadius.md}px`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  ml: 'auto',
                }}
              />
            </AccordionSummary>
            <AccordionDetails sx={{ px: ds.spacing['6'], pb: ds.spacing['6'] }}>
              <Grid container spacing={ds.spacing['4']}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: ds.spacing['3'] }}>
                    <TextField
                      fullWidth
                      label="Kesim Genişliği (Kerf)"
                      type="number"
                      value={params.constraints?.kerfWidth || 0}
                      onChange={(e) => onParamsChange({
                        ...params,
                        constraints: {
                          ...params.constraints,
                          kerfWidth: Number(e.target.value)
                        }
                      })}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">mm</InputAdornment>
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: `${ds.borderRadius.xl}px`,
                          fontSize: '0.9375rem',
                          height: 56,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                        }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: ds.spacing['3'] }}>
                    <TextField
                      fullWidth
                      label="Güvenlik Mesafesi (Başlangıç)"
                      type="number"
                      value={params.constraints?.startSafety || 0}
                      onChange={(e) => onParamsChange({
                        ...params,
                        constraints: {
                          ...params.constraints,
                          startSafety: Number(e.target.value)
                        }
                      })}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">mm</InputAdornment>
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: `${ds.borderRadius.xl}px`,
                          fontSize: '0.9375rem',
                          height: 56,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                        }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: ds.spacing['3'] }}>
                    <TextField
                      fullWidth
                      label="Güvenlik Mesafesi (Bitiş)"
                      type="number"
                      value={params.constraints?.endSafety || 0}
                      onChange={(e) => onParamsChange({
                        ...params,
                        constraints: {
                          ...params.constraints,
                          endSafety: Number(e.target.value)
                        }
                      })}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">mm</InputAdornment>
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: `${ds.borderRadius.xl}px`,
                          fontSize: '0.9375rem',
                          height: 56,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                        }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: ds.spacing['3'] }}>
                    <TextField
                      fullWidth
                      label="Minimum Artık Uzunluk"
                      type="number"
                      value={params.constraints?.minScrapLength || 0}
                      onChange={(e) => onParamsChange({
                        ...params,
                        constraints: {
                          ...params.constraints,
                          minScrapLength: Number(e.target.value)
                        }
                      })}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">mm</InputAdornment>
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: `${ds.borderRadius.xl}px`,
                          fontSize: '0.9375rem',
                          height: 56,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
        </Box>
  );
};

export default ParametersStep;

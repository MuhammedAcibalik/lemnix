/**
 * @fileoverview Preview Panel Component - Design System v2.0
 * @module PreviewPanel
 * @version 2.0.0
 * 
 * Tab 3: Summary Review & Confirmation before Optimization
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  PlayCircle as PlayCircleIcon,
  Edit as EditIcon,
  ListAlt as ListIcon,
  Psychology as AlgorithmIcon,
  Flag as FlagIcon,
  Straighten as RulerIcon,
} from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import type { PreviewStepProps, CuttingListSection } from '../types';

/**
 * PreviewPanel Component
 * Shows comprehensive summary and confirmation
 */
export const PreviewStep: React.FC<PreviewStepProps> = ({
  cuttingList,
  params,
  onOptimize,
  onEditList,
  onEditParams,
  loading,
}) => {
  const ds = useDesignSystem();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirmAndOptimize = () => {
    setIsConfirmed(true);
    onOptimize();
  };

  // Calculate metrics
  const totalItems = cuttingList?.sections?.reduce((total, section: CuttingListSection) => 
    total + (section.items?.length || 0), 0) || 0;
  const totalProfiles = cuttingList?.sections?.reduce((total, section: CuttingListSection) => 
    total + section.items?.reduce((sum, item) => sum + (item.profiles?.length || 0), 0), 0) || 0;

  return (
    <Box sx={{ 
      p: ds.spacing['4'],
      height: '100%',
    }}>
      {/* Panel Title */}
      <Box sx={{ mb: ds.spacing['4'] }}>
        <Typography sx={{
          fontSize: '1.125rem',
          fontWeight: ds.typography.fontWeight.semibold,
          color: ds.colors.text.primary,
          mb: ds.spacing['1'],
        }}>
          Özet Kontrolü ve Onay
        </Typography>
        <Typography sx={{ 
          fontSize: '0.875rem',
          color: ds.colors.text.secondary,
          fontWeight: ds.typography.fontWeight.normal,
        }}>
          Optimizasyon başlamadan önce tüm ayarları gözden geçirin
        </Typography>
      </Box>

      <Grid container spacing={ds.spacing['4']}>
        {/* Summary Cards */}
        <Grid item xs={12} md={8}>
          <Stack spacing={ds.spacing['3']}>
            {/* Cutting List Summary */}
            <Card sx={{
              border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
              borderRadius: `${ds.borderRadius.lg}px`,
              boxShadow: ds.shadows.soft.sm,
            }}>
              <CardContent sx={{ p: ds.spacing['3'] }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: ds.spacing['3'] }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['2'] }}>
                    <ListIcon sx={{ fontSize: 20, color: ds.colors.primary.main }} />
                    <Typography sx={{
                      fontSize: '1rem',
                      fontWeight: ds.typography.fontWeight.semibold,
                      color: ds.colors.text.primary,
                    }}>
                      Kesim Listesi
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={onEditList}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: ds.typography.fontWeight.medium,
                      color: ds.colors.primary.main,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: alpha(ds.colors.primary.main, 0.08),
                      }
                    }}
                  >
                    Düzenle
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: ds.spacing['2'] }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary, mb: '4px' }}>
                      Liste Adı
                    </Typography>
                    <Typography sx={{ 
                      fontSize: '0.9375rem', 
                      fontWeight: ds.typography.fontWeight.medium,
                      color: ds.colors.text.primary,
                    }}>
                      {cuttingList?.title || cuttingList?.name || 'Seçilmedi'}
                    </Typography>
                  </Box>

                  <Divider sx={{ borderColor: alpha(ds.colors.neutral[200], 0.5) }} />

                  <Stack direction="row" spacing={ds.spacing['2']}>
                    <Chip
                      label={`${totalItems} İş Emri`}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        fontWeight: ds.typography.fontWeight.medium,
                        backgroundColor: alpha(ds.colors.primary.main, 0.1),
                        color: ds.colors.primary.main,
                      }}
                    />
                    <Chip
                      label={`${totalProfiles} Profil`}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        fontWeight: ds.typography.fontWeight.medium,
                        backgroundColor: alpha(ds.colors.secondary.main, 0.1),
                        color: ds.colors.secondary.main,
                      }}
                    />
                    {cuttingList?.weekNumber && (
                      <Chip
                        label={`Hafta ${cuttingList.weekNumber}`}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: ds.typography.fontWeight.medium,
                          backgroundColor: alpha(ds.colors.neutral[400], 0.1),
                          color: ds.colors.text.secondary,
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            {/* Parameters Summary */}
            <Card sx={{
              border: `1px solid ${alpha(ds.colors.secondary.main, 0.2)}`,
              borderRadius: `${ds.borderRadius.lg}px`,
              boxShadow: ds.shadows.soft.sm,
            }}>
              <CardContent sx={{ p: ds.spacing['3'] }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: ds.spacing['3'] }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['2'] }}>
                    <AlgorithmIcon sx={{ fontSize: 20, color: ds.colors.secondary.main }} />
                    <Typography sx={{
                      fontSize: '1rem',
                      fontWeight: ds.typography.fontWeight.semibold,
                      color: ds.colors.text.primary,
                    }}>
                      Optimizasyon Ayarları
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={onEditParams}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: ds.typography.fontWeight.medium,
                      color: ds.colors.secondary.main,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: alpha(ds.colors.secondary.main, 0.08),
                      }
                    }}
                  >
                    Düzenle
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: ds.spacing['2'] }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary, mb: '4px' }}>
                      Algoritma
                    </Typography>
                    <Chip
                      label={
                        params.algorithm === 'ffd' ? '⚡ First Fit Decreasing' :
                        params.algorithm === 'bfd' ? '🎯 Best Fit Decreasing' :
                        params.algorithm === 'genetic' ? '🧬 Genetic Algorithm v1.7.1' :
                        '📊 Profile Pooling'
                      }
                      sx={{
                        height: 28,
                        fontSize: '0.8125rem',
                        fontWeight: ds.typography.fontWeight.semibold,
                        backgroundColor: alpha(ds.colors.secondary.main, 0.12),
                        color: ds.colors.secondary.main,
                      }}
                    />
                  </Box>

                  <Divider sx={{ borderColor: alpha(ds.colors.neutral[200], 0.5) }} />

                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary, mb: ds.spacing['1'] }}>
                      Optimizasyon Hedefleri
                    </Typography>
                    <Stack direction="row" spacing={ds.spacing['1']} flexWrap="wrap" useFlexGap>
                      {params.objectives && params.objectives.length > 0 ? (
                        params.objectives.map((obj, idx) => (
                          <Chip
                            key={idx}
                            label={
                              obj.type === 'minimize-waste' ? 'Atık Minimizasyonu' :
                              obj.type === 'maximize-efficiency' ? 'Verimlilik Maksimizasyonu' :
                              obj.type === 'minimize-cost' ? 'Maliyet Minimizasyonu' :
                              obj.type === 'minimize-time' ? 'Zaman Minimizasyonu' :
                              obj.type
                            }
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.75rem',
                              fontWeight: ds.typography.fontWeight.medium,
                              backgroundColor: alpha(ds.colors.success.main, 0.1),
                              color: ds.colors.success.main,
                            }}
                          />
                        ))
                      ) : (
                        <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.disabled, fontStyle: 'italic' }}>
                          Hedef seçilmedi
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Action Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{
            position: 'sticky',
            top: ds.spacing['4'],
            border: `1px solid ${alpha(ds.colors.success.main, 0.2)}`,
            borderRadius: `${ds.borderRadius.lg}px`,
            background: alpha(ds.colors.success.main, 0.02),
            boxShadow: ds.shadows.soft.md,
          }}>
            <CardContent sx={{ p: ds.spacing['3'] }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['2'], mb: ds.spacing['3'] }}>
                <FlagIcon sx={{ fontSize: 20, color: ds.colors.success.main }} />
                <Typography sx={{
                  fontSize: '1rem',
                  fontWeight: ds.typography.fontWeight.semibold,
                  color: ds.colors.text.primary,
                }}>
                  Hazır
                </Typography>
              </Box>

              <Typography sx={{
                fontSize: '0.875rem',
                color: ds.colors.text.secondary,
                mb: ds.spacing['4'],
                lineHeight: 1.6,
              }}>
                Tüm ayarlar kontrol edildi. Optimizasyon işlemini başlatabilirsiniz.
              </Typography>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <PlayCircleIcon />}
                onClick={handleConfirmAndOptimize}
                disabled={loading || !cuttingList}
                sx={{
                  height: 48,
                  background: ds.gradients.primary,
                  color: 'white',
                  fontWeight: ds.typography.fontWeight.semibold,
                  fontSize: '0.9375rem',
                  borderRadius: `${ds.borderRadius.md}px`,
                  textTransform: 'none',
                  letterSpacing: ds.typography.letterSpacing.tight,
                  boxShadow: ds.shadows.soft.md,
                  transition: ds.transitions.base,
                  '&:hover': {
                    background: ds.gradients.primary,
                    opacity: 0.95,
                    transform: 'translateY(-2px)',
                    boxShadow: ds.shadows.soft.xl,
                  },
                  '&:active': {
                    transform: 'translateY(-1px)',
                    boxShadow: ds.shadows.soft.lg,
                  },
                  '&:disabled': {
                    background: ds.colors.neutral[200],
                    color: ds.colors.neutral[500],
                    transform: 'none',
                    boxShadow: 'none',
                  }
                }}
              >
                {loading ? 'Optimize Ediliyor...' : 'Optimizasyonu Başlat'}
              </Button>

              {loading && (
                <Box sx={{ 
                  mt: ds.spacing['3'],
                  p: ds.spacing['2'],
                  background: alpha(ds.colors.primary.main, 0.05),
                  borderRadius: `${ds.borderRadius.md}px`,
                  border: `1px solid ${alpha(ds.colors.primary.main, 0.1)}`,
                }}>
                  <Typography sx={{
                    fontSize: '0.75rem',
                    color: ds.colors.text.secondary,
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}>
                    Lütfen bekleyin, işlem devam ediyor...
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

export default PreviewStep;

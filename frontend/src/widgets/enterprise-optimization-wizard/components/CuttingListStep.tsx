/**
 * @fileoverview Cutting List Panel Component - Design System v2.0
 * @module CuttingListPanel
 * @version 2.0.0
 * 
 * Tab 1: Cutting List Selection and Management
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  alpha,
  Chip,
} from '@mui/material';
import {
  ListAlt as ListIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import { CuttingListStepProps, CuttingListData, CuttingListSection } from '../types';

/**
 * CuttingListPanel Component (formerly CuttingListStep)
 * Modern tab-based panel with Design System v2.0 + Delete with 5s Undo
 */
export const CuttingListStep: React.FC<CuttingListStepProps> = ({
  cuttingLists = [],
  selectedCuttingList,
  onCuttingListSelect,
}) => {
  const ds = useDesignSystem();
  
  
  // ❌ REMOVED: Delete functionality disabled - cutting lists should not be deleted

  return (
    <Box sx={{ 
      p: ds.spacing['4'],
      height: '100%',
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: ds.spacing['3'],
      }}>
        {/* Section Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['2'] }}>
          <ListIcon sx={{ fontSize: 20, color: ds.colors.primary.main }} />
          <Typography sx={{
            fontSize: '1rem',
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
          }}>
            Mevcut Kesim Listeleri
          </Typography>
          <Chip 
            label={cuttingLists.length} 
            size="small"
            sx={{
              height: 20,
              fontSize: '0.6875rem',
              fontWeight: ds.typography.fontWeight.semibold,
              backgroundColor: alpha(ds.colors.primary.main, 0.1),
              color: ds.colors.primary.main,
            }}
          />
        </Box>
          
        {cuttingLists.length > 0 ? (
          <Grid container spacing={ds.spacing['3']}>
            {cuttingLists.map((list: CuttingListData) => {
              const isSelected = selectedCuttingList?.id === list.id;
              const itemCount = list.sections?.reduce((total, section: CuttingListSection) => 
                total + (section.items?.length || 0), 0) || 0;
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={list.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative', // For delete button positioning
                      border: `2px solid ${isSelected ? ds.colors.primary.main : alpha(ds.colors.neutral[300], 0.5)}`,
                      borderRadius: `${ds.borderRadius.lg}px`,
                      boxShadow: isSelected ? ds.shadows.soft.md : ds.shadows.soft.sm,
                      transition: ds.transitions.fast,
                      background: isSelected ? alpha(ds.colors.primary.main, 0.02) : ds.colors.background.paper,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: ds.shadows.soft.xl,
                        borderColor: ds.colors.primary.main,
                      }
                    }}
                    onClick={() => onCuttingListSelect(list)}
                  >
                    <CardContent sx={{ 
                      p: ds.spacing['3'], 
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                    }}>
                      {isSelected && (
                        <CheckIcon sx={{ 
                          fontSize: 40, 
                          color: ds.colors.success.main,
                          mb: ds.spacing['2'],
                        }} />
                      )}
                      <Typography sx={{ 
                        fontWeight: ds.typography.fontWeight.bold,
                        color: ds.colors.text.primary,
                        fontSize: '1rem',
                        mb: ds.spacing['1'],
                      }}>
                        {list.title || list.name}
                      </Typography>
                      <Typography sx={{ 
                        color: ds.colors.text.secondary,
                        fontSize: '0.875rem',
                        fontWeight: ds.typography.fontWeight.normal,
                        mb: ds.spacing['1'],
                      }}>
                        {itemCount} öğe
                      </Typography>
                      {list.weekNumber && (
                        <Chip 
                          label={`Hafta ${list.weekNumber}`}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            backgroundColor: alpha(ds.colors.primary.main, 0.1),
                            color: ds.colors.primary.main,
                          }}
                        />
                      )}
                      
                      {/* ❌ REMOVED: Delete button disabled - cutting lists should not be deleted */}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Card sx={{
            border: `1px solid ${alpha(ds.colors.warning.main, 0.2)}`,
            borderRadius: `${ds.borderRadius.lg}px`,
            background: alpha(ds.colors.warning.main, 0.02),
            boxShadow: ds.shadows.soft.sm,
          }}>
            <CardContent sx={{ p: ds.spacing['6'] }}>
              <Box sx={{ 
                textAlign: 'center',
              }}>
                <ListIcon sx={{ 
                  fontSize: 64, 
                  color: ds.colors.warning.main,
                  mb: ds.spacing['3'],
                  opacity: 0.8,
                }} />
                <Typography sx={{
                  fontSize: '1.125rem',
                  fontWeight: ds.typography.fontWeight.semibold,
                  color: ds.colors.text.primary,
                  mb: ds.spacing['1'],
                }}>
                  Henüz Kesim Listesi Yok
                </Typography>
                <Typography sx={{
                  fontSize: '0.875rem',
                  color: ds.colors.text.secondary,
                  mb: ds.spacing['4'],
                  maxWidth: 400,
                  mx: 'auto',
                }}>
                  Optimizasyon yapabilmek için önce bir kesim listesi oluşturmanız gerekiyor
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => window.location.href = '/cutting-list'}
                  sx={{
                    height: 44,
                    px: ds.spacing['4'],
                    background: ds.gradients.primary,
                    color: 'white',
                    fontWeight: ds.typography.fontWeight.semibold,
                    fontSize: '0.9375rem',
                    borderRadius: `${ds.borderRadius.md}px`,
                    textTransform: 'none',
                    boxShadow: ds.shadows.soft.md,
                    transition: ds.transitions.fast,
                    '&:hover': {
                      background: ds.gradients.primary,
                      opacity: 0.9,
                      transform: 'translateY(-2px)',
                      boxShadow: ds.shadows.soft.lg,
                    }
                  }}
                >
                  Kesim Listesi Yönetimine Git
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
      
      {/* ❌ REMOVED: Undo Snackbar removed - cutting lists should not be deleted */}
      </Box>
  );
};

export default CuttingListStep;

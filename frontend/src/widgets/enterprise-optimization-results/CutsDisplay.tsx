/**
 * @fileoverview Cuts Display Component for Enterprise Optimization Results
 * @module CutsDisplay
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Cut } from './types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
  Engineering as EngineeringIcon,
  ContentCut as CutIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { OptimizationResult } from './types';

// Modern utility functions with proper typing
const formatNumber = (num: number): string => 
  Number.isFinite(num) ? num.toLocaleString('tr-TR') : '—';

const formatPercentage = (num: number): string => 
  Number.isFinite(num) ? `${num.toFixed(1)}%` : '—%';

interface CutsDisplayProps {
  result: OptimizationResult;
}

export const CutsDisplay: React.FC<CutsDisplayProps> = ({ result }) => {
  const theme = useTheme();
  const [expandedCuts, setExpandedCuts] = useState<Set<string>>(new Set());
  const [showCuttingPlanModal, setShowCuttingPlanModal] = useState<{ open: boolean; stock: Cut | null }>({
    open: false,
    stock: null
  });

  const toggleCutExpansion = (cutId: string): void => {
    // Modern functional approach with Set operations
    setExpandedCuts(prev => {
      const newExpanded = new Set(prev);
      // Modern conditional with logical operators
      newExpanded.has(cutId) ? newExpanded.delete(cutId) : newExpanded.add(cutId);
      return newExpanded;
    });
  };

  const getEfficiencyColor = (efficiency: number): string => {
    // Modern pattern matching with array.find()
    const efficiencyMap = [
      { threshold: 90, color: theme.palette.success.main },
      { threshold: 80, color: theme.palette.warning.main },
      { threshold: 0, color: theme.palette.error.main }
    ];
    
    return efficiencyMap.find(({ threshold }) => efficiency >= threshold)?.color || theme.palette.error.main;
  };

  const getWasteColor = (waste: number): string => {
    // Modern pattern matching with array.find()
    const wasteMap = [
      { threshold: 100, color: theme.palette.success.main },
      { threshold: 300, color: theme.palette.warning.main },
      { threshold: Infinity, color: theme.palette.error.main }
    ];
    
    return wasteMap.find(({ threshold }) => waste <= threshold)?.color || theme.palette.error.main;
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: theme.palette.primary.main }}>
        📏 Kesim Detayları ({result.cuts.length} Stok)
      </Typography>
      
      <Grid container spacing={3}>
        {result.cuts.map((cut, index) => {
          const efficiency = (cut.usedLength / cut.stockLength) * 100;
          const waste = cut.remainingLength;
          const isExpanded = expandedCuts.has(cut.id || `cut-${index}`);
          
          return (
            <Grid item xs={12} key={cut.id || `cut-${index}`}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }
                }}
              >
                <CardContent>
                  {/* Header */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          width: 48,
                          height: 48
                        }}
                      >
                        <EngineeringIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          Stok #{index + 1} - {formatNumber(cut.stockLength)}mm
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {cut.segments?.length || 0} parça • {cut.workOrderId || 'Genel'}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        label={`${formatPercentage(efficiency)} Verimlilik`}
                        size="small"
                        sx={{
                          bgcolor: alpha(getEfficiencyColor(efficiency), 0.1),
                          color: getEfficiencyColor(efficiency),
                          fontWeight: 600
                        }}
                      />
                      <Chip
                        label={`${formatNumber(waste)}mm Fire`}
                        size="small"
                        sx={{
                          bgcolor: alpha(getWasteColor(waste), 0.1),
                          color: getWasteColor(waste),
                          fontWeight: 600
                        }}
                      />
                      <IconButton
                        onClick={() => toggleCutExpansion(cut.id || `cut-${index}`)}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2)
                          }
                        }}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Stack>
                  </Stack>

                  {/* Summary Stats */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {formatNumber(cut.usedLength)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Kullanılan (mm)
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" color="warning.main">
                          {formatNumber(waste)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Fire (mm)
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {cut.segments?.length || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Parça Sayısı
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" color="info.main">
                          {formatPercentage(efficiency)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Verimlilik
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Expandable Details */}
                  <Collapse in={isExpanded}>
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Segments List */}
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                      Kesim Parçaları:
                    </Typography>
                    
                    <List dense>
                      {(cut.segments || []).map((segment, segmentIndex) => (
                        <ListItem
                          key={segment.id || `segment-${segmentIndex}`}
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                            borderRadius: 2,
                            mb: 1,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                          }}
                        >
                          <ListItemIcon>
                            <Badge
                              badgeContent={segment.quantity}
                              color="primary"
                              sx={{
                                '& .MuiBadge-badge': {
                                  bgcolor: theme.palette.primary.main,
                                  color: 'white',
                                  fontWeight: 'bold'
                                }
                              }}
                            >
                              <CutIcon color="primary" />
                            </Badge>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight="bold">
                                {formatNumber(segment.length)}mm • {segment.profileType}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                İş Emri: {segment.workOrderId || 'Genel'} • 
                                ID: {segment.workOrderItemId || segment.id}
                              </Typography>
                            }
                          />
                          {segment.quantity > 1 && (
                            <Chip
                              label={`${segment.quantity} adet`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

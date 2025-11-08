/**
 * ObjectivesSection - Multi-objective configuration
 * Integrates with EnterpriseOptimizationForm
 * 
 * @module EnterpriseOptimizationForm/components
 * @version 2.0.0 - GA v1.7.1 Support
 */

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Slider,
  Box,
  Alert,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Chip,
  LinearProgress,
  IconButton,
  Button,
  InputLabel,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  RecyclingOutlined as WasteIcon,
  Speed as EfficiencyIcon,
  AttachMoney as CostIcon,
  Timer as TimeIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { 
  OptimizationObjective, 
  ObjectiveType, 
  ObjectivePriority 
} from '@/entities/optimization';

interface ObjectivesSectionProps {
  readonly objectives: ReadonlyArray<OptimizationObjective>;
  readonly onChange: (objectives: ReadonlyArray<OptimizationObjective>) => void;
  readonly readonly?: boolean;
}

const OBJECTIVE_INFO: Record<ObjectiveType, { 
  label: string; 
  description: string; 
  icon: React.ReactElement;
  color: string;
}> = {
  'minimize-waste': {
    label: 'Atık Minimizasyonu',
    description: 'Fire oranını minimize et',
    icon: <WasteIcon />,
    color: '#f44336',
  },
  'maximize-efficiency': {
    label: 'Verimlilik Maksimizasyonu',
    description: 'Malzeme kullanımını optimize et',
    icon: <EfficiencyIcon />,
    color: '#4caf50',
  },
  'minimize-cost': {
    label: 'Maliyet Minimizasyonu',
    description: 'Toplam maliyeti düşür',
    icon: <CostIcon />,
    color: '#ff9800',
  },
  'minimize-time': {
    label: 'Süre Minimizasyonu',
    description: 'İşlem süresini kısalt',
    icon: <TimeIcon />,
    color: '#2196f3',
  },
  'maximize-quality': {
    label: 'Kalite Maksimizasyonu',
    description: 'Kesim kalitesini artır',
    icon: <EfficiencyIcon />,
    color: '#9c27b0',
  },
};

export function ObjectivesSection({ 
  objectives, 
  onChange,
  readonly = false,
}: ObjectivesSectionProps) {
  // Calculate normalized weights for display
  const totalWeight = useMemo(
    () => objectives.reduce((sum, obj) => sum + obj.weight, 0),
    [objectives]
  );

  const normalizedWeights = useMemo(
    () => objectives.map((obj) => ({
      ...obj,
      normalizedWeight: totalWeight > 0 ? obj.weight / totalWeight : 0,
    })),
    [objectives, totalWeight]
  );

  const updateObjective = (index: number, updates: Partial<OptimizationObjective>) => {
    if (readonly) return;
    
    const newObjectives = [...objectives];
    newObjectives[index] = { ...newObjectives[index]!, ...updates };
    onChange(newObjectives);
  };

  // ✅ P1-5: Add objective
  const addObjective = () => {
    if (readonly) return;
    
    // Find first unused objective type
    const usedTypes = new Set(objectives.map((o) => o.type));
    const availableType = Object.keys(OBJECTIVE_INFO).find(
      (type) => !usedTypes.has(type as ObjectiveType)
    ) as ObjectiveType | undefined;

    if (!availableType) return; // All 5 types used

    const newObjective: OptimizationObjective = {
      type: availableType,
      weight: 0.1,
      priority: 'medium',
    };

    onChange([...objectives, newObjective]);
  };

  // ✅ P1-5: Remove objective
  const removeObjective = (index: number) => {
    if (readonly || objectives.length <= 1) return; // Keep at least one
    
    const newObjectives = objectives.filter((_, i) => i !== index);
    onChange(newObjectives);
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🎯 Optimizasyon Hedefleri
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ağırlıklar otomatik normalize edilecek (toplam = 1.0)
        </Typography>

        {Math.abs(totalWeight - 1.0) > 0.01 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Toplam ağırlık: <strong>{totalWeight.toFixed(2)}</strong> → Backend otomatik normalize edecek
          </Alert>
        )}

        <Stack spacing={3}>
          {normalizedWeights.map((obj, index) => {
            const info = OBJECTIVE_INFO[obj.type];
            
            return (
              <Box key={`${obj.type}-${index}`}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box display="flex" alignItems="center" gap={1} sx={{ flex: 1 }}>
                    {React.cloneElement(info.icon, { 
                      sx: { color: info.color, fontSize: 24 } 
                    })}
                    
                    {/* ✅ P1-5: Type Selector */}
                    {!readonly ? (
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                          value={obj.type}
                          onChange={(e) => updateObjective(index, { type: e.target.value as ObjectiveType })}
                          sx={{ fontSize: '0.875rem', fontWeight: 600 }}
                        >
                          {Object.entries(OBJECTIVE_INFO).map(([type, typeInfo]) => (
                            <MenuItem key={type} value={type}>
                              <Box display="flex" alignItems="center" gap={1}>
                                {React.cloneElement(typeInfo.icon, { sx: { fontSize: 18, color: typeInfo.color } })}
                                <Typography sx={{ fontSize: '0.875rem' }}>
                                  {typeInfo.label}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {info.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {info.description}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={`${(obj.normalizedWeight * 100).toFixed(1)}%`}
                      color="primary"
                      size="small"
                      sx={{ minWidth: 65, fontWeight: 600 }}
                    />
                    
                    {/* ✅ P1-5: Delete Button */}
                    {!readonly && objectives.length > 1 && (
                      <Tooltip title="Kaldır" arrow>
                        <IconButton
                          onClick={() => removeObjective(index)}
                          size="small"
                          sx={{
                            color: '#f44336',
                            '&:hover': {
                              background: alpha('#f44336', 0.1),
                            },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Box>

                {/* Weight Slider */}
                <Box display="flex" gap={2} alignItems="center">
                  <Box flex={1}>
                    <Slider
                      value={obj.weight}
                      onChange={(_, val) => updateObjective(index, { weight: val as number })}
                      min={0}
                      max={10}
                      step={0.5}
                      marks={[
                        { value: 0, label: '0' },
                        { value: 5, label: '5' },
                        { value: 10, label: '10' },
                      ]}
                      valueLabelDisplay="auto"
                      disabled={readonly}
                      sx={{
                        color: info.color,
                        '& .MuiSlider-thumb': {
                          borderColor: info.color,
                        },
                        '& .MuiSlider-track': {
                          background: info.color,
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Ağırlık: {obj.weight.toFixed(1)}
                    </Typography>
                  </Box>

                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select
                      value={obj.priority}
                      onChange={(e) => updateObjective(index, { 
                        priority: e.target.value as ObjectivePriority 
                      })}
                      disabled={readonly}
                    >
                      <MenuItem value="low">Düşük</MenuItem>
                      <MenuItem value="medium">Orta</MenuItem>
                      <MenuItem value="high">Yüksek</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Visual Weight Distribution */}
                <Box mt={1}>
                  <LinearProgress
                    variant="determinate"
                    value={obj.normalizedWeight * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: info.color,
                      },
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>

        {/* ✅ P1-5: Add Objective Button */}
        {!readonly && objectives.length < 5 && (
          <Button
            startIcon={<AddIcon />}
            onClick={addObjective}
            variant="outlined"
            fullWidth
            sx={{
              mt: 2,
              textTransform: 'none',
              borderStyle: 'dashed',
              py: 1.5,
            }}
          >
            Hedef Ekle ({objectives.length}/5)
          </Button>
        )}

        {/* Summary */}
        <Alert severity="success" sx={{ mt: 3 }} icon="✅">
          <Typography variant="caption">
            <strong>Toplam ağırlık:</strong> {totalWeight.toFixed(2)} → 
            Backend tarafından normalize edilecek (∑ = 1.0)
          </Typography>
        </Alert>

        {/* Help Text */}
        <Box mt={2} p={1.5} bgcolor="action.hover" borderRadius={1}>
          <Typography variant="caption" color="text.secondary">
            💡 <strong>İpucu:</strong> Ağırlıklar optimize edilecek özelliklerin önem derecesini belirtir.
            Yüksek ağırlık = o metrikte daha iyi sonuç. Backend otomatik normalize eder.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}


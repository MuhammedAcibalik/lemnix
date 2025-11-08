/**
 * AlgorithmSection - Algorithm selection with GA tuning
 * Integrates with EnterpriseOptimizationForm
 * 
 * @module EnterpriseOptimizationForm/components
 * @version 2.0.0 - GA v1.7.1 Support
 */

import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
  Tooltip,
  Alert,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { AlgorithmSelector } from '@/features/algorithm-selection';
import { 
  type AlgorithmType, 
  type PerformanceSettings,
} from '@/entities/optimization';
import { ALGORITHM_CATALOG } from '@/entities/optimization/model/types';

interface AlgorithmSectionProps {
  readonly algorithm: AlgorithmType;
  readonly onAlgorithmChange: (algorithm: AlgorithmType) => void;
  readonly itemCount: number;
  readonly performanceSettings?: PerformanceSettings | undefined;
  readonly onPerformanceSettingsChange?: (settings: PerformanceSettings) => void;
}

export function AlgorithmSection({
  algorithm,
  onAlgorithmChange,
  itemCount,
  performanceSettings,
  onPerformanceSettingsChange,
}: AlgorithmSectionProps) {
  const selectedAlgorithm = ALGORITHM_CATALOG[algorithm];
  const showGASettings = algorithm === 'genetic' && onPerformanceSettingsChange;

  // Adaptive defaults based on item count
  const adaptiveDefaults = useMemo(() => {
    if (itemCount < 10) return { populationSize: 10, generations: 20 };
    if (itemCount < 30) return { populationSize: 20, generations: 50 };
    if (itemCount < 100) return { populationSize: 30, generations: 75 };
    return { populationSize: 50, generations: 100 };
  }, [itemCount]);

  const currentSettings = useMemo(
    () => ({
      populationSize: performanceSettings?.populationSize ?? adaptiveDefaults.populationSize,
      generations: performanceSettings?.generations ?? adaptiveDefaults.generations,
      maxExecutionTime: performanceSettings?.maxExecutionTime ?? 60,
      mutationRate: performanceSettings?.mutationRate ?? 0.15,
      crossoverRate: performanceSettings?.crossoverRate ?? 0.8,
      parallelProcessing: performanceSettings?.parallelProcessing ?? false,
      cacheResults: performanceSettings?.cacheResults ?? true,
    }),
    [performanceSettings, adaptiveDefaults]
  );

  const handleSettingChange = (
    field: keyof PerformanceSettings,
    value: number | boolean
  ) => {
    if (!onPerformanceSettingsChange) return;
    
    onPerformanceSettingsChange({
      ...performanceSettings,
      [field]: value,
    });
  };

  return (
    <Box>
      {/* Algorithm Selector */}
      <AlgorithmSelector
        value={algorithm}
        itemCount={itemCount}
        onChange={onAlgorithmChange}
        showRecommendation={true}
      />

      {/* GA Performance Tuning Panel */}
      {showGASettings && (
        <Card elevation={2} sx={{ mt: 2 }}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <SettingsIcon color="primary" />
                <Typography variant="h6">
                  ⚙️ Gelişmiş Ayarlar (GA v1.7.1)
                </Typography>
                <Chip 
                  label="İsteğe Bağlı" 
                  size="small" 
                  color="info" 
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>
            
            <AccordionDetails>
              <Alert severity="info" sx={{ mb: 3 }}>
                Bu ayarlar otomatik olarak optimize edilmiştir. Değiştirmeniz önerilmez.
              </Alert>

              <Stack spacing={3}>
                {/* Population Size */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Popülasyon Boyutu
                    </Typography>
                    <Tooltip 
                      title="Daha büyük popülasyon = daha iyi sonuç ama daha yavaş. Backend adaptif olarak ayarlar."
                      arrow
                    >
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                    <Chip 
                      label={`Öneri: ${adaptiveDefaults.populationSize}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                  
                  <Slider
                    value={currentSettings.populationSize}
                    onChange={(_, val) => handleSettingChange('populationSize', val as number)}
                    min={10}
                    max={100}
                    step={5}
                    marks={[
                      { value: 10, label: '10' },
                      { value: adaptiveDefaults.populationSize, label: `${adaptiveDefaults.populationSize}` },
                      { value: 100, label: '100' },
                    ]}
                    valueLabelDisplay="auto"
                    disabled={!onPerformanceSettingsChange}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Mevcut: {currentSettings.populationSize} birey
                  </Typography>
                </Box>

                {/* Generations */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Jenerasyon Sayısı
                    </Typography>
                    <Tooltip 
                      title="Daha fazla jenerasyon = daha iyi konverjans. Erken durdurma ile otomatik optimize edilir."
                      arrow
                    >
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                    <Chip 
                      label={`Öneri: ${adaptiveDefaults.generations}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                  
                  <Slider
                    value={currentSettings.generations}
                    onChange={(_, val) => handleSettingChange('generations', val as number)}
                    min={10}
                    max={200}
                    step={10}
                    marks={[
                      { value: 10, label: '10' },
                      { value: adaptiveDefaults.generations, label: `${adaptiveDefaults.generations}` },
                      { value: 200, label: '200' },
                    ]}
                    valueLabelDisplay="auto"
                    disabled={!onPerformanceSettingsChange}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Mevcut: {currentSettings.generations} jenerasyon (erken durdurma aktif)
                  </Typography>
                </Box>

                {/* Max Execution Time */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Maksimum Süre (saniye)
                    </Typography>
                    <Tooltip 
                      title="Algoritma bu süreden sonra zorla durdurulur"
                      arrow
                    >
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                  </Box>
                  
                  <TextField
                    type="number"
                    value={currentSettings.maxExecutionTime}
                    onChange={(e) => handleSettingChange('maxExecutionTime', Number(e.target.value))}
                    inputProps={{ min: 10, max: 300, step: 10 }}
                    size="small"
                    fullWidth
                    disabled={!onPerformanceSettingsChange}
                    helperText="Önerilen: 60 saniye"
                  />
                </Box>

                {/* Advanced Settings Divider */}
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mt: 2 }}>
                  🔬 İleri Düzey Ayarlar
                </Typography>

                {/* Mutation Rate */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="caption">
                      Mutasyon Oranı
                    </Typography>
                    <Tooltip 
                      title="Yüksek mutasyon = daha fazla keşif, düşük mutasyon = daha fazla sömürü"
                      arrow
                    >
                      <InfoIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
                    </Tooltip>
                  </Box>
                  
                  <Slider
                    value={currentSettings.mutationRate}
                    onChange={(_, val) => handleSettingChange('mutationRate', val as number)}
                    min={0.01}
                    max={0.5}
                    step={0.01}
                    marks={[
                      { value: 0.01, label: '0.01' },
                      { value: 0.15, label: '0.15 (Öneri)' },
                      { value: 0.5, label: '0.5' },
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(val) => val.toFixed(2)}
                    size="small"
                    disabled={!onPerformanceSettingsChange}
                  />
                </Box>

                {/* Crossover Rate */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="caption">
                      Crossover Oranı
                    </Typography>
                    <Tooltip 
                      title="Yüksek crossover = daha fazla genetik karışım"
                      arrow
                    >
                      <InfoIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
                    </Tooltip>
                  </Box>
                  
                  <Slider
                    value={currentSettings.crossoverRate}
                    onChange={(_, val) => handleSettingChange('crossoverRate', val as number)}
                    min={0.5}
                    max={1.0}
                    step={0.05}
                    marks={[
                      { value: 0.5, label: '0.5' },
                      { value: 0.8, label: '0.8 (Öneri)' },
                      { value: 1.0, label: '1.0' },
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(val) => val.toFixed(2)}
                    size="small"
                    disabled={!onPerformanceSettingsChange}
                  />
                </Box>

                {/* Toggle Switches */}
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentSettings.parallelProcessing}
                        onChange={(e) => handleSettingChange('parallelProcessing', e.target.checked)}
                        disabled={!onPerformanceSettingsChange}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2">Paralel İşleme</Typography>
                        <Tooltip title="CPU yoğun, multi-core sistemlerde hızlandırır">
                          <InfoIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
                        </Tooltip>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentSettings.cacheResults}
                        onChange={(e) => handleSettingChange('cacheResults', e.target.checked)}
                        disabled={!onPerformanceSettingsChange}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2">Sonuçları Önbelleğe Al</Typography>
                        <Tooltip title="Aynı parametrelerle tekrar optimizasyon hızlandırır">
                          <InfoIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
                        </Tooltip>
                      </Box>
                    }
                  />
                </Stack>

                {/* Performance Estimate */}
                <Alert severity="success" icon="⚡">
                  <Typography variant="caption" fontWeight={600}>
                    Tahmini süre: ~{Math.ceil((currentSettings.populationSize * currentSettings.generations * itemCount) / 10000)} saniye
                  </Typography>
                </Alert>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Card>
      )}
    </Box>
  );
}


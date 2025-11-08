/**
 * @fileoverview GA Advanced Settings Component
 * @module EnterpriseOptimizationForm/components
 * @version 1.0.0
 * 
 * ✅ P1-7: GA v1.7.1 performance tuning UI
 * ✅ BACKEND: performanceSettings (populationSize, generations, mutationRate, crossoverRate)
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Slider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Alert,
  Chip,
  alpha,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Science as GeneticIcon,
  Refresh as ResetIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import type { PerformanceSettings } from '@/entities/optimization/model/types';

interface GAAdvancedSettingsProps {
  readonly settings: PerformanceSettings;
  readonly onChange: (settings: PerformanceSettings) => void;
  readonly readonly?: boolean;
}

const DEFAULT_GA_SETTINGS = {
  populationSize: undefined, // Adaptive (50-200)
  generations: undefined, // Adaptive (100-500)
  mutationRate: 0.15,
  crossoverRate: 0.8,
};

export const GAAdvancedSettings: React.FC<GAAdvancedSettingsProps> = ({
  settings,
  onChange,
  readonly = false,
}) => {
  const ds = useDesignSystem();
  const [showWarning, setShowWarning] = useState(false);

  const updateSetting = (key: keyof PerformanceSettings, value: number | undefined) => {
    onChange({ ...settings, [key]: value });

    // Show warning for extreme values
    if (
      (key === 'populationSize' && value && (value < 20 || value > 80)) ||
      (key === 'generations' && value && (value < 30 || value > 150)) ||
      (key === 'mutationRate' && value && (value < 0.05 || value > 0.3)) ||
      (key === 'crossoverRate' && value && (value < 0.6 || value > 0.95))
    ) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  const resetToDefaults = () => {
    onChange({
      ...settings,
      ...DEFAULT_GA_SETTINGS,
    });
    setShowWarning(false);
  };

  const isUsingDefaults =
    settings.populationSize === undefined &&
    settings.generations === undefined &&
    settings.mutationRate === DEFAULT_GA_SETTINGS.mutationRate &&
    settings.crossoverRate === DEFAULT_GA_SETTINGS.crossoverRate;

  return (
    <Accordion
      defaultExpanded={false}
      sx={{
        borderRadius: `${ds.borderRadius.lg}px`,
        border: `1px solid ${alpha(ds.colors.accent.main, 0.3)}`,
        boxShadow: 'none',
        '&:before': { display: 'none' },
        mb: ds.spacing['3'],
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          background: alpha(ds.colors.accent.main, 0.08),
          borderRadius: `${ds.borderRadius.lg}px`,
          '&:hover': {
            background: alpha(ds.colors.accent.main, 0.12),
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={ds.spacing['2']} sx={{ flex: 1 }}>
          <GeneticIcon sx={{ color: ds.colors.accent.main, fontSize: ds.componentSizes.icon.medium }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
              Genetik Algoritma - Gelişmiş Ayarlar
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary }}>
              Population, generation, mutation ve crossover parametreleri
            </Typography>
          </Box>
          {isUsingDefaults && (
            <Chip
              label="Adaptive (Önerilen)"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.6875rem',
                background: alpha(ds.colors.success.main, 0.1),
                color: ds.colors.success.main,
                fontWeight: 600,
              }}
            />
          )}
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ p: ds.spacing['3'] }}>
        <Stack spacing={ds.spacing['3']}>
          {/* Warning Alert */}
          {showWarning && (
            <Alert severity="warning" icon={<WarningIcon />} sx={{ fontSize: '0.8125rem' }}>
              Ekstrem değerler performansı olumsuz etkileyebilir. Varsayılan değerleri kullanmanız önerilir.
            </Alert>
          )}

          {/* Population Size */}
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: ds.spacing['2'] }}>
              Population Size (Popülasyon Büyüklüğü)
            </Typography>
            <Stack direction="row" spacing={ds.spacing['2']} alignItems="center">
              <TextField
                type="number"
                value={settings.populationSize || ''}
                onChange={(e) =>
                  updateSetting('populationSize', e.target.value ? parseInt(e.target.value) : undefined)
                }
                placeholder="Adaptive (50-200)"
                size="small"
                fullWidth
                disabled={readonly}
                inputProps={{ min: 10, max: 100, step: 10 }}
              />
              <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary, minWidth: 100 }}>
                Önerilen: 50-70
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.6875rem', color: ds.colors.text.secondary, mt: ds.spacing['1'] }}>
              Boş bırakırsanız backend otomatik ayarlar (item sayısına göre adaptive)
            </Typography>
          </Box>

          {/* Generations */}
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: ds.spacing['2'] }}>
              Generations (Nesil Sayısı)
            </Typography>
            <Stack direction="row" spacing={ds.spacing['2']} alignItems="center">
              <TextField
                type="number"
                value={settings.generations || ''}
                onChange={(e) =>
                  updateSetting('generations', e.target.value ? parseInt(e.target.value) : undefined)
                }
                placeholder="Adaptive (100-500)"
                size="small"
                fullWidth
                disabled={readonly}
                inputProps={{ min: 10, max: 200, step: 10 }}
              />
              <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary, minWidth: 100 }}>
                Önerilen: 100-150
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.6875rem', color: ds.colors.text.secondary, mt: ds.spacing['1'] }}>
              Daha fazla nesil = daha iyi sonuç, daha uzun süre
            </Typography>
          </Box>

          {/* Mutation Rate */}
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: ds.spacing['2'] }}>
              Mutation Rate (Mutasyon Oranı)
            </Typography>
            <Stack spacing={ds.spacing['1']}>
              <Slider
                value={settings.mutationRate || DEFAULT_GA_SETTINGS.mutationRate}
                onChange={(_, val) => updateSetting('mutationRate', val as number)}
                min={0.01}
                max={0.5}
                step={0.01}
                marks={[
                  { value: 0.05, label: '0.05' },
                  { value: 0.15, label: '0.15' },
                  { value: 0.3, label: '0.3' },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(val) => val.toFixed(2)}
                disabled={readonly}
                sx={{
                  color: ds.colors.accent.main,
                }}
              />
              <Typography sx={{ fontSize: '0.6875rem', color: ds.colors.text.secondary }}>
                Mevcut: {(settings.mutationRate || DEFAULT_GA_SETTINGS.mutationRate).toFixed(2)} | Önerilen: 0.10-0.20
              </Typography>
            </Stack>
          </Box>

          {/* Crossover Rate */}
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: ds.spacing['2'] }}>
              Crossover Rate (Çaprazlama Oranı)
            </Typography>
            <Stack spacing={ds.spacing['1']}>
              <Slider
                value={settings.crossoverRate || DEFAULT_GA_SETTINGS.crossoverRate}
                onChange={(_, val) => updateSetting('crossoverRate', val as number)}
                min={0.5}
                max={1.0}
                step={0.05}
                marks={[
                  { value: 0.6, label: '0.6' },
                  { value: 0.8, label: '0.8' },
                  { value: 1.0, label: '1.0' },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(val) => val.toFixed(2)}
                disabled={readonly}
                sx={{
                  color: ds.colors.primary.main,
                }}
              />
              <Typography sx={{ fontSize: '0.6875rem', color: ds.colors.text.secondary }}>
                Mevcut: {(settings.crossoverRate || DEFAULT_GA_SETTINGS.crossoverRate).toFixed(2)} | Önerilen: 0.75-0.90
              </Typography>
            </Stack>
          </Box>

          {/* Reset Button */}
          <Button
            startIcon={<ResetIcon />}
            onClick={resetToDefaults}
            variant="outlined"
            fullWidth
            disabled={readonly || isUsingDefaults}
            sx={{
              textTransform: 'none',
              borderStyle: 'dashed',
            }}
          >
            Varsayılanlara Dön
          </Button>

          {/* Info Card */}
          <Card
            variant="outlined"
            sx={{
              background: alpha(ds.colors.neutral[100], 0.5),
              borderRadius: `${ds.borderRadius.md}px`,
            }}
          >
            <CardContent sx={{ p: ds.spacing['2'], '&:last-child': { pb: ds.spacing['2'] } }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, mb: ds.spacing['1'] }}>
                ⚙️ Adaptive Mode (Önerilen)
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: ds.colors.text.secondary }}>
                Population ve Generations alanlarını boş bırakırsanız, backend item sayısına göre
                otomatik olarak en uygun değerleri belirler. Bu yaklaşım %95 durumda en iyi sonucu verir.
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};


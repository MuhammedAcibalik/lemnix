/**
 * @fileoverview Algorithm Mode Selector Widget
 * @module widgets/algorithm-selector
 * @version 1.0.0
 * 
 * FSD: Widget layer - Reusable UI component for algorithm selection
 * Design System v2.0: Uses tokens and glassmorphism
 */

import React from 'react';
import { 
  Box, 
  ToggleButtonGroup, 
  ToggleButton, 
  Typography, 
  Chip,
  Stack,
  alpha
} from '@mui/material';
import { FlashOn, Analytics, AutoAwesome } from '@mui/icons-material';
import { ALGORITHM_CONFIGS, getRecommendedMode, type AlgorithmMode } from '@/entities/algorithm';

/**
 * Component props (readonly for immutability)
 */
export interface AlgorithmModeSelectorProps {
  readonly value: AlgorithmMode;
  readonly onChange: (mode: AlgorithmMode) => void;
  readonly itemCount?: number;
  readonly disabled?: boolean;
}

/**
 * Icon mapping for algorithm modes
 */
const ICON_MAP = {
  flash: FlashOn,
  analytics: Analytics,
  auto_awesome: AutoAwesome,
} as const;

/**
 * Algorithm Mode Selector Component
 * 
 * Features:
 * - 3 modes: Standard (fast), Advanced (Pareto), Auto (smart)
 * - Smart recommendation based on item count
 * - Visual feedback with icons and badges
 * - Design System v2.0 compliant
 */
export const AlgorithmModeSelector: React.FC<AlgorithmModeSelectorProps> = ({
  value,
  onChange,
  itemCount,
  disabled = false,
}) => {
  // Get recommendation based on item count
  const recommendedMode = itemCount !== undefined ? getRecommendedMode(itemCount) : 'standard';
  
  // Debug: Log render
  React.useEffect(() => {
    console.log('[AlgorithmModeSelector] Rendered:', {
      value,
      itemCount,
      recommendedMode,
      disabled,
    });
  }, [value, itemCount, recommendedMode, disabled]);

  return (
    <Box sx={{ width: '100%' }}>
      <Typography 
        variant="subtitle1" 
        fontWeight={600}
        gutterBottom
        sx={{ color: 'text.primary', mb: 2 }}
      >
        Algoritma Modu
      </Typography>

      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, newMode: AlgorithmMode | null) => {
          if (newMode) onChange(newMode);
        }}
        fullWidth
        disabled={disabled}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.5,
          '& .MuiToggleButtonGroup-grouped': {
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px !important',
            margin: 0,
          },
        }}
      >
        {(['standard', 'advanced', 'auto'] as const).map(mode => {
          const config = ALGORITHM_CONFIGS[mode];
          const isRecommended = recommendedMode === mode;
          const isSelected = value === mode;
          const IconComponent = ICON_MAP[config.icon];

          return (
            <ToggleButton
              key={mode}
              value={mode}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                p: 2,
                textAlign: 'left',
                backgroundColor: isSelected 
                  ? alpha('#1976d2', 0.08) 
                  : 'background.paper',
                '&:hover': {
                  backgroundColor: alpha('#1976d2', 0.12),
                },
                '&.Mui-selected': {
                  backgroundColor: alpha('#1976d2', 0.16),
                  borderColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: alpha('#1976d2', 0.2),
                  },
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, width: '100%' }}>
                <IconComponent fontSize="small" color={isSelected ? 'primary' : 'action'} />
                {isRecommended && config.badge && (
                  <Chip 
                    label={config.badge} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Stack>

              <Typography 
                variant="subtitle2" 
                fontWeight={600}
                sx={{ color: isSelected ? 'primary.main' : 'text.primary', mb: 0.5 }}
              >
                {config.name}
              </Typography>

              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ mb: 1, display: 'block', lineHeight: 1.4 }}
              >
                {config.description}
              </Typography>

              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                ⏱️ {config.estimatedTime}
              </Typography>
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>

      {/* Features list for selected mode */}
      <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#1976d2', 0.04), borderRadius: 2 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" sx={{ mb: 1 }}>
          Özellikler:
        </Typography>
        <Stack spacing={0.5}>
          {ALGORITHM_CONFIGS[value].features.map((feature, index) => (
            <Typography key={index} variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              • {feature}
            </Typography>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};


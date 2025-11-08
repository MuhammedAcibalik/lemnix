/**
 * Metric Card Component
 * Mini metric card for dashboard-style layouts
 * 
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Box, Typography, Chip, IconButton, Menu, MenuItem } from '@mui/material';
import { TrendingUp, TrendingDown, ExpandMore } from '@mui/icons-material';
import { CardV2 } from '@/shared/ui/Card/Card.v2';
import { useDesignSystem } from '@/shared/hooks';

export interface MetricCardProps {
  readonly label: string;
  readonly value: string | number;
  readonly change?: number;
  readonly unit?: string;
  readonly color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  readonly icon?: React.ReactNode;
  readonly subtitle?: string;
  readonly detail?: string;
  readonly showUnitConverter?: boolean;
}

// Unit conversion helper
const convertLength = (value: number, fromUnit: string, toUnit: string): number => {
  const conversions: Record<string, number> = {
    'mm': 1,
    'cm': 10,
    'm': 1000,
  };
  
  const fromFactor = conversions[fromUnit] || 1;
  const toFactor = conversions[toUnit] || 1;
  
  return (value * fromFactor) / toFactor;
};

const formatLength = (value: number, unit: string): string => {
  if (unit === 'mm') return `${value.toFixed(0)} mm`;
  if (unit === 'cm') return `${value.toFixed(2)} cm`;
  if (unit === 'm') return `${value.toFixed(3)} m`;
  return `${value} ${unit}`;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  unit,
  color = 'primary',
  icon,
  subtitle,
  detail,
  showUnitConverter = false,
}) => {
  const ds = useDesignSystem();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUnit, setSelectedUnit] = useState(unit || 'mm');

  const colorMap = {
    primary: ds.colors.primary.main,
    success: ds.colors.success.main,
    warning: ds.colors.warning.main,
    error: ds.colors.error.main,
    info: ds.colors.info.main,
  };

  const selectedColor = colorMap[color];

  const handleUnitClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUnitClose = () => {
    setAnchorEl(null);
  };

  const handleUnitSelect = (newUnit: string) => {
    setSelectedUnit(newUnit);
    handleUnitClose();
  };

  // Convert value if unit converter is enabled
  const displayValue = showUnitConverter && typeof value === 'number' && unit === 'mm'
    ? convertLength(value, 'mm', selectedUnit)
    : value;

  const displayUnit = showUnitConverter && unit === 'mm'
    ? selectedUnit
    : unit;

  // Debug: Log unit values
  console.log('MetricCard Debug:', { 
    unit, 
    displayUnit, 
    showUnitConverter, 
    selectedUnit,
    value,
    label 
  });

  return (
    <CardV2
      variant="glass"
      sx={{
        p: 0.0625, // Daha da azalt
        pl: 0.125,  // Sol padding'i daha da azalt
        pr: 0.125,  // Sağ padding'i de azalt
        pt: 0.125,  // Üst padding'i azalt
        pb: 0.125,  // Alt padding'i azalt
        height: 120, // Yüksekliği azalt
        minHeight: 120,
        maxHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* Label with Subtitle */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.0625, mb: 0.0625 }}>
        {icon && (
          <Box sx={{ color: selectedColor, display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.125 }}>
          <Typography
            variant="caption"
            sx={{
              color: ds.colors.text.secondary,
              fontSize: '0.7rem',
              fontWeight: 500,
              lineHeight: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                color: ds.colors.text.secondary,
                fontSize: '0.65rem',
                fontWeight: 400,
                lineHeight: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Value */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.25, flex: 1, minHeight: 0 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: selectedColor,
            fontSize: '1.6rem',
            lineHeight: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {displayValue}
        </Typography>
        {displayUnit && displayUnit.trim() !== '' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.03125, flexShrink: 0 }}>
            <Typography
              component="span"
              sx={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: selectedColor,
                lineHeight: 1,
              }}
            >
              {displayUnit}
            </Typography>
            {showUnitConverter && (
              <IconButton
                size="small"
                onClick={handleUnitClick}
                sx={{
                  p: 0.125,
                  color: ds.colors.text.secondary,
                  '&:hover': {
                    color: selectedColor,
                  },
                }}
              >
                <ExpandMore sx={{ fontSize: 12 }} />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      {/* Detail */}
      {detail && (
        <Typography
          variant="caption"
          sx={{
            color: ds.colors.text.secondary,
            fontSize: '0.65rem',
            fontWeight: 400,
            mt: 0.0625,
            display: 'block',
            lineHeight: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {detail}
        </Typography>
      )}

      {/* Change Indicator */}
      {change !== undefined && (
        <Chip
          size="small"
          icon={change >= 0 ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />}
          label={`${change >= 0 ? '+' : ''}${change.toFixed(1)}%`}
          sx={{
            height: 20,
            fontSize: '0.6875rem',
            fontWeight: 600,
            alignSelf: 'flex-start',
            backgroundColor: change >= 0
              ? `${ds.colors.success.main}15`
              : `${ds.colors.error.main}15`,
            color: change >= 0 ? ds.colors.success.main : ds.colors.error.main,
            '& .MuiChip-icon': {
              color: 'inherit',
            },
          }}
        />
      )}

      {/* Unit Converter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleUnitClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => handleUnitSelect('mm')} selected={selectedUnit === 'mm'}>
          mm (Milimetre)
        </MenuItem>
        <MenuItem onClick={() => handleUnitSelect('cm')} selected={selectedUnit === 'cm'}>
          cm (Santimetre)
        </MenuItem>
        <MenuItem onClick={() => handleUnitSelect('m')} selected={selectedUnit === 'm'}>
          m (Metre)
        </MenuItem>
      </Menu>
    </CardV2>
  );
};


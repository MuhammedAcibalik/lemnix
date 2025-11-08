/**
 * @fileoverview Filter Controls Component v2.0 - Modern Design
 * @module FilterControls
 * @version 2.0.0 - Design System v2 Compliant
 */

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Stack,
  alpha,
  Divider,
} from '@mui/material';
import { FilterList as FilterIcon } from '@mui/icons-material';
import { FilterControlsProps } from '../types';
import { textContent } from '../constants';

// Design System v2.0
import { useDesignSystem } from '@/shared/hooks';
import { CardV2 } from '@/shared';

/**
 * Filter Controls Component
 */
export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  availableProfileTypes
}) => {
  const ds = useDesignSystem();

  const handleSwitchChange = (field: keyof FilterControlsProps['filters'], value: boolean) => {
    onFilterChange({ [field]: value });
  };

  const handleSelectChange = (field: keyof FilterControlsProps['filters'], value: string) => {
    onFilterChange({ [field]: value });
  };

  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing['4'] }}>
      <Stack spacing={ds.spacing['3']}>
        {/* Modern Header */}
        <Stack direction="row" alignItems="center" spacing={ds.spacing['2']}>
          <FilterIcon sx={{ fontSize: 20, color: ds.colors.primary.main }} />
          <Typography sx={{ 
            fontWeight: 700,
            fontSize: '0.9375rem',
            color: ds.colors.text.primary
          }}>
            Filtreler
          </Typography>
        </Stack>

        <Divider sx={{ opacity: 0.5 }} />
        
        {/* Modern Switches */}
        <Stack spacing={ds.spacing['2']}>
          <FormControlLabel
            control={
              <Switch
                checked={filters.showSelectedOnly}
                onChange={(e) => handleSwitchChange('showSelectedOnly', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: ds.colors.primary.main,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: ds.colors.primary.main,
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {textContent.filters.showSelectedOnly}
              </Typography>
            }
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={filters.showWorkOrdersOnly}
                onChange={(e) => handleSwitchChange('showWorkOrdersOnly', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: ds.colors.primary.main,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: ds.colors.primary.main,
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {textContent.filters.showWorkOrdersOnly}
              </Typography>
            }
          />
        </Stack>
        
        {/* Modern Select */}
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontSize: '0.875rem' }}>
            {textContent.filters.profileType}
          </InputLabel>
          <Select
            value={filters.profileType}
            onChange={(e) => handleSelectChange('profileType', e.target.value)}
            label={textContent.filters.profileType}
            sx={{
              borderRadius: `${ds.borderRadius.md}px`,
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(ds.colors.primary.main, 0.2),
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(ds.colors.primary.main, 0.4),
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: ds.colors.primary.main,
              },
            }}
          >
            <MenuItem value="" sx={{ fontSize: '0.875rem' }}>
              {textContent.filters.allTypes}
            </MenuItem>
            {availableProfileTypes.map((type) => (
              <MenuItem key={type} value={type} sx={{ fontSize: '0.875rem' }}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </CardV2>
  );
};

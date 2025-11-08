/**
 * Command Footer - Design System v2.0
 * Clean footer with navigation hints
 */

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  alpha,
} from '@mui/material';
import { KeyboardArrowDown as ArrowDownIcon } from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';

export interface CommandFooterProps {
  totalItems: number;
  selectedIndex: number;
}

export const CommandFooter: React.FC<CommandFooterProps> = ({
  totalItems,
  selectedIndex,
}) => {
  const ds = useDesignSystem();

  return (
    <Box sx={{
      height: 52,  // 60px → 52px KOMPAKT
      p: ds.spacing['2'],  // 12px → 8px
      borderTop: `1px solid ${alpha(ds.colors.neutral[200], 0.5)}`,
      backgroundColor: ds.colors.surface.elevated1,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      {/* Results Info - Kompakt */}
      <Typography 
        variant="body2" 
        sx={{
          color: ds.colors.text.secondary,
          fontSize: '0.75rem',  // 12px
          fontWeight: 500,
        }}
      >
        {totalItems} komut
      </Typography>
      
      {/* Keyboard Navigation Hints - Kompakt Chips */}
      <Box sx={{ display: 'flex', gap: ds.spacing['1'] }}>
        <Chip
          icon={<ArrowDownIcon sx={{ fontSize: '0.75rem' }} />}
          label="Seç"
          size="small"
          sx={{
            height: 26,  // 28px → 26px
            fontSize: '0.6875rem',  // 11px
            fontWeight: ds.typography.fontWeight.semibold,
            backgroundColor: alpha(ds.colors.neutral[500], 0.1),
            color: ds.colors.text.secondary,
            border: `1px solid ${alpha(ds.colors.neutral[400], 0.2)}`,
            fontFamily: ds.typography.fontFamily.mono,
            px: ds.spacing['2'],
            '& .MuiChip-icon': {
              fontSize: '0.75rem',
              ml: 0,
            }
          }}
        />
        <Chip
          label="Enter"
          size="small"
          sx={{
            height: 26,
            fontSize: '0.6875rem',
            fontWeight: ds.typography.fontWeight.semibold,
            backgroundColor: alpha(ds.colors.primary.main, 0.1),
            color: ds.colors.primary.main,
            fontFamily: ds.typography.fontFamily.mono,
            border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
            px: ds.spacing['2'],
          }}
        />
        <Chip
          label="ESC"
          size="small"
          sx={{
            height: 26,
            fontSize: '0.6875rem',
            fontWeight: ds.typography.fontWeight.semibold,
            backgroundColor: alpha(ds.colors.neutral[500], 0.1),
            color: ds.colors.text.secondary,
            fontFamily: ds.typography.fontFamily.mono,
            border: `1px solid ${alpha(ds.colors.neutral[400], 0.2)}`,
            px: ds.spacing['2'],
          }}
        />
      </Box>
    </Box>
  );
};

/**
 * @fileoverview Category Header Component for Command Palette
 * @module CategoryHeader
 * @version 1.0.0
 */

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  alpha
} from '@mui/material';
import { stylingConstants } from '../constants';
import {
  CategoryHeaderProps
} from '../types';

/**
 * Category Header Component
 */
export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  title,
  icon,
  count,
  description,
  category,
  theme,
  itemCount
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        mb: 1,
        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        borderRadius: stylingConstants.borderRadius.small,
        border: `1px solid ${alpha(theme === 'dark' ? '#ffffff' : '#000000', 0.2)}`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          backgroundColor: theme === 'dark' ? '#ffffff' : '#000000',
          borderRadius: '0 2px 2px 0',
        }
      }}
    >
      <Box sx={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
        {React.createElement(icon, { sx: { fontSize: 16 } })}
      </Box>
      <Typography
        variant="subtitle2"
        sx={{
          color: theme === 'dark' ? '#ffffff' : '#000000',
          fontWeight: 700,
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {title}
      </Typography>
      <Chip
        label={count || itemCount || 0}
        size="small"
        sx={{
          height: 20,
          fontSize: '0.65rem',
          backgroundColor: alpha(theme === 'dark' ? '#ffffff' : '#000000', 0.1),
          color: theme === 'dark' ? '#ffffff' : '#000000',
          fontWeight: 600,
          border: `1px solid ${alpha(theme === 'dark' ? '#ffffff' : '#000000', 0.2)}`,
        }}
      />
    </Box>
  );
};

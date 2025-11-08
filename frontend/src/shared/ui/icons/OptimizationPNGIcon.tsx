/**
 * @fileoverview PNG Optimization Icon Component
 * @module OptimizationPNGIcon
 * @version 1.0.0
 */

import React from 'react';
import { Box } from '@mui/material';
import optimizationIcon from '../../../assets/images/optimization-icon.svg';

interface OptimizationPNGIconProps {
  size?: number | string;
  alt?: string;
  sx?: Record<string, unknown>;
}

export const OptimizationPNGIcon: React.FC<OptimizationPNGIconProps> = ({ 
  size = 24, 
  alt = 'Optimization Icon',
  sx = {},
  ...props 
}) => {
  return (
    <Box
      component="img"
      src={optimizationIcon}
      alt={alt}
      sx={{
        width: size,
        height: size,
        objectFit: 'contain',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        ...sx,
      }}
      {...props}
    />
  );
};

export default OptimizationPNGIcon;

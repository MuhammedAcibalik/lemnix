/**
 * @fileoverview TabPanel Component for Profile Optimization Results
 * @module TabPanel
 * @version 1.0.0
 */

import React from 'react';
import { Box } from '@mui/material';
import { TabPanelProps } from '../types';

/**
 * TabPanel Component
 */
export const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

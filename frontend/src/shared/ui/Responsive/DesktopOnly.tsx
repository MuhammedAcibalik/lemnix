/**
 * DesktopOnly Component
 * Renders children only on desktop devices
 * 
 * @module shared/ui/Responsive
 * @version 2.0.0
 */

import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

export interface DesktopOnlyProps {
  readonly children: React.ReactNode;
}

export const DesktopOnly: React.FC<DesktopOnlyProps> = ({ children }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  if (!isDesktop) return null;

  return <>{children}</>;
};


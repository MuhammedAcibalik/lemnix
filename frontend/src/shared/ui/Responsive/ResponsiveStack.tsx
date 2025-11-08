/**
 * ResponsiveStack Component
 * Stack that switches between column (mobile) and row (desktop)
 * 
 * @module shared/ui/Responsive
 * @version 2.0.0
 */

import React from 'react';
import { Stack, StackProps } from '@mui/material';

export interface ResponsiveStackProps extends Omit<StackProps, 'direction'> {
  readonly children: React.ReactNode;
  readonly mobileDirection?: 'column' | 'row';
  readonly desktopDirection?: 'column' | 'row';
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  mobileDirection = 'column',
  desktopDirection = 'row',
  ...props
}) => {
  return (
    <Stack
      direction={{ xs: mobileDirection, md: desktopDirection }}
      {...props}
    >
      {children}
    </Stack>
  );
};


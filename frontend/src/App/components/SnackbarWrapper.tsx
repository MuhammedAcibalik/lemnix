/**
 * @fileoverview Snackbar Wrapper Component
 * @module App/Components
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { SnackbarState, SnackbarCloseHandler } from '../types';
import { snackbarConfig } from '../constants';

interface SnackbarWrapperProps {
  snackbar: SnackbarState;
  onClose: SnackbarCloseHandler;
}

/**
 * Snackbar Wrapper Component
 */
export const SnackbarWrapper: React.FC<SnackbarWrapperProps> = ({
  snackbar,
  onClose
}) => {
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={snackbarConfig.autoHideDuration}
      onClose={onClose}
      anchorOrigin={snackbarConfig.anchorOrigin}
    >
      <Alert
        onClose={onClose}
        severity={snackbar.severity}
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

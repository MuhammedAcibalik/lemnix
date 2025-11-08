/**
 * GPU Status Badge Component
 * Shows GPU acceleration status
 * 
 * @module shared/ui
 * @version 1.0.0
 */

import React from 'react';
import { Chip, Tooltip, CircularProgress } from '@mui/material';
import { Memory as GPUIcon } from '@mui/icons-material';

export interface GPUStatusBadgeProps {
  readonly isSupported: boolean;
  readonly isInitialized: boolean;
  readonly isLoading?: boolean;
  readonly size?: 'small' | 'medium';
}

export const GPUStatusBadge: React.FC<GPUStatusBadgeProps> = ({
  isSupported,
  isInitialized,
  isLoading = false,
  size = 'small',
}) => {
  if (isLoading) {
    return (
      <Chip
        icon={<CircularProgress size={16} />}
        label="GPU kontrol ediliyor..."
        size={size}
        variant="outlined"
      />
    );
  }

  if (!isSupported) {
    return (
      <Tooltip title="Bu tarayıcı GPU hızlandırmayı desteklemiyor" arrow>
        <Chip
          label="GPU Desteklenmiyor"
          size={size}
          variant="outlined"
          color="default"
        />
      </Tooltip>
    );
  }

  if (isInitialized) {
    return (
      <Tooltip title="GPU hızlandırma aktif - Optimizasyonlar 10x daha hızlı!" arrow>
        <Chip
          icon={<GPUIcon />}
          label="⚡ GPU Aktif"
          size={size}
          color="success"
          variant="filled"
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title="GPU destekleniyor ancak henüz başlatılmadı" arrow>
      <Chip
        icon={<GPUIcon />}
        label="GPU Hazır"
        size={size}
        color="info"
        variant="outlined"
      />
    </Tooltip>
  );
};


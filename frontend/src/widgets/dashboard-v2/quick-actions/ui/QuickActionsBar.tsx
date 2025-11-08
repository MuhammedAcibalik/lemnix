/**
 * Quick Actions Bar Component
 * Prominent action buttons for common tasks
 * 
 * @module widgets/dashboard-v2/quick-actions
 * @version 1.0.0 - Design System v2.0 Compliant
 */

import React from 'react';
import { Box, Button, Stack, Tooltip, alpha } from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Add as AddIcon,
  History as HistoryIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDesignSystem } from '@/shared/hooks';
import type { QuickActionType } from '@/entities/dashboard';

/**
 * Quick Actions Bar Props
 */
export interface QuickActionsBarProps {
  readonly onAction?: (actionType: QuickActionType) => void;
  readonly disabled?: boolean;
}

/**
 * Quick Actions Bar
 * Primary actions for quick access
 */
export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onAction,
  disabled = false
}) => {
  const ds = useDesignSystem();
  const navigate = useNavigate();
  
  const handleAction = (actionType: QuickActionType, defaultRoute: string) => {
    if (onAction) {
      onAction(actionType);
    } else {
      // Default behavior: navigate
      navigate(defaultRoute);
    }
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        gap: ds.spacing['3'],
        flexWrap: 'wrap',
        mb: ds.spacing['6'],
      }}
    >
      {/* Primary: Start Optimization */}
      <Tooltip title="Yeni bir optimizasyon başlat" arrow>
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrowIcon />}
          disabled={disabled}
          onClick={() => handleAction('start_optimization', '/enterprise-optimization')}
          sx={{
            background: ds.gradients.primary,
            color: 'white',
            fontWeight: ds.typography.fontWeight.semibold,
            px: ds.spacing['6'],
            py: ds.spacing['3'],
            borderRadius: `${ds.borderRadius.button}px`,
            transition: ds.transitions.base,
            boxShadow: ds.shadows.soft.md,
            '&:hover': {
              background: ds.gradients.primary,
              opacity: 0.9,
              transform: 'translateY(-2px)',
              boxShadow: ds.shadows.soft.lg,
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: ds.shadows.soft.sm,
            },
          }}
        >
          Optimizasyon Başlat
        </Button>
      </Tooltip>
      
      {/* Secondary: Create Cutting List */}
      <Tooltip title="Yeni kesim listesi oluştur" arrow>
        <Button
          variant="outlined"
          size="large"
          startIcon={<AddIcon />}
          disabled={disabled}
          onClick={() => handleAction('create_cutting_list', '/cutting-list')}
          sx={{
            borderColor: ds.colors.neutral[300],
            color: ds.colors.text.primary,
            fontWeight: ds.typography.fontWeight.semibold,
            px: ds.spacing['4'],
            py: ds.spacing['3'],
            borderRadius: `${ds.borderRadius.button}px`,
            transition: ds.transitions.base,
            '&:hover': {
              borderColor: ds.colors.primary.main,
              backgroundColor: alpha(ds.colors.primary.main, 0.04),
              transform: 'translateY(-2px)',
            },
          }}
        >
          Yeni Liste
        </Button>
      </Tooltip>
      
      {/* Tertiary: View History */}
      <Tooltip title="Optimizasyon geçmişini görüntüle" arrow>
        <Button
          variant="outlined"
          size="large"
          startIcon={<HistoryIcon />}
          disabled={disabled}
          onClick={() => handleAction('view_history', '/statistics')}
          sx={{
            borderColor: ds.colors.neutral[300],
            color: ds.colors.text.primary,
            fontWeight: ds.typography.fontWeight.semibold,
            px: ds.spacing['4'],
            py: ds.spacing['3'],
            borderRadius: `${ds.borderRadius.button}px`,
            transition: ds.transitions.base,
            '&:hover': {
              borderColor: ds.colors.primary.main,
              backgroundColor: alpha(ds.colors.primary.main, 0.04),
              transform: 'translateY(-2px)',
            },
          }}
        >
          Geçmiş
        </Button>
      </Tooltip>
      
      {/* Tertiary: Export Reports */}
      <Tooltip title="Raporları dışa aktar" arrow>
        <Button
          variant="outlined"
          size="large"
          startIcon={<FileDownloadIcon />}
          disabled={disabled}
          onClick={() => handleAction('export_reports', '/statistics')}
          sx={{
            borderColor: ds.colors.neutral[300],
            color: ds.colors.text.primary,
            fontWeight: ds.typography.fontWeight.semibold,
            px: ds.spacing['4'],
            py: ds.spacing['3'],
            borderRadius: `${ds.borderRadius.button}px`,
            transition: ds.transitions.base,
            '&:hover': {
              borderColor: ds.colors.primary.main,
              backgroundColor: alpha(ds.colors.primary.main, 0.04),
              transform: 'translateY(-2px)',
            },
          }}
        >
          Rapor Dışa Aktar
        </Button>
      </Tooltip>
    </Box>
  );
};


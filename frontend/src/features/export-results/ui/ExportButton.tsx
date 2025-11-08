/**
 * @fileoverview Export Button with Options Menu
 * @module features/export-results
 * @version 1.0.0
 * 
 * ✅ P0-3: Export optimization results (PDF, Excel, JSON)
 * ✅ BACKEND: POST /enterprise/export
 */

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Divider,
  CircularProgress,
  Tooltip,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import {
  GetApp as ExportIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Code as JsonIcon,
} from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import { useExportOptimization } from '@/entities/optimization/api/optimizationQueries';
import toast from 'react-hot-toast';

interface ExportButtonProps {
  readonly resultId: string;
  readonly disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ 
  resultId, 
  disabled = false 
}) => {
  const ds = useDesignSystem();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [options, setOptions] = useState({
    includeCharts: true,
    includeMetrics: true,
    includeRecommendations: true,
  });

  const { mutate: exportResult, isPending } = useExportOptimization({
    onSuccess: (response) => {
      toast.success('Export başarılı! İndirme başlıyor...');
      // Auto-download
      if (response.downloadUrl) {
        window.open(response.downloadUrl, '_blank');
      }
      handleClose();
    },
    onError: (error) => {
      toast.error(`Export hatası: ${error.message}`);
    },
  });

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (format: 'excel' | 'pdf' | 'json') => {
    exportResult({
      resultId,
      format,
      options,
    });
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Export Results" arrow>
        <IconButton
          onClick={handleOpen}
          disabled={disabled || isPending}
          size="small"
          sx={{
            color: ds.colors.primary.main,
            background: alpha(ds.colors.primary.main, 0.1),
            '&:hover': {
              background: alpha(ds.colors.primary.main, 0.2),
              transform: 'scale(1.05)',
            },
            transition: ds.transitions.fast,
          }}
        >
          {isPending ? (
            <CircularProgress size={20} sx={{ color: ds.colors.primary.main }} />
          ) : (
            <ExportIcon sx={{ fontSize: ds.componentSizes.icon.medium }} />
          )}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: `${ds.borderRadius.lg}px`,
            boxShadow: ds.shadows.soft.xl,
            minWidth: 280,
            border: `1px solid ${ds.colors.neutral[200]}`,
          },
        }}
      >
        {/* Export Options Header */}
        <Box sx={{ px: ds.spacing['3'], py: ds.spacing['2'] }}>
          <Typography sx={{ 
            fontSize: '0.875rem', 
            fontWeight: 700, 
            color: ds.colors.text.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Export Seçenekleri
          </Typography>
        </Box>

        <Divider />

        {/* Include Options */}
        <MenuItem onClick={() => toggleOption('includeCharts')} dense>
          <Checkbox
            checked={options.includeCharts}
            size="small"
            sx={{ mr: ds.spacing['1'] }}
          />
          <ListItemText 
            primary="Grafikleri Dahil Et" 
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
        </MenuItem>

        <MenuItem onClick={() => toggleOption('includeMetrics')} dense>
          <Checkbox
            checked={options.includeMetrics}
            size="small"
            sx={{ mr: ds.spacing['1'] }}
          />
          <ListItemText 
            primary="Metrikleri Dahil Et" 
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
        </MenuItem>

        <MenuItem onClick={() => toggleOption('includeRecommendations')} dense>
          <Checkbox
            checked={options.includeRecommendations}
            size="small"
            sx={{ mr: ds.spacing['1'] }}
          />
          <ListItemText 
            primary="Önerileri Dahil Et" 
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
        </MenuItem>

        <Divider sx={{ my: ds.spacing['2'] }} />

        {/* Export Format Options */}
        <MenuItem onClick={() => handleExport('excel')} disabled={isPending}>
          <ListItemIcon>
            <ExcelIcon sx={{ 
              fontSize: ds.componentSizes.icon.medium, 
              color: ds.colors.success.main 
            }} />
          </ListItemIcon>
          <ListItemText
            primary="Excel (.xlsx)"
            secondary="Detaylı tablo formatı"
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
            secondaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </MenuItem>

        <MenuItem onClick={() => handleExport('pdf')} disabled={isPending}>
          <ListItemIcon>
            <PdfIcon sx={{ 
              fontSize: ds.componentSizes.icon.medium, 
              color: ds.colors.error.main 
            }} />
          </ListItemIcon>
          <ListItemText
            primary="PDF (.pdf)"
            secondary="Yazdırılabilir rapor"
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
            secondaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </MenuItem>

        <MenuItem onClick={() => handleExport('json')} disabled={isPending}>
          <ListItemIcon>
            <JsonIcon sx={{ 
              fontSize: ds.componentSizes.icon.medium, 
              color: ds.colors.accent.main 
            }} />
          </ListItemIcon>
          <ListItemText
            primary="JSON (.json)"
            secondary="API formatında veri"
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
            secondaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

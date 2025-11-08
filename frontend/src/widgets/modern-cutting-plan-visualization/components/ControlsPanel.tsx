/**
 * @fileoverview Controls Panel Component
 * @module ControlsPanel
 * @version 1.0.0
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  Palette as PaletteIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Download as DownloadIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import {
  ControlsPanelProps
} from '../types';

/**
 * Controls Panel Component
 */
export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings,
  onZoom,
  onViewModeChange,
  onSettingsOpen,
  onFullscreenToggle,
  onPageChange,
  onExport,
  showExportOptions,
  currentPage,
  totalPages,
  stocksPerPage
}) => {
  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          {/* View Controls */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="Yakınlaştır">
              <IconButton onClick={() => onZoom('in')} disabled={settings.zoomLevel >= 3}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Uzaklaştır">
              <IconButton onClick={() => onZoom('out')} disabled={settings.zoomLevel <= 0.5}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Tam Ekran">
              <IconButton onClick={onFullscreenToggle}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ayarlar">
              <IconButton onClick={onSettingsOpen}>
                <PaletteIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* View Mode Toggle */}
          <Stack direction="row" spacing={1}>
            <Button
              variant={settings.viewMode === 'detailed' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<ViewListIcon />}
              onClick={() => onViewModeChange('detailed')}
            >
              Detaylı
            </Button>
            <Button
              variant={settings.viewMode === 'compact' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<ViewModuleIcon />}
              onClick={() => onViewModeChange('compact')}
            >
              Kompakt
            </Button>
          </Stack>

          {/* Pagination Controls */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
            >
              ← Önceki
            </Button>
            
            <Typography variant="body2" sx={{ px: 1 }}>
              {currentPage + 1} / {totalPages}
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Sonraki →
            </Button>
          </Stack>

          {/* Export Options */}
          {showExportOptions && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => onExport('pdf')}
              >
                PDF
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
              >
                Yazdır
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

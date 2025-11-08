/**
 * @fileoverview Modern Cutting Plan Visualization - Main Component
 * @module ModernCuttingPlanVisualization
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import {
  Info as InfoIcon
} from '@mui/icons-material';

// Import modular components
import { StockVisualization } from './components/StockVisualization';
import { StatisticsDisplay } from './components/StatisticsDisplay';
import { ControlsPanel } from './components/ControlsPanel';
import { SettingsDialog } from './components/SettingsDialog';
import { QuickActionsMenu } from './components/QuickActionsMenu';

// Import hooks
import { useVisualizationState } from './hooks/useVisualizationState';
import { useVisualizationData } from './hooks/useVisualizationData';

// Import types
import {
  ModernCuttingPlanProps,
  ExportFormat
} from './types';

/**
 * Modern Cutting Plan Visualization Component
 * 
 * Enterprise-grade cutting plan visualization with modular architecture
 */
export const ModernCuttingPlanVisualization: React.FC<ModernCuttingPlanProps> = ({
  optimizationResult,
  stockLength = 6000,
  title = "Kesim Planı",
  showStatistics = true,
  showExportOptions = true,
  onExport
}) => {
  // Container ref for DOM operations
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom hooks for state and data management
  const {
    settings,
    selectedStock,
    showSettingsDialog,
    showStatsDialog,
    isFullscreen,
    hoveredPiece,
    quickMenuAnchor,
    stocksPerPage,
    currentPage,
    updateSettings,
    handleZoom,
    handleViewModeChange,
    handleStockClick,
    handlePieceHover,
    handlePieceLeave,
    openSettingsDialog,
    closeSettingsDialog,
    openStatsDialog,
    closeQuickMenu,
    handlePageChange,
    toggleFullscreen,
    openQuickMenu
  } = useVisualizationState();

  const {
    processedData,
    overallStatistics,
    paginatedData,
    hasData,
    hasValidResult,
    totalPages
  } = useVisualizationData(
    optimizationResult,
    stockLength,
    stocksPerPage,
    currentPage
  );

  // Export handler
  const handleExport = (format: ExportFormat) => {
    if (onExport) {
      onExport(format);
    } else {
      // Default export logic
      console.log(`Exporting as ${format}...`);
    }
  };

  // Copy handler
  const handleCopy = () => {
    console.log('Data copied to clipboard');
  };

  // Early return for invalid data
  if (!hasValidResult || !hasData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body1">
          Görüntülenecek kesim planı bulunamadı. Önce optimizasyon çalıştırın.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box ref={containerRef} sx={{ maxWidth: '100%', mx: 'auto', p: 2 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {paginatedData.showingCount} / {paginatedData.totalStocks} profil • {overallStatistics.totalPieces} parça • %{overallStatistics.overallEfficiency.toFixed(1)} verimlilik • {overallStatistics.totalWaste}mm fire
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<InfoIcon />}
          onClick={openStatsDialog}
          sx={{ borderRadius: 3 }}
        >
          Detaylı İstatistikler
        </Button>
      </Stack>

      {/* Controls Panel */}
      <ControlsPanel
        settings={settings}
        onZoom={handleZoom}
        onViewModeChange={handleViewModeChange}
        onSettingsOpen={openSettingsDialog}
        onFullscreenToggle={toggleFullscreen}
        onPageChange={handlePageChange}
        onExport={handleExport}
        showExportOptions={showExportOptions}
        currentPage={currentPage}
        totalPages={totalPages}
        stocksPerPage={stocksPerPage}
      />

      {/* Statistics Display */}
      {showStatistics && (
        <StatisticsDisplay statistics={overallStatistics} />
      )}

      {/* Main Visualization */}
      <Box sx={{ transform: `scale(${settings.zoomLevel})`, transformOrigin: 'top left' }}>
        {paginatedData.data.map((stock) => (
          <StockVisualization
            key={stock.id}
            stock={stock}
            settings={settings}
            selectedStock={selectedStock}
            hoveredPiece={hoveredPiece}
            onStockClick={handleStockClick}
            onPieceHover={handlePieceHover}
            onPieceLeave={handlePieceLeave}
          />
        ))}
      </Box>

      {/* Pagination Info */}
      {paginatedData.totalPages > 1 && (
        <Card elevation={1} sx={{ mt: 3, bgcolor: 'grey.50' }}>
          <CardContent sx={{ py: 2 }}>
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Sayfa {currentPage + 1} / {paginatedData.totalPages} 
                • {paginatedData.showingCount} profil gösteriliyor
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Settings Dialog */}
      <SettingsDialog
        open={showSettingsDialog}
        settings={settings}
        onClose={closeSettingsDialog}
        onSettingsChange={updateSettings}
      />

      {/* Quick Actions Menu */}
      <QuickActionsMenu
        anchorEl={quickMenuAnchor}
        onClose={closeQuickMenu}
        onExport={handleExport}
        onCopy={handleCopy}
        optimizationResult={optimizationResult}
      />
    </Box>
  );
};

export default ModernCuttingPlanVisualization;

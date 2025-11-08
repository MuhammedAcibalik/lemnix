/**
 * @fileoverview Custom hook for managing visualization state
 * @module useVisualizationState
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import {
  VisualizationSettings,
  ComponentState,
  SettingsUpdateHandler,
  StockClickHandler,
  ExportHandler,
  ZoomDirection,
  ViewMode
} from '../types';
import { getDefaultSettings, updateZoomLevel } from '../utils';

/**
 * Custom hook for managing visualization state
 */
export const useVisualizationState = () => {
  const [settings, setSettings] = useState<VisualizationSettings>(getDefaultSettings());
  const [selectedStock, setSelectedStock] = useState<number | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredPiece, setHoveredPiece] = useState<string | null>(null);
  const [quickMenuAnchor, setQuickMenuAnchor] = useState<HTMLElement | null>(null);
  const [stocksPerPage, setStocksPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  // Settings update handler
  const updateSettings: SettingsUpdateHandler = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Zoom handler
  const handleZoom = useCallback((direction: ZoomDirection) => {
    setSettings(prev => ({
      ...prev,
      zoomLevel: updateZoomLevel(prev.zoomLevel, direction)
    }));
  }, []);

  // View mode change handler
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    updateSettings({ viewMode: mode });
  }, [updateSettings]);

  // Stock click handler
  const handleStockClick: StockClickHandler = useCallback((stockId) => {
    setSelectedStock(prev => prev === stockId ? null : stockId);
  }, []);

  // Piece hover handlers
  const handlePieceHover = useCallback((pieceId: string | null) => {
    setHoveredPiece(pieceId);
  }, []);

  const handlePieceLeave = useCallback(() => {
    setHoveredPiece(null);
  }, []);

  // Dialog handlers
  const openSettingsDialog = useCallback(() => {
    setShowSettingsDialog(true);
  }, []);

  const closeSettingsDialog = useCallback(() => {
    setShowSettingsDialog(false);
  }, []);

  const openStatsDialog = useCallback(() => {
    setShowStatsDialog(true);
  }, []);

  const closeStatsDialog = useCallback(() => {
    setShowStatsDialog(false);
  }, []);

  // Fullscreen handler
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Quick menu handlers
  const openQuickMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setQuickMenuAnchor(event.currentTarget);
  }, []);

  const closeQuickMenu = useCallback(() => {
    setQuickMenuAnchor(null);
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  }, []);

  const handleNextPage = useCallback((totalPages: number) => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  }, []);

  // Reset handlers
  const resetSelection = useCallback(() => {
    setSelectedStock(null);
    setHoveredPiece(null);
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(0);
  }, []);

  const resetAll = useCallback(() => {
    setSettings(getDefaultSettings());
    resetSelection();
    resetPagination();
    setShowSettingsDialog(false);
    setShowStatsDialog(false);
    setIsFullscreen(false);
    setQuickMenuAnchor(null);
  }, [resetSelection, resetPagination]);

  // Current state
  const state: ComponentState = {
    settings,
    selectedStock,
    showSettingsDialog,
    showStatsDialog,
    isFullscreen,
    hoveredPiece,
    quickMenuAnchor,
    stocksPerPage,
    currentPage
  };

  return {
    // State
    state,
    settings,
    selectedStock,
    showSettingsDialog,
    showStatsDialog,
    isFullscreen,
    hoveredPiece,
    quickMenuAnchor,
    stocksPerPage,
    currentPage,

    // Setters
    setSettings,
    setSelectedStock,
    setShowSettingsDialog,
    setShowStatsDialog,
    setIsFullscreen,
    setHoveredPiece,
    setQuickMenuAnchor,
    setStocksPerPage,
    setCurrentPage,

    // Handlers
    updateSettings,
    handleZoom,
    handleViewModeChange,
    handleStockClick,
    handlePieceHover,
    handlePieceLeave,
    openSettingsDialog,
    closeSettingsDialog,
    openStatsDialog,
    closeStatsDialog,
    toggleFullscreen,
    openQuickMenu,
    closeQuickMenu,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    resetSelection,
    resetPagination,
    resetAll
  };
};

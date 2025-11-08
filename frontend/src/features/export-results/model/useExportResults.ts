/**
 * Export Results Business Logic Hook
 * 
 * @module features/export-results/model
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { useExportOptimization } from '@/entities/optimization';
import type { ExportFormat, ExportOptimizationRequest } from '@/entities/optimization';

interface UseExportResultsParams {
  readonly resultId: string;
  readonly onSuccess?: (downloadUrl: string) => void;
  readonly onError?: (error: Error) => void;
}

export function useExportResults(params: UseExportResultsParams) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutate: exportResult, isPending } = useExportOptimization({
    onSuccess: (response) => {
      // Automatic download
      const link = document.createElement('a');
      link.href = response.downloadUrl;
      link.download = response.filename;
      link.click();
      
      params.onSuccess?.(response.downloadUrl);
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error('Export failed:', error);
      params.onError?.(error);
    },
  });

  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const startExport = useCallback((format: ExportFormat, options?: ExportOptimizationRequest['options']) => {
    exportResult({
      resultId: params.resultId,
      format,
      options,
    });
  }, [exportResult, params.resultId]);

  return {
    // State
    isDialogOpen,
    isPending,

    // Actions
    openDialog,
    closeDialog,
    startExport,
  } as const;
}


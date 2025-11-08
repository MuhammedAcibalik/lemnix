/**
 * @fileoverview Main optimization form state management hook
 * @module EnterpriseOptimizationForm/Hooks/useOptimizationForm
 * @version 1.0.0
 */

import { useState, useCallback, useMemo } from 'react';
import { CuttingListItem, OptimizationParams } from '../types';
import { DEFAULT_PARAMS, SAMPLE_ITEMS } from '../constants';
import { sanitizeInput, validateNumber } from '../utils';

export const useOptimizationForm = () => {
  // Main form state
  const [cuttingList, setCuttingList] = useState<CuttingListItem[]>([]);
  const [params, setParams] = useState<OptimizationParams>(DEFAULT_PARAMS);
  
  // Item management
  const addCuttingItem = useCallback(() => {
    const newItem: CuttingListItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workOrderId: '',
      color: '',
      version: '',
      size: '',
      profileType: '',
      length: 0,
      quantity: 1,
      cuttingPattern: '',
    };
    setCuttingList(prev => [...prev, newItem]);
  }, []);

  const updateCuttingItem = useCallback((id: string, field: keyof CuttingListItem, value: string | number) => {
    setCuttingList(prev => prev.map(item => {
      if (item.id === id) {
        const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : 
                              typeof value === 'number' ? validateNumber(value) : value;
        return { ...item, [field]: sanitizedValue };
      }
      return item;
    }));
  }, []);

  const deleteCuttingItem = useCallback((id: string) => {
    setCuttingList(prev => prev.filter(item => item.id !== id));
  }, []);

  const addSampleItems = useCallback(() => {
    const sampleItems: CuttingListItem[] = SAMPLE_ITEMS.map(item => ({
      ...item,
      id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workOrderId: item.workOrderId || `WO-${Date.now()}`,
      color: item.color || '#000000',
      version: item.version || '1.0',
      size: item.size || 'Standard',
      cuttingPattern: item.cuttingPattern || 'Düz'
    }));
    setCuttingList(prev => [...prev, ...sampleItems]);
  }, []);

  // Parameters management
  const updateParams = useCallback((updates: Partial<OptimizationParams>) => {
    setParams(prev => ({ ...prev, ...updates }));
  }, []);

  const updateConstraints = useCallback((constraintUpdates: Partial<OptimizationParams['constraints']>) => {
    setParams(prev => ({
      ...prev,
      constraints: { ...prev.constraints, ...constraintUpdates }
    }));
  }, []);

  const updateObjectives = useCallback((objectiveUpdates: OptimizationParams['objectives']) => {
    setParams(prev => ({
      ...prev,
      objectives: objectiveUpdates
    }));
  }, []);

  const addStockLength = useCallback((length: number) => {
    setParams(prev => ({
      ...prev,
      stockLengths: [...prev.stockLengths, length]
    }));
  }, []);

  const removeStockLength = useCallback((index: number) => {
    setParams(prev => ({
      ...prev,
      stockLengths: prev.stockLengths.filter((_, i) => i !== index)
    }));
  }, []);

  // Computed values
  const totalItems = useMemo(() => cuttingList.length, [cuttingList.length]);
  const totalQuantity = useMemo(() => 
    cuttingList.reduce((sum, item) => sum + item.quantity, 0), 
    [cuttingList]
  );

  return {
    // State
    cuttingList,
    params,
    
    // Item management
    addCuttingItem,
    updateCuttingItem,
    deleteCuttingItem,
    addSampleItems,
    
    // Parameters management
    updateParams,
    updateConstraints,
    updateObjectives,
    addStockLength,
    removeStockLength,
    
    // Computed values
    totalItems,
    totalQuantity
  };
};

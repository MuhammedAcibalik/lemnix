/**
 * Audit History Filters Hook
 * Manages filter state and query parameters for audit logs
 * 
 * @module widgets/audit-history/hooks
 * @version 1.0.0
 */

import { useState, useMemo, useCallback } from 'react';
import type { AuditFilterState, AuditSortConfig } from '../types';
import type { AuditLogQuery } from '@/entities/audit';

/**
 * Default filter state
 */
const DEFAULT_FILTERS: AuditFilterState = {
  action: 'all',
  severity: 'all',
  outcome: 'all',
  userId: '',
  dateRange: {
    startDate: null,
    endDate: null,
  },
  searchQuery: '',
};

/**
 * Default sort configuration
 */
const DEFAULT_SORT: AuditSortConfig = {
  field: 'timestamp',
  order: 'desc', // Newest first
};

/**
 * Hook: Manage audit log filters and query parameters
 * 
 * Single Responsibility: Filter state management
 * 
 * @returns Filter state and control functions
 */
export function useAuditFilters() {
  const [filters, setFilters] = useState<AuditFilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<AuditSortConfig>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  /**
   * Build API query from filter state
   * Memoized to prevent unnecessary re-renders
   */
  const apiQuery = useMemo<AuditLogQuery>(() => {
    return {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      ...(filters.action !== 'all' && { action: filters.action }),
      ...(filters.severity !== 'all' && { severity: filters.severity }),
      ...(filters.outcome !== 'all' && { outcome: filters.outcome }),
      ...(filters.userId.trim() && { userId: filters.userId.trim() }),
      ...(filters.dateRange.startDate && { startDate: filters.dateRange.startDate }),
      ...(filters.dateRange.endDate && { endDate: filters.dateRange.endDate }),
    } as AuditLogQuery;
  }, [filters, page, itemsPerPage]);

  /**
   * Update specific filter field
   */
  const updateFilter = useCallback(<K extends keyof AuditFilterState>(
    key: K,
    value: AuditFilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  }, []);

  /**
   * Reset all filters to default
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSort(DEFAULT_SORT);
    setPage(1);
  }, []);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.action !== 'all' ||
      filters.severity !== 'all' ||
      filters.outcome !== 'all' ||
      filters.userId.trim() !== '' ||
      filters.dateRange.startDate !== null ||
      filters.dateRange.endDate !== null ||
      filters.searchQuery.trim() !== ''
    );
  }, [filters]);

  /**
   * Update date range
   */
  const setDateRange = useCallback((startDate: string | null, endDate: string | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { startDate, endDate },
    }));
    setPage(1);
  }, []);

  /**
   * Update sort configuration
   */
  const updateSort = useCallback((field: AuditSortConfig['field']) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc',
    }));
  }, []);

  return {
    // State
    filters,
    sort,
    page,
    itemsPerPage,
    apiQuery,
    hasActiveFilters,
    
    // Actions
    updateFilter,
    resetFilters,
    setDateRange,
    updateSort,
    setPage,
    setItemsPerPage,
  };
}


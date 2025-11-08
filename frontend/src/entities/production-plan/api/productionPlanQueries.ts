/**
 * @fileoverview Production Plan React Query Hooks
 * @module entities/production-plan/api
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productionPlanApi } from './productionPlanApi';
import type {
  ProductionPlan,
  ProductionPlanFilters,
  ProductionPlanMetrics,
  UploadProductionPlanRequest,
  BackorderItem,
  ProductionPlanStatistics
} from '../model/types';

// Query Keys
export const productionPlanKeys = {
  all: ['production-plan'] as const,
  lists: () => [...productionPlanKeys.all, 'list'] as const,
  list: (filters: ProductionPlanFilters) => [...productionPlanKeys.lists(), filters] as const,
  details: () => [...productionPlanKeys.all, 'detail'] as const,
  detail: (id: string) => [...productionPlanKeys.details(), id] as const,
  byWeek: (weekNumber: number, year: number) => [...productionPlanKeys.all, 'week', weekNumber, year] as const,
  metrics: (filters: Pick<ProductionPlanFilters, 'weekNumber' | 'year' | 'status'>) => 
    [...productionPlanKeys.all, 'metrics', filters] as const,
  workOrderItems: (workOrderId: string) => [...productionPlanKeys.all, 'work-order', workOrderId] as const,
  backorder: (filters: ProductionPlanFilters) => [...productionPlanKeys.all, 'backorder', filters] as const,
  statistics: (filters: ProductionPlanFilters) => [...productionPlanKeys.all, 'statistics', filters] as const,
} as const;

// Queries
export const useProductionPlans = (filters: ProductionPlanFilters = {}) => {
  return useQuery({
    queryKey: productionPlanKeys.list(filters),
    queryFn: () => productionPlanApi.getProductionPlans(filters),
    staleTime: 5 * 60 * 1000, // ✅ PERFORMANCE: 5 minutes stale time
    gcTime: 10 * 60 * 1000, // ✅ PERFORMANCE: 10 minutes garbage collection
    refetchOnMount: false, // ✅ PERFORMANCE: Don't refetch on mount if data is fresh
    refetchOnWindowFocus: false, // ✅ PERFORMANCE: Don't refetch on window focus
    refetchOnReconnect: true, // Keep refetch on reconnect for data consistency
    retry: 2, // ✅ PERFORMANCE: Retry twice on network errors
    enabled: true,
    // ✅ PERFORMANCE: Use cache when possible
    meta: {
      forceRefresh: false,
      source: 'optimized-cache'
    }
  });
};

export const useProductionPlan = (id: string) => {
  return useQuery({
    queryKey: productionPlanKeys.detail(id),
    queryFn: () => productionPlanApi.getProductionPlanById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useProductionPlanByWeek = (weekNumber: number, year: number) => {
  return useQuery({
    queryKey: productionPlanKeys.byWeek(weekNumber, year),
    queryFn: () => productionPlanApi.getProductionPlanByWeek(weekNumber, year),
    enabled: !!weekNumber && !!year,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useProductionPlanMetrics = (
  filters: Pick<ProductionPlanFilters, 'weekNumber' | 'year' | 'status'> = {}
) => {
  return useQuery({
    queryKey: productionPlanKeys.metrics(filters),
    queryFn: () => productionPlanApi.getProductionPlanMetrics(filters),
    staleTime: 5 * 60 * 1000, // ✅ PERFORMANCE: 5 minutes stale time
    gcTime: 10 * 60 * 1000, // ✅ PERFORMANCE: 10 minutes garbage collection
    refetchOnMount: false, // ✅ PERFORMANCE: Don't refetch on mount if data is fresh
    refetchOnWindowFocus: false, // ✅ PERFORMANCE: Don't refetch on window focus
  });
};

export const useProductionPlanItemsByWorkOrder = (workOrderId: string) => {
  return useQuery({
    queryKey: productionPlanKeys.workOrderItems(workOrderId),
    queryFn: () => productionPlanApi.getProductionPlanItemsByWorkOrder(workOrderId),
    enabled: !!workOrderId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Mutations
export const useUploadProductionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UploadProductionPlanRequest) => 
      productionPlanApi.uploadProductionPlan(request.file),
    onSuccess: (data) => {
      console.log('✅ [UploadProductionPlan] Upload successful, invalidating cache...', data);
      
      // Invalidate all production plan queries (this will trigger refetch)
      queryClient.invalidateQueries({ queryKey: productionPlanKeys.all });
      
      // Force refetch the main list query
      queryClient.refetchQueries({ queryKey: productionPlanKeys.lists() });
      queryClient.refetchQueries({ queryKey: productionPlanKeys.metrics({}) });
      
      console.log('✅ [UploadProductionPlan] Cache invalidated and refetched');
    },
    onError: (error) => {
      console.error('Upload production plan error:', error);
    },
  });
};

export const useDeleteProductionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productionPlanApi.deleteProductionPlan(id),
    onSuccess: (data, id) => {
      // Invalidate all production plan queries
      queryClient.invalidateQueries({ queryKey: productionPlanKeys.all });
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: productionPlanKeys.detail(id) });
    },
    onError: (error) => {
      console.error('Delete production plan error:', error);
    },
  });
};

// Prefetch utilities
export const usePrefetchProductionPlan = () => {
  const queryClient = useQueryClient();

  const prefetchProductionPlan = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: productionPlanKeys.detail(id),
      queryFn: () => productionPlanApi.getProductionPlanById(id),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchProductionPlanByWeek = (weekNumber: number, year: number) => {
    queryClient.prefetchQuery({
      queryKey: productionPlanKeys.byWeek(weekNumber, year),
      queryFn: () => productionPlanApi.getProductionPlanByWeek(weekNumber, year),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    prefetchProductionPlan,
    prefetchProductionPlanByWeek,
  };
};

// New mutations for cutting list creation
export const useCreateCuttingListFromPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: {
      productionPlanItems: Array<{
        planItemId: string;
        profileType: string;
        length: number;
        quantity: number;
      }>;
      cuttingListMetadata: {
        name: string;
        description?: string;
      };
    }) => productionPlanApi.createCuttingListFromPlan(request),
    onSuccess: (data) => {
      // Invalidate production plan queries to refresh data
      queryClient.invalidateQueries({ queryKey: productionPlanKeys.all });
      
      // If successful, we could also invalidate cutting list queries if they exist
      // queryClient.invalidateQueries({ queryKey: ['cutting-list'] });
    },
    onError: (error) => {
      console.error('Create cutting list from plan error:', error);
    },
  });
};

export const useGetLinkedPlanItems = (cuttingListId: string) => {
  return useQuery({
    queryKey: [...productionPlanKeys.all, 'linked-items', cuttingListId],
    queryFn: () => productionPlanApi.getLinkedPlanItems(cuttingListId),
    enabled: !!cuttingListId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUnlinkPlanItemFromCuttingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planItemId: string) => 
      productionPlanApi.unlinkPlanItemFromCuttingList(planItemId),
    onSuccess: () => {
      // Invalidate production plan queries to refresh data
      queryClient.invalidateQueries({ queryKey: productionPlanKeys.all });
    },
    onError: (error) => {
      console.error('Unlink plan item from cutting list error:', error);
    },
  });
};

// Backorder queries
export const useBackorderItems = (filters: ProductionPlanFilters = {}) => {
  return useQuery({
    queryKey: productionPlanKeys.backorder(filters),
    queryFn: () => productionPlanApi.getBackorderItems(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    enabled: true,
  });
};

// Statistics queries
export const useProductionPlanStatistics = (filters: ProductionPlanFilters = {}) => {
  return useQuery({
    queryKey: productionPlanKeys.statistics(filters),
    queryFn: () => productionPlanApi.getStatistics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    enabled: true,
  });
};

/**
 * @fileoverview React Query Hooks for Suggestions
 * @module entities/suggestions/api
 * @version 1.0.0
 * 
 * React Query hooks with proper caching and error handling
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { suggestionApi, SmartSuggestion, ProfileSuggestion, CombinationSuggestion, SuggestionStatistics } from './suggestionApi';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const suggestionKeys = {
  all: ['suggestions'] as const,
  products: (query: string) => [...suggestionKeys.all, 'products', query] as const,
  sizes: (product: string, query: string) => [...suggestionKeys.all, 'sizes', product, query] as const,
  profiles: (product: string, size: string, query: string) => 
    [...suggestionKeys.all, 'profiles', product, size, query] as const,
  combinations: (product: string, size: string) => 
    [...suggestionKeys.all, 'combinations', product, size] as const,
  statistics: () => [...suggestionKeys.all, 'statistics'] as const,
  health: () => [...suggestionKeys.all, 'health'] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get product suggestions
 */
export const useProductSuggestions = (
  query: string,
  limit: number = 10,
  enabled: boolean = true
): UseQueryResult<SmartSuggestion[], unknown> => {
  return useQuery({
    queryKey: suggestionKeys.products(query),
    queryFn: () => suggestionApi.getProducts(query, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: enabled && query.length > 0,
    retry: (failureCount, error: unknown) => {
      if ((error as { response?: { status?: number } })?.response?.status === 401) return false;
      return failureCount < 3;
    }
  });
};

/**
 * Get size suggestions
 */
export const useSizeSuggestions = (
  productName: string,
  query: string = '',
  limit: number = 10,
  enabled: boolean = true
): UseQueryResult<SmartSuggestion[], unknown> => {
  return useQuery({
    queryKey: suggestionKeys.sizes(productName, query),
    queryFn: () => suggestionApi.getSizes(productName, query, limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: enabled && !!productName,
    retry: (failureCount, error: unknown) => {
      if ((error as { response?: { status?: number } })?.response?.status === 401) return false;
      return failureCount < 3;
    }
  });
};

/**
 * Get profile suggestions
 */
export const useProfileSuggestions = (
  productName: string,
  size: string,
  query: string = '',
  limit: number = 10,
  enabled: boolean = true
): UseQueryResult<ProfileSuggestion[], unknown> => {
  return useQuery({
    queryKey: suggestionKeys.profiles(productName, size, query),
    queryFn: () => suggestionApi.getProfiles(productName, size, query, limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: enabled && !!productName && !!size,
    retry: (failureCount, error: unknown) => {
      if ((error as { response?: { status?: number } })?.response?.status === 401) return false;
      return failureCount < 3;
    }
  });
};

/**
 * Get profile combinations
 */
export const useCombinationSuggestions = (
  productName: string,
  size: string,
  limit: number = 5,
  enabled: boolean = true
): UseQueryResult<CombinationSuggestion[], unknown> => {
  return useQuery({
    queryKey: suggestionKeys.combinations(productName, size),
    queryFn: () => suggestionApi.getCombinations(productName, size, limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: enabled && !!productName && !!size,
    retry: (failureCount, error: unknown) => {
      if ((error as { response?: { status?: number } })?.response?.status === 401) return false;
      return failureCount < 3;
    }
  });
};

/**
 * Get suggestion statistics
 */
export const useSuggestionStatistics = (
  enabled: boolean = true
): UseQueryResult<SuggestionStatistics, Error> => {
  return useQuery({
    queryKey: suggestionKeys.statistics(),
    queryFn: () => suggestionApi.getStatistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    enabled,
    retry: 2
  });
};

/**
 * Health check
 */
export const useSuggestionHealth = (
  enabled: boolean = true
): UseQueryResult<{ status: string; totalPatterns: number }, Error> => {
  return useQuery({
    queryKey: suggestionKeys.health(),
    queryFn: () => suggestionApi.healthCheck(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000,
    enabled,
    retry: 1
  });
};

/**
 * Apply smart suggestion with one click
 * 
 * This is the MAGIC feature:
 * User selects product, size, enters orderQuantity
 * → System automatically fills ALL profiles with correct quantities
 */
export const useApplySmartSuggestion = () => {
  return {
    applyAsync: async (productName: string, size: string, orderQuantity: number) => {
      return await suggestionApi.applySmartSuggestion(productName, size, orderQuantity);
    }
  };
};


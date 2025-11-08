/**
 * @fileoverview Suggestion API Client
 * @module entities/suggestions/api
 * @version 1.0.0
 * 
 * Centralized API client for smart suggestions
 * Follows FSD architecture pattern
 */

import { apiClient } from '@/shared/api/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SmartSuggestion {
  readonly type: 'product' | 'size' | 'profile' | 'combination';
  readonly value: string;
  readonly confidence: number;
  readonly frequency: number;
  readonly reasoning: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ProfileSuggestion {
  readonly profile: string;
  readonly measurement: string;
  readonly suggestedQuantity: number;
  readonly confidence: number;
  readonly reasoning: string;
  readonly alternatives: readonly AlternativeSuggestion[];
}

export interface AlternativeSuggestion {
  readonly profile: string;
  readonly measurement: string;
  readonly quantity: number;
  readonly confidence: number;
  readonly reason: string;
}

export interface CombinationSuggestion {
  readonly productName: string;
  readonly size: string;
  readonly profiles: readonly {
    readonly profile: string;
    readonly measurement: string;
    readonly ratio: number;
    readonly confidence: number;
  }[];
  readonly totalConfidence: number;
  readonly reasoning: string;
}

export interface SuggestionStatistics {
  readonly totalPatterns: number;
  readonly highConfidence: number;
  readonly mediumConfidence: number;
  readonly lowConfidence: number;
  readonly averageConfidence: number;
  readonly uniqueProducts: number;
  readonly recentActivity: number;
}

interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly metadata?: Record<string, unknown>;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const suggestionApi = {
  /**
   * Get product suggestions
   */
  getProducts: async (query: string = '', limit: number = 10): Promise<SmartSuggestion[]> => {
    const response = await apiClient.get<ApiResponse<SmartSuggestion[]>>(
      '/suggestions/products',
      { params: { query, limit } }
    );
    return response.data.data || [];
  },

  /**
   * Get size suggestions for a product
   */
  getSizes: async (productName: string, query: string = '', limit: number = 10): Promise<SmartSuggestion[]> => {
    const response = await apiClient.get<ApiResponse<SmartSuggestion[]>>(
      '/suggestions/sizes',
      { params: { product: productName, query, limit } }
    );
    return response.data.data || [];
  },

  /**
   * Get profile suggestions
   */
  getProfiles: async (
    productName: string,
    size: string,
    query: string = '',
    limit: number = 10
  ): Promise<ProfileSuggestion[]> => {
    const response = await apiClient.get<ApiResponse<ProfileSuggestion[]>>(
      '/suggestions/profiles',
      { params: { product: productName, size, query, limit } }
    );
    return response.data.data || [];
  },

  /**
   * Get profile combinations
   */
  getCombinations: async (
    productName: string,
    size: string,
    limit: number = 5
  ): Promise<CombinationSuggestion[]> => {
    const response = await apiClient.get<ApiResponse<CombinationSuggestion[]>>(
      '/suggestions/combinations',
      { params: { product: productName, size, limit } }
    );
    return response.data.data || [];
  },

  /**
   * Get suggestion statistics
   */
  getStatistics: async (): Promise<SuggestionStatistics> => {
    const response = await apiClient.get<ApiResponse<SuggestionStatistics>>(
      '/suggestions/statistics'
    );
    return response.data.data || {
      totalPatterns: 0,
      highConfidence: 0,
      mediumConfidence: 0,
      lowConfidence: 0,
      averageConfidence: 0,
      uniqueProducts: 0,
      recentActivity: 0
    };
  },

  /**
   * Health check
   */
  healthCheck: async (): Promise<{ status: string; totalPatterns: number }> => {
    const response = await apiClient.get<ApiResponse<{ status: string; totalPatterns: number }>>(
      '/suggestions/health'
    );
    return response.data.data || { status: 'unknown', totalPatterns: 0 };
  },

  /**
   * Apply smart suggestion - ONE-CLICK magic
   * Returns complete profiles with calculated quantities
   */
  applySmartSuggestion: async (
    productName: string,
    size: string,
    orderQuantity: number
  ): Promise<{
    profiles: Array<{
      profile: string;
      measurement: string;
      quantity: number;
      confidence: number;
      reasoning: string;
    }>;
    totalConfidence: number;
    reasoning: string;
  }> => {
    const response = await apiClient.post<ApiResponse<{
      profiles: Array<{
        profile: string;
        measurement: string;
        quantity: number;
        confidence: number;
        reasoning: string;
      }>;
      totalConfidence: number;
      reasoning: string;
    }>>('/suggestions/apply', {
      product: productName,
      size,
      orderQuantity
    });
    
    return response.data.data || {
      profiles: [],
      totalConfidence: 0,
      reasoning: 'No data'
    };
  }
};


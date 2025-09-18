import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

/**
 * Enterprise-Grade Smart Suggestions Hook
 * 
 * Bu hook akıllı öneriler için gelişmiş bir arayüz sağlar:
 * - Auto-complete önerileri
 * - Context-aware suggestions
 * - Confidence scoring
 * - Debouncing ve caching
 * - Real-time suggestions
 */

const API_BASE_URL = 'http://localhost:3001/api/cutting-list';

// Types
export interface SmartSuggestion {
  type: 'product' | 'size' | 'profile' | 'color' | 'measurement';
  value: string;
  confidence: number;
  frequency: number;
  context?: {
    relatedProducts?: string[];
    relatedSizes?: string[];
    relatedProfiles?: string[];
    relatedColors?: string[];
    averageQuantity?: number;
  };
  reasoning: string;
}

export interface SmartSuggestionResponse {
  success: boolean;
  data: SmartSuggestion[];
  confidence: 'high' | 'medium' | 'low';
  totalSuggestions: number;
  message?: string;
}

export interface AutoCompleteSuggestion {
  value: string;
  type: 'product' | 'size' | 'profile' | 'color' | 'measurement';
  frequency: number;
  confidence: number;
  preview?: string;
}

export interface ProfileSuggestionItem {
  profile: string;
  suggestedQuantity: number;
  confidence: number;
  frequency: number;
  reasoning: string;
}

export interface ProfileSuggestionResponse {
  success: boolean;
  data: ProfileSuggestionItem[];
  totalSuggestions: number;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

// Hook state
interface UseSmartSuggestionsState {
  // Product suggestions
  productSuggestions: SmartSuggestion[];
  productLoading: boolean;
  productError: string | null;
  
  // Size suggestions
  sizeSuggestions: SmartSuggestion[];
  sizeLoading: boolean;
  sizeError: string | null;
  
  // Profile suggestions
  profileSuggestions: ProfileSuggestionItem[];
  profileLoading: boolean;
  profileError: string | null;
  
  // Auto-complete suggestions
  autoCompleteSuggestions: AutoCompleteSuggestion[];
  autoCompleteLoading: boolean;
  autoCompleteError: string | null;
  
  // General
  isLoading: boolean;
  error: string | null;
}

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const useSmartSuggestions = () => {
  // State
  const [state, setState] = useState<UseSmartSuggestionsState>({
    productSuggestions: [],
    productLoading: false,
    productError: null,
    
    sizeSuggestions: [],
    sizeLoading: false,
    sizeError: null,
    
    profileSuggestions: [],
    profileLoading: false,
    profileError: null,
    
    autoCompleteSuggestions: [],
    autoCompleteLoading: false,
    autoCompleteError: null,
    
    isLoading: false,
    error: null
  });
  
  // Caching
  const cache = useRef(new Map<string, CacheEntry<any>>());
  const debounceTimers = useRef(new Map<string, number>());
  
  // Cache utilities
  const getCacheKey = (type: string, params: Record<string, any>) => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    
    return `${type}:${JSON.stringify(sortedParams)}`;
  };
  
  const getFromCache = <T>(key: string): T | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.timestamp + entry.ttl) {
      cache.current.delete(key);
      return null;
    }
    
    return entry.data;
  };
  
  const setCache = <T>(key: string, data: T, ttl: number = 5 * 60 * 1000) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  };
  
  const clearCache = () => {
    cache.current.clear();
  };
  
  // Debounce utility
  const debounce = (key: string, fn: () => void, delay: number = 300) => {
    const existingTimer = debounceTimers.current.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const timer = setTimeout(fn, delay);
    debounceTimers.current.set(key, timer);
  };
  
  // Product suggestions
  const getProductSuggestions = useCallback(async (
    query: string = '',
    limit: number = 10,
    useDebounce: boolean = true
  ) => {
    const params = { query: query.trim(), limit };
    const cacheKey = getCacheKey('products', params);
    
    // Check cache first
    const cached = getFromCache<SmartSuggestionResponse>(cacheKey);
    if (cached) {
      setState(prev => ({
        ...prev,
        productSuggestions: cached.data,
        productError: null
      }));
      return cached.data;
    }
    
    const fetchSuggestions = async () => {
      setState(prev => ({
        ...prev,
        productLoading: true,
        productError: null,
        isLoading: true
      }));
      
      try {
        const response = await axios.get(`${API_BASE_URL}/smart/products`, {
          params,
          headers: {
            'x-request-id': `smart-products-${Date.now()}`
          }
        });
        
        if (response.data.success) {
          const suggestions = response.data.data.data || [];
          
          // Cache the results
          setCache(cacheKey, response.data.data);
          
          setState(prev => ({
            ...prev,
            productSuggestions: suggestions,
            productLoading: false,
            productError: null,
            isLoading: false
          }));
          
          return suggestions;
        } else {
          throw new Error(response.data.error || 'Failed to get product suggestions');
        }
        
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
        
        setState(prev => ({
          ...prev,
          productSuggestions: [],
          productLoading: false,
          productError: errorMessage,
          isLoading: false,
          error: errorMessage
        }));
        
        console.error('Product suggestions error:', error);
        return [];
      }
    };
    
    if (useDebounce && query.length > 0) {
      debounce('products', fetchSuggestions);
    } else {
      return await fetchSuggestions();
    }
  }, []);
  
  // Size suggestions
  const getSizeSuggestions = useCallback(async (
    productName?: string,
    query: string = '',
    limit: number = 10,
    useDebounce: boolean = true
  ) => {
    const params = { productName, query: query.trim(), limit };
    const cacheKey = getCacheKey('sizes', params);
    
    // Check cache first
    const cached = getFromCache<SmartSuggestionResponse>(cacheKey);
    if (cached) {
      setState(prev => ({
        ...prev,
        sizeSuggestions: cached.data,
        sizeError: null
      }));
      return cached.data;
    }
    
    const fetchSuggestions = async () => {
      setState(prev => ({
        ...prev,
        sizeLoading: true,
        sizeError: null,
        isLoading: true
      }));
      
      try {
        const response = await axios.get(`${API_BASE_URL}/smart/sizes`, {
          params,
          headers: {
            'x-request-id': `smart-sizes-${Date.now()}`
          }
        });
        
        if (response.data.success) {
          const suggestions = response.data.data.data || [];
          
          // Cache the results
          setCache(cacheKey, response.data.data);
          
          setState(prev => ({
            ...prev,
            sizeSuggestions: suggestions,
            sizeLoading: false,
            sizeError: null,
            isLoading: false
          }));
          
          return suggestions;
        } else {
          throw new Error(response.data.error || 'Failed to get size suggestions');
        }
        
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
        
        setState(prev => ({
          ...prev,
          sizeSuggestions: [],
          sizeLoading: false,
          sizeError: errorMessage,
          isLoading: false,
          error: errorMessage
        }));
        
        console.error('Size suggestions error:', error);
        return [];
      }
    };
    
    if (useDebounce && query.length > 0) {
      debounce('sizes', fetchSuggestions);
    } else {
      return await fetchSuggestions();
    }
  }, []);
  
  // Profile suggestions
  const getProfileSuggestions = useCallback(async (
    productName?: string,
    size?: string,
    query: string = '',
    limit: number = 10,
    useDebounce: boolean = true
  ) => {
    const params = { productName, size, query: query.trim(), limit };
    const cacheKey = getCacheKey('profiles', params);
    
    // Check cache first
    const cached = getFromCache<ProfileSuggestionResponse>(cacheKey);
    if (cached) {
      setState(prev => ({
        ...prev,
        profileSuggestions: cached.data,
        profileError: null
      }));
      return cached.data;
    }
    
    const fetchSuggestions = async () => {
      setState(prev => ({
        ...prev,
        profileLoading: true,
        profileError: null,
        isLoading: true
      }));
      
      try {
        const response = await axios.get(`${API_BASE_URL}/smart/profiles`, {
          params,
          headers: {
            'x-request-id': `smart-profiles-${Date.now()}`
          }
        });
        
        if (response.data.success) {
          const suggestions = response.data.data.data || [];
          
          // Cache the results
          setCache(cacheKey, response.data.data);
          
          setState(prev => ({
            ...prev,
            profileSuggestions: suggestions,
            profileLoading: false,
            profileError: null,
            isLoading: false
          }));
          
          return suggestions;
        } else {
          throw new Error(response.data.error || 'Failed to get profile suggestions');
        }
        
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
        
        setState(prev => ({
          ...prev,
          profileSuggestions: [],
          profileLoading: false,
          profileError: errorMessage,
          isLoading: false,
          error: errorMessage
        }));
        
        console.error('Profile suggestions error:', error);
        return [];
      }
    };
    
    if (useDebounce && query.length > 0) {
      debounce('profiles', fetchSuggestions);
    } else {
      return await fetchSuggestions();
    }
  }, []);
  
  // Auto-complete suggestions
  const getAutoCompleteSuggestions = useCallback(async (
    type: 'product' | 'size' | 'profile' | 'color' | 'measurement',
    query: string,
    limit: number = 5,
    useDebounce: boolean = true
  ) => {
    if (!query.trim()) {
      setState(prev => ({
        ...prev,
        autoCompleteSuggestions: [],
        autoCompleteError: null
      }));
      return [];
    }
    
    const params = { type, query: query.trim(), limit };
    const cacheKey = getCacheKey('autocomplete', params);
    
    // Check cache first
    const cached = getFromCache<AutoCompleteSuggestion[]>(cacheKey);
    if (cached) {
      setState(prev => ({
        ...prev,
        autoCompleteSuggestions: cached,
        autoCompleteError: null
      }));
      return cached;
    }
    
    const fetchSuggestions = async () => {
      setState(prev => ({
        ...prev,
        autoCompleteLoading: true,
        autoCompleteError: null,
        isLoading: true
      }));
      
      try {
        const response = await axios.get(`${API_BASE_URL}/smart/autocomplete`, {
          params,
          headers: {
            'x-request-id': `smart-autocomplete-${Date.now()}`
          }
        });
        
        if (response.data.success) {
          const suggestions = response.data.data || [];
          
          // Cache the results
          setCache(cacheKey, suggestions, 2 * 60 * 1000); // 2 minutes cache for autocomplete
          
          setState(prev => ({
            ...prev,
            autoCompleteSuggestions: suggestions,
            autoCompleteLoading: false,
            autoCompleteError: null,
            isLoading: false
          }));
          
          return suggestions;
        } else {
          throw new Error(response.data.error || 'Failed to get auto-complete suggestions');
        }
        
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
        
        setState(prev => ({
          ...prev,
          autoCompleteSuggestions: [],
          autoCompleteLoading: false,
          autoCompleteError: errorMessage,
          isLoading: false,
          error: errorMessage
        }));
        
        console.error('Auto-complete suggestions error:', error);
        return [];
      }
    };
    
    if (useDebounce) {
      debounce(`autocomplete-${type}`, fetchSuggestions, 200); // Faster debounce for autocomplete
    } else {
      return await fetchSuggestions();
    }
  }, []);
  
  // Get database statistics
  const getStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/smart/stats`, {
        headers: {
          'x-request-id': `smart-stats-${Date.now()}`
        }
      });
      
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to get stats');
      }
      
    } catch (error: any) {
      console.error('Smart suggestions stats error:', error);
      return null;
    }
  }, []);
  
  // Reload database
  const reloadDatabase = useCallback(async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/smart/reload`, {}, {
        headers: {
          'x-request-id': `smart-reload-${Date.now()}`
        }
      });
      
      if (response.data.success) {
        clearCache(); // Clear cache after reload
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to reload database');
      }
      
    } catch (error: any) {
      console.error('Smart suggestions reload error:', error);
      return false;
    }
  }, []);
  
  // Clear all suggestions
  const clearSuggestions = useCallback(() => {
    setState(prev => ({
      ...prev,
      productSuggestions: [],
      sizeSuggestions: [],
      profileSuggestions: [],
      autoCompleteSuggestions: [],
      productError: null,
      sizeError: null,
      profileError: null,
      autoCompleteError: null,
      error: null
    }));
  }, []);
  
  return {
    // State
    ...state,
    
    // Actions
    getProductSuggestions,
    getSizeSuggestions,
    getProfileSuggestions,
    getAutoCompleteSuggestions,
    getStats,
    reloadDatabase,
    clearSuggestions,
    clearCache,
    
    // Utilities
    hasProductSuggestions: state.productSuggestions.length > 0,
    hasSizeSuggestions: state.sizeSuggestions.length > 0,
    hasProfileSuggestions: state.profileSuggestions.length > 0,
    hasAutoCompleteSuggestions: state.autoCompleteSuggestions.length > 0,
    
    // Confidence helpers
    getHighConfidenceProducts: () => state.productSuggestions.filter(s => s.confidence >= 80),
    getMediumConfidenceProducts: () => state.productSuggestions.filter(s => s.confidence >= 60 && s.confidence < 80),
    getLowConfidenceProducts: () => state.productSuggestions.filter(s => s.confidence < 60),
    
    getHighConfidenceProfiles: () => state.profileSuggestions.filter(s => s.confidence >= 80),
    getMediumConfidenceProfiles: () => state.profileSuggestions.filter(s => s.confidence >= 60 && s.confidence < 80),
    getLowConfidenceProfiles: () => state.profileSuggestions.filter(s => s.confidence < 60)
  };
};

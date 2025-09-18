import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ProfileSuggestion {
  profile: string;
  measurement: string;
  frequency: number;
  confidence: number;
}

interface SimilarProduct {
  id: string;
  name: string;
}

interface ProductSizeSuggestion {
  productName: string;
  size: string;
  suggestions: ProfileSuggestion[];
  totalOccurrences: number;
}

interface DatabaseStats {
  totalProductSizeCombinations: number;
  totalProfiles: number;
  mostCommonProduct: string;
  mostCommonSize: string;
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export const useProfileSuggestions = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [productSizes, setProductSizes] = useState<string[]>([]);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);

  /**
   * Get profile suggestions for a product and size
   */
  const getProfileSuggestions = useCallback(async (productName: string, size: string, limit: number = 5) => {
    if (!productName.trim() || !size.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:3001/api/cutting-list/suggestions/profiles', {
        params: { productName, size, limit }
      });

      if (response.data.success) {
        setSuggestions(response.data.data.suggestions);
      } else {
        setError(response.data.error || 'Profil önerileri alınamadı');
        setSuggestions([]);
      }
    } catch (err: any) {
      console.error('Error getting profile suggestions:', err);
      setError('Profil önerileri alınırken hata oluştu');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search for similar products
   */
  const searchSimilarProducts = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSimilarProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:3001/api/cutting-list/suggestions/products', {
        params: { searchTerm }
      });

      if (response.data.success) {
        setSimilarProducts(response.data.data.products);
      } else {
        setError(response.data.error || 'Ürün arama yapılamadı');
        setSimilarProducts([]);
      }
    } catch (err: any) {
      console.error('Error searching products:', err);
      setError('Ürün arama sırasında hata oluştu');
      setSimilarProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get sizes for a specific product
   */
  const getSizesForProduct = useCallback(async (productName: string) => {
    if (!productName.trim()) {
      setProductSizes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:3001/api/cutting-list/suggestions/sizes', {
        params: { productName }
      });

      if (response.data.success) {
        setProductSizes(response.data.data.sizes);
      } else {
        setError(response.data.error || 'Ürün boyutları alınamadı');
        setProductSizes([]);
      }
    } catch (err: any) {
      console.error('Error getting product sizes:', err);
      setError('Ürün boyutları alınırken hata oluştu');
      setProductSizes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get database statistics
   */
  const getDatabaseStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:3001/api/cutting-list/suggestions/stats');

      if (response.data.success) {
        setDatabaseStats(response.data.data.stats);
      } else {
        setError(response.data.error || 'Veritabanı istatistikleri alınamadı');
      }
    } catch (err: any) {
      console.error('Error getting database stats:', err);
      setError('Veritabanı istatistikleri alınırken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear suggestions
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setSimilarProducts([]);
    setProductSizes([]);
    setError(null);
  }, []);

  /**
   * Apply suggestion to form
   */
  const applySuggestion = useCallback((suggestion: ProfileSuggestion) => {
    return {
      profile: suggestion.profile,
      measurement: suggestion.measurement,
      quantity: '1' // Default quantity
    };
  }, []);

  return {
    // State
    loading,
    error,
    suggestions,
    similarProducts,
    productSizes,
    databaseStats,

    // Actions
    getProfileSuggestions,
    searchSimilarProducts,
    getSizesForProduct,
    getDatabaseStats,
    clearSuggestions,
    applySuggestion
  };
};

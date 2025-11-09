/**
 * @fileoverview Product Categories Analysis Service
 * @module ProductCategoriesService
 * @version 1.2.0 - Fixed internal API calls with proper mock auth
 */

import { prisma } from '../../config/database';
import { logger } from '../logger';

// Type definitions for cutting list data
interface CuttingListSection {
  id: string;
  productName: string;
  items: CuttingListItem[];
  createdAt: string;
  updatedAt: string;
}

interface CuttingListItem {
  id: string;
  workOrderId: string;
  date: string;
  version: string;
  color: string;
  size: string;
  profileType: string;
  measurement: string;
  quantity: number;
  orderQuantity: number;
  status?: string;
  priority?: string;
}

interface CuttingListData {
  id: string;
  title: string;
  weekNumber: number;
  sections: CuttingListSection[];
  createdAt: string;
  updatedAt: string;
}
import axios from 'axios';

interface ProductCategory {
  name: string;
  itemCount: number;
  totalQuantity: number;
}

interface CategoryPerformance {
  category: string;
  efficiency: number;
  wastePercentage: number;
}

interface ProductCategoryExtended extends ProductCategory {
  listCount: number;
  percentage: string;
}

interface ProductCategoriesAnalysis {
  totalCategories: number;
  categories: ProductCategoryExtended[];
  averageItemsPerCategory: number;
  mostActiveCategory: string;
  categoryPerformance: CategoryPerformance[];
}

interface CuttingListSection {
  productName: string;
  items: CuttingListItem[];
}

interface CuttingListItem {
  orderQuantity: number;
}

interface CuttingListData {
  sections: CuttingListSection[];
}

// Backend internal API base URL
const INTERNAL_API_BASE = 'http://localhost:3001/api';

// Mock token for internal service-to-service communication (dev environment)
const INTERNAL_AUTH_TOKEN = process.env.NODE_ENV === 'development' ? 'mock-dev-token-internal-service' : '';

export class ProductCategoriesService {
  /**
   * Get product categories analysis
   */
  public async getProductCategoriesAnalysis(cuttingListId?: string): Promise<ProductCategoriesAnalysis> {
    try {
      let categoryStats: ProductCategoriesAnalysis = {
        totalCategories: 0,
        categories: [],
        averageItemsPerCategory: 0,
        mostActiveCategory: 'Bilinmiyor',
        categoryPerformance: []
      };

      if (cuttingListId) {
        const cuttingListResponse = await axios.get<{ success: boolean; data: unknown }>(
          `${INTERNAL_API_BASE}/cutting-list/${cuttingListId}`,
          {
            headers: {
              Authorization: `Bearer ${INTERNAL_AUTH_TOKEN}`
            }
          }
        );
        const cuttingListData = cuttingListResponse.data;
        
        if (cuttingListData.success && cuttingListData.data) {
          const cuttingList = cuttingListData.data as Record<string, unknown>;
          const sections = (cuttingList.sections as unknown[] | undefined) || [];
          
          const categoryStats_temp: Record<string, { items: number; totalQuantity: number }> = {};
          
          (sections as CuttingListSection[]).forEach((section: CuttingListSection) => {
            const categoryName = section.productName || 'Bilinmiyor';
            const itemCount = section.items ? section.items.length : 0;
            const totalQuantity = section.items ? section.items.reduce((sum: number, item: CuttingListItem) => sum + (item.orderQuantity || 0), 0) : 0;
            
            if (!categoryStats_temp[categoryName]) {
              categoryStats_temp[categoryName] = { items: 0, totalQuantity: 0 };
            }
            categoryStats_temp[categoryName].items += itemCount;
            categoryStats_temp[categoryName].totalQuantity += totalQuantity;
          });
          
          const totalItems = Object.values(categoryStats_temp).reduce((sum, cat) => sum + cat.items, 0);
          
          categoryStats.categories = Object.entries(categoryStats_temp).map(([name, stats]) => ({
            name,
            itemCount: stats.items,
            totalQuantity: stats.totalQuantity,
            percentage: ((stats.items / totalItems) * 100).toFixed(1)
          }));
          
          categoryStats.totalCategories = Object.keys(categoryStats_temp).length;
          categoryStats.averageItemsPerCategory = categoryStats.totalCategories > 0 ? parseFloat((totalItems / categoryStats.totalCategories).toFixed(1)) : 0;
          categoryStats.mostActiveCategory = Object.entries(categoryStats_temp).sort(([,a], [,b]) => b.items - a.items)[0]?.[0] || 'Bilinmiyor';
          
          categoryStats.categoryPerformance = categoryStats.categories.map(category => ({
            category: category.name,
            efficiency: 0, // Default value
            wastePercentage: 0 // Default value
          })).sort((a, b) => {
            const aCategory = categoryStats.categories.find(c => c.name === a.category);
            const bCategory = categoryStats.categories.find(c => c.name === b.category);
            return (bCategory?.itemCount || 0) - (aCategory?.itemCount || 0);
          });
        }
      } else {
        const allListsResponse = await axios.get<{ success: boolean; data: unknown[] }>(
          `${INTERNAL_API_BASE}/cutting-list`,
          {
            headers: {
              Authorization: `Bearer ${INTERNAL_AUTH_TOKEN}`
            }
          }
        );
        const allListsData = allListsResponse.data;
        
        if (allListsData.success && allListsData.data) {
          const cuttingLists = allListsData.data;
          
          const categoryStats_temp: Record<string, { items: number; totalQuantity: number; lists: number }> = {};
          
          (cuttingLists as CuttingListData[]).forEach((list: CuttingListData) => {
            const sections = list.sections || [];
            (sections as CuttingListSection[]).forEach((section: CuttingListSection) => {
              const categoryName = section.productName || 'Bilinmiyor';
              const itemCount = section.items ? section.items.length : 0;
              const totalQuantity = section.items ? section.items.reduce((sum: number, item: CuttingListItem) => sum + (item.orderQuantity || 0), 0) : 0;
              
              if (!categoryStats_temp[categoryName]) {
                categoryStats_temp[categoryName] = { items: 0, totalQuantity: 0, lists: 0 };
              }
              categoryStats_temp[categoryName].items += itemCount;
              categoryStats_temp[categoryName].totalQuantity += totalQuantity;
              categoryStats_temp[categoryName].lists += 1;
            });
          });
          
          const totalItems = Object.values(categoryStats_temp).reduce((sum, cat) => sum + cat.items, 0);
          
          categoryStats.categories = Object.entries(categoryStats_temp).map(([name, stats]) => ({
            name,
            itemCount: stats.items,
            totalQuantity: stats.totalQuantity,
            listCount: stats.lists,
            percentage: ((stats.items / totalItems) * 100).toFixed(1)
          }));
          
          categoryStats.totalCategories = Object.keys(categoryStats_temp).length;
          categoryStats.averageItemsPerCategory = categoryStats.totalCategories > 0 ? parseFloat((totalItems / categoryStats.totalCategories).toFixed(1)) : 0;
          categoryStats.mostActiveCategory = Object.entries(categoryStats_temp).sort(([,a], [,b]) => b.items - a.items)[0]?.[0] || 'Bilinmiyor';
          
          categoryStats.categoryPerformance = categoryStats.categories.map(cat => ({
            category: cat.name,
            efficiency: 0, // Default value
            wastePercentage: 0 // Default value
          })).sort((a, b) => b.efficiency - a.efficiency);
        }
      }
      
      logger.info('Fetched product categories analysis:', categoryStats);
      return categoryStats;
    } catch (error) {
      logger.error('Failed to get product categories analysis:', error);
      throw error;
    }
  }
}

export const productCategoriesService = new ProductCategoriesService();

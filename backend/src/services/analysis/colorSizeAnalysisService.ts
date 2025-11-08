/**
 * @fileoverview Color & Size Analysis Service
 * @module ColorSizeAnalysisService
 * @version 2.1.0 - Fixed internal API auth
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

// Backend internal API configuration
const INTERNAL_API_BASE = 'http://localhost:3001/api';
const INTERNAL_AUTH_TOKEN = process.env.NODE_ENV === 'development' ? 'mock-dev-token-internal-service' : '';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ColorAnalysisItem {
  readonly color: string;
  readonly count: number;
  readonly percentage: string;
}

interface SizeAnalysisItem {
  readonly size: string;
  readonly count: number;
  readonly percentage: string;
}

interface ColorSizeCombination {
  readonly combination: string;
  readonly count: number;
  readonly percentage: string;
}

interface ColorSizeAnalysisResult {
  readonly colorAnalysis: ReadonlyArray<ColorAnalysisItem>;
  readonly sizeAnalysis: ReadonlyArray<SizeAnalysisItem>;
  readonly colorSizeCombinations: ReadonlyArray<ColorSizeCombination>;
  readonly mostPopularColor: string;
  readonly mostPopularSize: string;
  readonly totalCombinations: number;
}

export class ColorSizeAnalysisService {
  /**
   * Get color and size analysis
   */
  public async getColorSizeAnalysis(cuttingListId?: string): Promise<ColorSizeAnalysisResult> {
    try {
      let colorSizeStats: ColorSizeAnalysisResult = {
        colorAnalysis: [],
        sizeAnalysis: [],
        colorSizeCombinations: [],
        mostPopularColor: 'Bilinmiyor',
        mostPopularSize: 'Bilinmiyor',
        totalCombinations: 0
      };

      if (cuttingListId) {
        const cuttingListResponse = await axios.get<{ success: boolean; data: unknown }>(
          `${INTERNAL_API_BASE}/cutting-list/${cuttingListId}`,
          { headers: { Authorization: `Bearer ${INTERNAL_AUTH_TOKEN}` } }
        );
        const cuttingListData = cuttingListResponse.data;
        
        if (cuttingListData.success && cuttingListData.data) {
          const cuttingList = cuttingListData.data as Record<string, unknown>;
          const sections = (cuttingList.sections as unknown[] | undefined) || [];
          
          const colorCounts: Record<string, number> = {};
          const sizeCounts: Record<string, number> = {};
          const combinationCounts: Record<string, number> = {};
          let totalItems = 0;
          
          (sections as CuttingListSection[]).forEach((section: CuttingListSection) => {
            if (section.items && Array.isArray(section.items)) {
              section.items.forEach((item: CuttingListItem) => {
                totalItems++;
                
                if (item.color) {
                  colorCounts[item.color] = (colorCounts[item.color] || 0) + 1;
                }
                if (item.size) {
                  sizeCounts[item.size] = (sizeCounts[item.size] || 0) + 1;
                }
                if (item.color && item.size) {
                  const combination = `${item.color} - ${item.size}`;
                  combinationCounts[combination] = (combinationCounts[combination] || 0) + 1;
                }
              });
            }
          });
          
          const colorAnalysisTemp = Object.entries(colorCounts).map(([color, count]) => ({
            color,
            count,
            percentage: ((count / totalItems) * 100).toFixed(1)
          })).sort((a, b) => b.count - a.count);
          
          const sizeAnalysisTemp = Object.entries(sizeCounts).map(([size, count]) => ({
            size,
            count,
            percentage: ((count / totalItems) * 100).toFixed(1)
          })).sort((a, b) => b.count - a.count);
          
          const combinationsTemp = Object.entries(combinationCounts).map(([combination, count]) => ({
            combination,
            count,
            percentage: ((count / totalItems) * 100).toFixed(1)
          })).sort((a, b) => b.count - a.count);
          
          colorSizeStats = {
            colorAnalysis: colorAnalysisTemp,
            sizeAnalysis: sizeAnalysisTemp,
            colorSizeCombinations: combinationsTemp,
            mostPopularColor: colorAnalysisTemp[0]?.color || 'Bilinmiyor',
            mostPopularSize: sizeAnalysisTemp[0]?.size || 'Bilinmiyor',
            totalCombinations: Object.keys(combinationCounts).length
          };
        }
      } else {
        const allListsResponse = await axios.get<{ success: boolean; data: unknown[] }>(
          `${INTERNAL_API_BASE}/cutting-list`,
          { headers: { Authorization: `Bearer ${INTERNAL_AUTH_TOKEN}` } }
        );
        const allListsData = allListsResponse.data;
        
        if (allListsData.success && allListsData.data) {
          const cuttingLists = allListsData.data;
          
          const colorCounts: Record<string, number> = {};
          const sizeCounts: Record<string, number> = {};
          const combinationCounts: Record<string, number> = {};
          let totalItems = 0;
          
          (cuttingLists as CuttingListData[]).forEach((list: CuttingListData) => {
            const sections = list.sections || [];
            (sections as CuttingListSection[]).forEach((section: CuttingListSection) => {
              if (section.items && Array.isArray(section.items)) {
                section.items.forEach((item: CuttingListItem) => {
                  totalItems++;
                  
                  if (item.color) {
                    colorCounts[item.color] = (colorCounts[item.color] || 0) + 1;
                  }
                  if (item.size) {
                    sizeCounts[item.size] = (sizeCounts[item.size] || 0) + 1;
                  }
                  if (item.color && item.size) {
                    const combination = `${item.color} - ${item.size}`;
                    combinationCounts[combination] = (combinationCounts[combination] || 0) + 1;
                  }
                });
              }
            });
          });
          
          const colorAnalysisTemp = Object.entries(colorCounts).map(([color, count]) => ({
            color,
            count,
            percentage: ((count / totalItems) * 100).toFixed(1)
          })).sort((a, b) => b.count - a.count);
          
          const sizeAnalysisTemp = Object.entries(sizeCounts).map(([size, count]) => ({
            size,
            count,
            percentage: ((count / totalItems) * 100).toFixed(1)
          })).sort((a, b) => b.count - a.count);
          
          const combinationsTemp = Object.entries(combinationCounts).map(([combination, count]) => ({
            combination,
            count,
            percentage: ((count / totalItems) * 100).toFixed(1)
          })).sort((a, b) => b.count - a.count);
          
          colorSizeStats = {
            colorAnalysis: colorAnalysisTemp,
            sizeAnalysis: sizeAnalysisTemp,
            colorSizeCombinations: combinationsTemp,
            mostPopularColor: colorAnalysisTemp[0]?.color || 'Bilinmiyor',
            mostPopularSize: sizeAnalysisTemp[0]?.size || 'Bilinmiyor',
            totalCombinations: Object.keys(combinationCounts).length
          };
        }
      }
      
      logger.info('Fetched color & size analysis', { stats: colorSizeStats });
      return colorSizeStats;
    } catch (error) {
      logger.error('Failed to get color & size analysis', error);
      throw error;
    }
  }
}

// Removed singleton export for DI pattern consistency

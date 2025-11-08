/**
 * @fileoverview Work Order Analysis Service
 * @module WorkOrderAnalysisService
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

interface StatusDistribution {
  readonly status: string;
  readonly count: number;
  readonly percentage: string;
}

interface PriorityDistribution {
  readonly priority: string;
  readonly count: number;
  readonly percentage: string;
}

interface WorkOrderTrend {
  readonly period: string;
  readonly completed: number;
  readonly pending: number;
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly weekDays: ReadonlyArray<string>;
}

interface WorkOrderAnalysisResult {
  readonly totalWorkOrders: number;
  readonly statusDistribution: ReadonlyArray<StatusDistribution>;
  readonly priorityDistribution: ReadonlyArray<PriorityDistribution>;
  readonly completionRate: number;
  readonly averageProcessingTime: number;
  readonly mostCommonStatus: string;
  readonly mostCommonPriority: string;
  workOrderTrends: ReadonlyArray<WorkOrderTrend>; // Mutable for internal assignment
}

export class WorkOrderAnalysisService {
  /**
   * Get ISO week number for a given date
   */
  private getISOWeekNumber(date: Date): number {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  }

  /**
   * Get business week number for a given date - Çalışma sistemine göre hafta numarası
   */
  private getBusinessWeekNumber(date: Date): number {
    // Yılın ilk günü
    const jan1 = new Date(date.getFullYear(), 0, 1);
    
    // İlk pazartesi gününü bul
    const dayOfWeek = jan1.getDay(); // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
    const daysToFirstMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
    
    const firstMonday = new Date(jan1);
    firstMonday.setDate(jan1.getDate() + daysToFirstMonday);
    
    // Verilen tarihten ilk pazartesiye kadar olan gün sayısını hesapla
    const daysDiff = Math.floor((date.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24));
    
    // Hafta numarasını hesapla (1'den başlayarak)
    const weekNumber = Math.floor(daysDiff / 7) + 1;
    
    return Math.max(1, weekNumber); // En az 1. hafta
  }

  /**
   * Get week start date for a given week number and year - Business Week Implementation
   * Çalışma sistemine göre hafta hesaplama (Pazartesi-Cumartesi)
   */
  private getWeekStartDate(weekNumber: number, year: number): Date {
    // Basit ve doğru hafta hesaplama - ISO 8601 standardına uygun
    // 4 Ocak'ı içeren hafta 1. hafta olarak kabul edilir
    
    // 4 Ocak tarihini bul (bu tarih her zaman 1. haftada olur)
    const jan4 = new Date(year, 0, 4);
    
    // 4 Ocak'ın hangi gün olduğunu bul
    const jan4Day = jan4.getDay(); // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
    
    // 4 Ocak'ın bulunduğu haftanın pazartesi gününü bul
    const daysToMonday = jan4Day === 0 ? 6 : jan4Day - 1; // Pazartesi'ye kadar olan gün sayısı
    const week1Monday = new Date(jan4);
    week1Monday.setDate(jan4.getDate() - daysToMonday);
    
    // İstenen hafta numarasının pazartesi gününü hesapla
    const targetWeekStart = new Date(week1Monday);
    targetWeekStart.setDate(week1Monday.getDate() + (weekNumber - 1) * 7);
    
    // Professional logging
    logger.info(`Business Week ${weekNumber} of ${year} calculated`, {
      weekNumber,
      year,
      weekStartDate: targetWeekStart.toISOString().split('T')[0],
      weekEndDate: new Date(targetWeekStart.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 6 gün (Pazartesi-Cumartesi)
    });
    
    return targetWeekStart;
  }

  /**
   * Get work order analysis statistics
   */
  public async getWorkOrderAnalysis(cuttingListId?: string): Promise<WorkOrderAnalysisResult> {
    try {
      let workOrderStats: WorkOrderAnalysisResult = {
        totalWorkOrders: 0,
        statusDistribution: [],
        priorityDistribution: [],
        completionRate: 0,
        averageProcessingTime: 0,
        mostCommonStatus: 'Bilinmiyor',
        mostCommonPriority: 'Bilinmiyor',
        workOrderTrends: []
      };

      if (cuttingListId) {
        // Get specific cutting list data
        const cuttingListResponse = await axios.get<{ success: boolean; data: unknown }>(
          `${INTERNAL_API_BASE}/cutting-list/${cuttingListId}`,
          { headers: { Authorization: `Bearer ${INTERNAL_AUTH_TOKEN}` } }
        );
        const cuttingListData = cuttingListResponse.data;
        
        if (cuttingListData.success && cuttingListData.data) {
          const cuttingList = cuttingListData.data as Record<string, unknown>;
          const sections = (cuttingList.sections as unknown[] | undefined) || [];
          
          const statusCounts: Record<string, number> = {};
          const priorityCounts: Record<string, number> = {};
          let totalWorkOrders = 0;
          let completedWorkOrders = 0;
          
          (sections as CuttingListSection[]).forEach((section: CuttingListSection) => {
            if (section.items && Array.isArray(section.items)) {
              section.items.forEach((item: CuttingListItem) => {
                totalWorkOrders++;
                
                // Count status (default to 'pending' if not specified)
                const status = item.status || 'pending';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
                
                // Count priority (default to 'medium' if not specified)
                const priority = item.priority || 'medium';
                priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
                
                // Count completed work orders
                if (status === 'completed' || status === 'finished') {
                  completedWorkOrders++;
                }
              });
            }
          });
          
          // Convert to arrays for frontend
          const statusDistributionTemp = Object.entries(statusCounts).map(([status, count]) => ({
            status: status,
            count,
            percentage: ((count / totalWorkOrders) * 100).toFixed(1)
          }));
          
          const priorityDistributionTemp = Object.entries(priorityCounts).map(([priority, count]) => ({
            priority: priority,
            count,
            percentage: ((count / totalWorkOrders) * 100).toFixed(1)
          }));
          
          workOrderStats = {
            ...workOrderStats,
            totalWorkOrders,
            statusDistribution: statusDistributionTemp,
            priorityDistribution: priorityDistributionTemp,
            completionRate: totalWorkOrders > 0 ? parseFloat(((completedWorkOrders / totalWorkOrders) * 100).toFixed(1)) : 0,
            averageProcessingTime: 0, // Gerçek işlem süresi hesaplanacak
            mostCommonStatus: Object.entries(statusCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Bilinmiyor',
            mostCommonPriority: Object.entries(priorityCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Bilinmiyor'
          };
          
          // Gerçek timeline verileri - kesim listesinin haftasına göre
          const currentDate = new Date();
          const timelineData = [];
          
          // Kesim listesinden hafta numarasını al (örnek: "36.HAFTA KESİM LİSTESİ" -> 36)
          let weekNumber = 37; // Varsayılan olarak 37. hafta
          const title = cuttingList.title as string | undefined;
          if (title && typeof title === 'string') {
            // Daha esnek regex: "36.HAFTA", "36. Hafta", "36 HAFTA" formatlarını destekler
            const weekMatch = title.match(/(\d+)[.\s]*HAFTA/i);
            if (weekMatch) {
              weekNumber = parseInt(weekMatch[1]);
            }
          }
          
          // Professional logging
          logger.info('Processing cutting list analysis:', {
            cuttingListId,
            cuttingListTitle: cuttingList?.title,
            extractedWeekNumber: weekNumber,
            totalSections: sections.length,
            totalItems: (sections as CuttingListSection[]).reduce((sum: number, section: CuttingListSection) => sum + (section.items?.length || 0), 0)
          });
          
          const weekLabel = `${weekNumber}. Hafta`;
          
          // Bu haftanın başlangıç tarihini hesapla
          const weekStart = this.getWeekStartDate(weekNumber, currentDate.getFullYear());
          
          // Bu haftanın çalışma günlerini hesapla (Pazartesi-Cumartesi, 6 gün)
          const weekDays = [];
          for (let day = 0; day < 6; day++) { // 6 çalışma günü
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + day);
            weekDays.push(dayDate);
          }
          
          // Mevcut hafta için gerçek veriler (sadece bu kesim listesindeki iş emirleri)
          const weekCompleted = completedWorkOrders;
          const weekPending = totalWorkOrders - completedWorkOrders;
          
          // Professional timeline data generation - only with real data
          if (totalWorkOrders > 0) {
            const timelineEntry = {
              period: weekLabel,
              completed: weekCompleted,
              pending: weekPending,
              weekStart: weekStart.toISOString().split('T')[0],
              weekEnd: weekDays[5].toISOString().split('T')[0], // Cumartesi (6. gün, index 5)
              weekDays: weekDays.map(d => d.toISOString().split('T')[0])
            };
            
            timelineData.push(timelineEntry);
            
            logger.info('Generated timeline data:', {
              weekNumber,
              weekLabel,
              completed: weekCompleted,
              pending: weekPending,
              total: totalWorkOrders,
              weekStart: timelineEntry.weekStart,
              weekEnd: timelineEntry.weekEnd
            });
          } else {
            logger.warn('No work orders found for cutting list:', {
              cuttingListId,
              cuttingListTitle: cuttingList?.title
            });
          }
          
          workOrderStats.workOrderTrends = timelineData;
        }
      } else {
        // Get all cutting lists data
        const allListsResponse = await axios.get<{ success: boolean; data: unknown[] }>(
          `${INTERNAL_API_BASE}/cutting-list`,
          { headers: { Authorization: `Bearer ${INTERNAL_AUTH_TOKEN}` } }
        );
        const allListsData = allListsResponse.data;
        
        if (allListsData.success && allListsData.data) {
          const cuttingLists = allListsData.data;
          
          const statusCounts: Record<string, number> = {};
          const priorityCounts: Record<string, number> = {};
          let totalWorkOrders = 0;
          let completedWorkOrders = 0;
          
          (cuttingLists as CuttingListData[]).forEach((list: CuttingListData) => {
            const sections = list.sections || [];
            (sections as CuttingListSection[]).forEach((section: CuttingListSection) => {
              if (section.items && Array.isArray(section.items)) {
                section.items.forEach((item: CuttingListItem) => {
                  totalWorkOrders++;
                  
                  const status = item.status || 'pending';
                  statusCounts[status] = (statusCounts[status] || 0) + 1;
                  
                  const priority = item.priority || 'medium';
                  priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
                  
                  if (status === 'completed' || status === 'finished') {
                    completedWorkOrders++;
                  }
                });
              }
            });
          });
          
          const statusDistributionTemp = Object.entries(statusCounts).map(([status, count]) => ({
            status: status,
            count,
            percentage: ((count / totalWorkOrders) * 100).toFixed(1)
          }));
          
          const priorityDistributionTemp = Object.entries(priorityCounts).map(([priority, count]) => ({
            priority: priority,
            count,
            percentage: ((count / totalWorkOrders) * 100).toFixed(1)
          }));
          
          workOrderStats = {
            ...workOrderStats,
            totalWorkOrders,
            statusDistribution: statusDistributionTemp,
            priorityDistribution: priorityDistributionTemp,
            completionRate: totalWorkOrders > 0 ? parseFloat(((completedWorkOrders / totalWorkOrders) * 100).toFixed(1)) : 0,
            averageProcessingTime: 0, // Gerçek işlem süresi hesaplanacak
            mostCommonStatus: Object.entries(statusCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Bilinmiyor',
            mostCommonPriority: Object.entries(priorityCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Bilinmiyor'
          };
          
          // Gerçek timeline verileri - tüm kesim listeleri için genel analiz
          const currentDate = new Date();
          const timelineData = [];
          
          // Genel analiz için çalışma sistemine göre mevcut haftayı hesapla
          const weekNumber = this.getBusinessWeekNumber(currentDate);
          const weekLabel = `${weekNumber}. Hafta`;
          
          // Bu haftanın başlangıç tarihini hesapla
          const weekStart = this.getWeekStartDate(weekNumber, currentDate.getFullYear());
          
          // Bu haftanın çalışma günlerini hesapla (Pazartesi-Cumartesi, 6 gün)
          const weekDays = [];
          for (let day = 0; day < 6; day++) { // 6 çalışma günü
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + day);
            weekDays.push(dayDate);
          }
          
          // Mevcut hafta için gerçek veriler (tüm kesim listelerindeki iş emirleri)
          const weekCompleted = completedWorkOrders;
          const weekPending = totalWorkOrders - completedWorkOrders;
          
          // Sadece gerçek veri varsa timeline'a ekle
          if (totalWorkOrders > 0) {
            timelineData.push({
              period: weekLabel,
              completed: weekCompleted,
              pending: weekPending,
              weekStart: weekStart.toISOString().split('T')[0],
              weekEnd: weekDays[5].toISOString().split('T')[0], // Cumartesi (6. gün, index 5)
              weekDays: weekDays.map(d => d.toISOString().split('T')[0])
            });
          }
          
          workOrderStats.workOrderTrends = timelineData;
        }
      }
      
      logger.info('Fetched work order analysis statistics', { stats: workOrderStats });
      return workOrderStats;
    } catch (error) {
      logger.error('Failed to get work order analysis statistics', error);
      throw error;
    }
  }
}

export const workOrderAnalysisService = new WorkOrderAnalysisService();

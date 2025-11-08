/**
 * @fileoverview Production Plan Service
 * @module services/productionPlanService
 * @version 1.0.0
 */

import { PrismaClient, ProductionPlan, ProductionPlanItem } from '@prisma/client';
import { excelParserService, ExcelParseResult } from './excelParserService';
import { encryptionService, batchDecryptStrings } from './encryptionService';

export interface ProductionPlanWithItems extends ProductionPlan {
  items: ProductionPlanItem[];
}

export interface ProductionPlanFilters {
  weekNumber?: number;
  year?: number;
  status?: string;
  bolum?: string;
  oncelik?: string;
  page?: number;
  limit?: number;
}

export interface ProductionPlanMetrics {
  totalPlans: number;
  totalItems: number;
  departments: string[];
  priorityDistribution: Record<string, number>;
  upcomingDeadlines: number;
}

export class ProductionPlanService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Upload and parse Excel file to create production plan
   */
  async uploadProductionPlan(
    fileBuffer: Buffer,
    uploadedBy?: string
  ): Promise<{ success: boolean; data?: ProductionPlanWithItems; errors?: string[] }> {
    try {
      // Parse Excel file
      const parseResult = await excelParserService.parseProductionPlanExcel(fileBuffer, '');
      
      if (!parseResult.success || !parseResult.data || parseResult.data.length === 0) {
        return {
          success: false,
          errors: parseResult.errors || ['Excel dosyası işlenemedi']
        };
      }

      const { weekNumber, year } = parseResult.summary!;

      // TODO: Re-enable duplicate check after testing
      // Check if plan already exists for this week/year
      // const existingPlan = await this.prisma.productionPlan.findUnique({
      //   where: {
      //     weekNumber_year: {
      //       weekNumber,
      //       year
      //     }
      //   }
      // });

      // if (existingPlan) {
      //   return {
      //     success: false,
      //     errors: [`Bu hafta (${weekNumber}/${year}) için zaten bir üretim planı mevcut`]
      //   };
      // }

      // Create production plan
      const productionPlan = await this.prisma.productionPlan.create({
        data: {
          weekNumber,
          year,
          uploadedBy,
          metadata: {
            totalItems: parseResult.data.length,
            validRows: parseResult.summary!.validRows,
            invalidRows: parseResult.summary!.invalidRows,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      // Create production plan items with OPTIMIZED encryption
      const items = await this.prisma.productionPlanItem.createMany({
        data: parseResult.data.map(item => {
          // ✅ PERFORMANCE: Encrypt once, use for both fields
          const encryptedAd = encryptionService.encryptString(item.ad);
          const encryptedSiparisVeren = encryptionService.encryptString(item.siparisVeren);
          const encryptedMusteriNo = encryptionService.encryptString(item.musteriNo);
          const encryptedMusteriKalemi = encryptionService.encryptString(item.musteriKalemi);
          const encryptedSiparis = encryptionService.encryptString(item.siparis);
          const encryptedMalzemeNo = encryptionService.encryptString(item.malzemeNo);
          const encryptedMalzemeKisaMetni = encryptionService.encryptString(item.malzemeKisaMetni);
          
          return {
            ...item,
            planId: productionPlan.id,
            // Use encrypted values for both original and encrypted fields
            ad: encryptedAd,
            siparisVeren: encryptedSiparisVeren,
            musteriNo: encryptedMusteriNo,
            musteriKalemi: encryptedMusteriKalemi,
            siparis: encryptedSiparis,
            malzemeNo: encryptedMalzemeNo,
            malzemeKisaMetni: encryptedMalzemeKisaMetni,
            // Store same encrypted values in dedicated fields
            encryptedAd,
            encryptedSiparisVeren,
            encryptedMusteriNo,
            encryptedMusteriKalemi,
            encryptedSiparis,
            encryptedMalzemeNo,
            encryptedMalzemeKisaMetni
          };
        })
      });

      // Fetch created plan with items
      const createdPlan = await this.prisma.productionPlan.findUnique({
        where: { id: productionPlan.id },
        include: { items: true }
      });

      return {
        success: true,
        data: createdPlan!
      };

    } catch (error) {
      return {
        success: false,
        errors: [`Üretim planı oluşturulurken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`]
      };
    }
  }

  /**
   * Get production plans with filters
   */
  async getProductionPlans(filters: ProductionPlanFilters = {}, forceRefresh: boolean = false): Promise<ProductionPlanWithItems[]> {
    const {
      weekNumber,
      year,
      status = 'active',
      bolum,
      oncelik,
      page = 1,
      limit = 50
    } = filters;

    console.log('🔍 [Backend] Filter Debug:', {
      inputFilters: filters,
      parsedFilters: { weekNumber, year, status, bolum, oncelik, page, limit }
    });

    const where: Record<string, unknown> = {};

    if (weekNumber) where.weekNumber = weekNumber;
    if (year) where.year = year;
    if (status) where.status = status;

    // Build item filters
    const itemWhere: Record<string, unknown> = {};
    if (bolum) {
      // Map frontend filter values to database values
      const bolumMapping: Record<string, string> = {
        'MONTAJ': '1',
        'HELEZON': '3', 
        'KAYNAK': '4',
        'BOYA': '6'
      };
      const mappedBolum = bolumMapping[bolum] || bolum;
      itemWhere.bolum = mappedBolum;
    }
    if (oncelik) {
      // Map frontend filter values to database values
      const oncelikMapping: Record<string, string> = {
        'yuksek': '1',
        'orta': '2',
        'dusuk': '2'
      };
      const mappedOncelik = oncelikMapping[oncelik] || oncelik;
      itemWhere.oncelik = mappedOncelik;
    }

    console.log('🔍 [Backend] Where Clauses:', {
      planWhere: where,
      itemWhere,
      hasItemFilters: Object.keys(itemWhere).length > 0
    });

    const plans = await this.prisma.productionPlan.findMany({
      where: {
        ...where,
        ...(Object.keys(itemWhere).length > 0 && {
          items: {
            some: itemWhere
          }
        })
      },
      include: {
        items: {
          where: Object.keys(itemWhere).length > 0 ? itemWhere : undefined,
          orderBy: [
            { oncelik: 'asc' },
            { planlananBitisTarihi: 'asc' }
          ]
        }
      },
      orderBy: [
        { year: 'desc' },
        { weekNumber: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    console.log('🔍 [Backend] Query Result:', {
      plansFound: plans.length,
      plansWithItems: plans.filter(p => p.items.length > 0).length,
      totalItems: plans.reduce((sum, p) => sum + p.items.length, 0),
      firstPlan: plans[0] ? {
        id: plans[0].id,
        weekNumber: plans[0].weekNumber,
        year: plans[0].year,
        itemCount: plans[0].items.length
      } : null
    });

    console.log('🔍 [Backend] Starting decryption process...');

      // ✅ SIMPLIFIED: Direct decryption for each item
      const decryptedPlans = plans.map(plan => ({
        ...plan,
        items: plan.items.map(item => {
          const itemWithEncrypted = item as typeof item & {
            encryptedAd?: string | null;
            encryptedSiparisVeren?: string | null;
            encryptedMusteriNo?: string | null;
            encryptedMusteriKalemi?: string | null;
            encryptedSiparis?: string | null;
            encryptedMalzemeNo?: string | null;
            encryptedMalzemeKisaMetni?: string | null;
          };
          
          // Check if item has encrypted fields OR if original fields are encrypted
          const hasEncryptedFields = itemWithEncrypted.encryptedAd || 
            itemWithEncrypted.encryptedSiparisVeren || 
            itemWithEncrypted.encryptedMusteriNo ||
            itemWithEncrypted.encryptedMusteriKalemi ||
            itemWithEncrypted.encryptedSiparis ||
            itemWithEncrypted.encryptedMalzemeNo ||
            itemWithEncrypted.encryptedMalzemeKisaMetni;
          
          const hasOriginalEncryptedFields = encryptionService.isEncrypted(item.ad || '') ||
            encryptionService.isEncrypted(item.siparisVeren || '') ||
            encryptionService.isEncrypted(item.musteriNo || '') ||
            encryptionService.isEncrypted(item.musteriKalemi || '') ||
            encryptionService.isEncrypted(item.siparis || '') ||
            encryptionService.isEncrypted(item.malzemeNo || '') ||
            encryptionService.isEncrypted(item.malzemeKisaMetni || '');
          
          if (!hasEncryptedFields && !hasOriginalEncryptedFields) {
            console.log('🔍 DEBUG - No encrypted fields found for item:', item.id);
            return item; // Return as-is if no encrypted fields
          }
          
          console.log('🔍 DEBUG - Encrypted fields detected:', {
            itemId: item.id,
            hasEncryptedFields,
            hasOriginalEncryptedFields
          });
          
          // Decrypt each field individually with error handling
          try {
            console.log('🔍 DEBUG - Item decryption:', {
              itemId: item.id,
              hasEncryptedAd: !!itemWithEncrypted.encryptedAd,
              originalAd: item.ad?.substring(0, 20) + '...',
              isOriginalAdEncrypted: encryptionService.isEncrypted(item.ad || '')
            });
            
            return {
              ...item,
              // Always try to decrypt - if encrypted field exists, use it; otherwise try original field
              ad: itemWithEncrypted.encryptedAd ? 
                encryptionService.decryptString(itemWithEncrypted.encryptedAd) : 
                (encryptionService.isEncrypted(item.ad) ? encryptionService.decryptString(item.ad) : item.ad),
              siparisVeren: itemWithEncrypted.encryptedSiparisVeren ? 
                encryptionService.decryptString(itemWithEncrypted.encryptedSiparisVeren) : 
                (encryptionService.isEncrypted(item.siparisVeren) ? encryptionService.decryptString(item.siparisVeren) : item.siparisVeren),
              musteriNo: itemWithEncrypted.encryptedMusteriNo ? 
                encryptionService.decryptString(itemWithEncrypted.encryptedMusteriNo) : 
                (encryptionService.isEncrypted(item.musteriNo) ? encryptionService.decryptString(item.musteriNo) : item.musteriNo),
              musteriKalemi: itemWithEncrypted.encryptedMusteriKalemi ? 
                encryptionService.decryptString(itemWithEncrypted.encryptedMusteriKalemi) : 
                (encryptionService.isEncrypted(item.musteriKalemi) ? encryptionService.decryptString(item.musteriKalemi) : item.musteriKalemi),
              siparis: itemWithEncrypted.encryptedSiparis ? 
                encryptionService.decryptString(itemWithEncrypted.encryptedSiparis) : 
                (encryptionService.isEncrypted(item.siparis) ? encryptionService.decryptString(item.siparis) : item.siparis),
              malzemeNo: itemWithEncrypted.encryptedMalzemeNo ? 
                encryptionService.decryptString(itemWithEncrypted.encryptedMalzemeNo) : 
                (encryptionService.isEncrypted(item.malzemeNo) ? encryptionService.decryptString(item.malzemeNo) : item.malzemeNo),
              malzemeKisaMetni: itemWithEncrypted.encryptedMalzemeKisaMetni ? 
                encryptionService.decryptString(itemWithEncrypted.encryptedMalzemeKisaMetni) : 
                (encryptionService.isEncrypted(item.malzemeKisaMetni) ? encryptionService.decryptString(item.malzemeKisaMetni) : item.malzemeKisaMetni)
            };
          } catch (error) {
            console.error('Decryption error for item:', item.id, error);
            // Return original item if decryption fails
            return item;
          }
        })
      }));

    console.log('🔍 [Backend] Decryption completed:', {
      originalPlans: plans.length,
      decryptedPlans: decryptedPlans.length,
      firstItemSample: decryptedPlans[0]?.items[0] ? {
        id: decryptedPlans[0].items[0].id,
        ad: decryptedPlans[0].items[0].ad?.substring(0, 30) + '...',
        isAdEncrypted: encryptionService.isEncrypted(decryptedPlans[0].items[0].ad || '')
      } : null
    });

    return decryptedPlans;
  }

  /**
   * Get single production plan by ID
   */
  async getProductionPlanById(id: string): Promise<ProductionPlanWithItems | null> {
    const plan = await this.prisma.productionPlan.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [
            { oncelik: 'asc' },
            { planlananBitisTarihi: 'asc' }
          ]
        }
      }
    });

    if (!plan) return null;

    // Decrypt sensitive fields in items
    return {
      ...plan,
      items: plan.items.map(item => {
        const itemWithEncrypted = item as typeof item & {
          encryptedAd?: string | null;
          encryptedSiparisVeren?: string | null;
          encryptedMusteriNo?: string | null;
          encryptedMusteriKalemi?: string | null;
          encryptedSiparis?: string | null;
          encryptedMalzemeNo?: string | null;
          encryptedMalzemeKisaMetni?: string | null;
        };
        
        try {
          return {
            ...item,
            // Always try to decrypt - if encrypted field exists, use it; otherwise try original field
            ad: itemWithEncrypted.encryptedAd ? 
              encryptionService.decryptString(itemWithEncrypted.encryptedAd) : 
              (encryptionService.isEncrypted(item.ad) ? encryptionService.decryptString(item.ad) : item.ad),
            siparisVeren: itemWithEncrypted.encryptedSiparisVeren ? 
              encryptionService.decryptString(itemWithEncrypted.encryptedSiparisVeren) : 
              (encryptionService.isEncrypted(item.siparisVeren) ? encryptionService.decryptString(item.siparisVeren) : item.siparisVeren),
            musteriNo: itemWithEncrypted.encryptedMusteriNo ? 
              encryptionService.decryptString(itemWithEncrypted.encryptedMusteriNo) : 
              (encryptionService.isEncrypted(item.musteriNo) ? encryptionService.decryptString(item.musteriNo) : item.musteriNo),
            musteriKalemi: itemWithEncrypted.encryptedMusteriKalemi ? 
              encryptionService.decryptString(itemWithEncrypted.encryptedMusteriKalemi) : 
              (encryptionService.isEncrypted(item.musteriKalemi) ? encryptionService.decryptString(item.musteriKalemi) : item.musteriKalemi),
            siparis: itemWithEncrypted.encryptedSiparis ? 
              encryptionService.decryptString(itemWithEncrypted.encryptedSiparis) : 
              (encryptionService.isEncrypted(item.siparis) ? encryptionService.decryptString(item.siparis) : item.siparis),
            malzemeNo: itemWithEncrypted.encryptedMalzemeNo ? 
              encryptionService.decryptString(itemWithEncrypted.encryptedMalzemeNo) : 
              (encryptionService.isEncrypted(item.malzemeNo) ? encryptionService.decryptString(item.malzemeNo) : item.malzemeNo),
            malzemeKisaMetni: itemWithEncrypted.encryptedMalzemeKisaMetni ? 
              encryptionService.decryptString(itemWithEncrypted.encryptedMalzemeKisaMetni) : 
              (encryptionService.isEncrypted(item.malzemeKisaMetni) ? encryptionService.decryptString(item.malzemeKisaMetni) : item.malzemeKisaMetni)
          };
        } catch (error) {
          console.error('Decryption error for item:', item.id, error);
          // Return original item if decryption fails
          return item;
        }
      })
    };
  }

  /**
   * Delete production plan (soft delete)
   */
  async deleteProductionPlan(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // First delete all related production plan items
      await this.prisma.productionPlanItem.deleteMany({
        where: { planId: id }
      });

      // Then delete the production plan itself
      await this.prisma.productionPlan.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Üretim planı ve tüm öğeleri başarıyla silindi'
      };
    } catch (error) {
      return {
        success: false,
        message: `Üretim planı silinirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      };
    }
  }

  /**
   * Delete all production plans
   */
  async deleteAllProductionPlans(): Promise<{ success: boolean; message: string; count: number }> {
    try {
      // First delete all production plan items
      const deletedItems = await this.prisma.productionPlanItem.deleteMany();
      
      // Then delete all production plans
      const deletedPlans = await this.prisma.productionPlan.deleteMany();

      return {
        success: true,
        message: `Tüm üretim planları başarıyla silindi (${deletedPlans.count} plan, ${deletedItems.count} öğe)`,
        count: deletedPlans.count
      };
    } catch (error) {
      return {
        success: false,
        message: `Tüm üretim planları silinirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        count: 0
      };
    }
  }

  /**
   * Get production plan metrics
   */
  async getProductionPlanMetrics(filters: ProductionPlanFilters = {}): Promise<ProductionPlanMetrics> {
    const { weekNumber, year, status = 'active' } = filters;

    const where: Record<string, unknown> = { status };
    if (weekNumber) where.weekNumber = weekNumber;
    if (year) where.year = year;

    // Get all plans with items
    const plans = await this.prisma.productionPlan.findMany({
      where,
      include: { items: true }
    });

    const totalPlans = plans.length;
    const totalItems = plans.reduce((sum, plan) => sum + plan.items.length, 0);

    // Get unique departments
    const departments = Array.from(
      new Set(plans.flatMap(plan => plan.items.map(item => item.bolum)))
    ).filter(Boolean);

    // Calculate priority distribution
    const priorityDistribution: Record<string, number> = {};
    plans.forEach(plan => {
      plan.items.forEach(item => {
        priorityDistribution[item.oncelik] = (priorityDistribution[item.oncelik] || 0) + 1;
      });
    });

    // Count upcoming deadlines (within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingDeadlines = plans.reduce((count, plan) => {
      return count + plan.items.filter(item => 
        item.planlananBitisTarihi <= sevenDaysFromNow && 
        item.planlananBitisTarihi >= new Date()
      ).length;
    }, 0);

    return {
      totalPlans,
      totalItems,
      departments,
      priorityDistribution,
      upcomingDeadlines
    };
  }

  /**
   * Get production plan by week and year
   */
  async getProductionPlanByWeek(weekNumber: number, year: number): Promise<ProductionPlanWithItems | null> {
    return await this.prisma.productionPlan.findUnique({
      where: {
        weekNumber_year: {
          weekNumber,
          year
        }
      },
      include: {
        items: {
          orderBy: [
            { oncelik: 'asc' },
            { planlananBitisTarihi: 'asc' }
          ]
        }
      }
    });
  }

  /**
   * Get production plan items by work order ID
   */
  async getProductionPlanItemsByWorkOrder(workOrderId: string): Promise<ProductionPlanItem[]> {
    return await this.prisma.productionPlanItem.findMany({
      where: { siparis: workOrderId },
      include: {
        plan: true
      },
      orderBy: [
        { plan: { weekNumber: 'desc' } },
        { oncelik: 'asc' }
      ]
    });
  }

  /**
   * Get backorder items (overdue and not completed)
   */
  async getBackorderItems(filters: ProductionPlanFilters = {}): Promise<ProductionPlanItem[]> {
    const today = new Date();
    
    const where: Record<string, unknown> = {
      planlananBitisTarihi: { lt: today },
      linkedCuttingListId: null, // Not completed
    };

    // Apply additional filters
    if (filters.bolum) {
      const bolumMapping: Record<string, string> = {
        'MONTAJ': '1',
        'HELEZON': '3', 
        'KAYNAK': '4',
        'BOYA': '6'
      };
      const mappedBolum = bolumMapping[filters.bolum] || filters.bolum;
      where.bolum = mappedBolum;
    }
    
    if (filters.oncelik) {
      const oncelikMapping: Record<string, string> = {
        'yuksek': '1',
        'orta': '2',
        'dusuk': '2'
      };
      const mappedOncelik = oncelikMapping[filters.oncelik] || filters.oncelik;
      where.oncelik = mappedOncelik;
    }

    return await this.prisma.productionPlanItem.findMany({
      where,
      include: { plan: true },
      orderBy: [
        { planlananBitisTarihi: 'asc' }, // Most overdue first
        { oncelik: 'asc' }
      ]
    });
  }
}

export const productionPlanService = new ProductionPlanService(new PrismaClient());

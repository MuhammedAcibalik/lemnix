/**
 * @fileoverview Production Plan Service
 * @module services/productionPlanService
 * @version 1.0.0
 */

import { PrismaClient, ProductionPlan, ProductionPlanItem } from '@prisma/client';
import { excelParserService, ExcelParseResult } from './excelParserService';
import { encryptionService, batchDecryptStrings, decryptField } from './encryptionService';
import { logger } from './logger';

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

      const createdPlan = await this.prisma.$transaction(async (tx) => {
        const plan = await tx.productionPlan.create({
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

        await tx.productionPlanItem.createMany({
          data: parseResult.data.map(item => mapProductionPlanItem(item, plan.id))
        });

        return tx.productionPlan.findUnique({
          where: { id: plan.id },
          include: { items: true }
        });
      });

      logger.info('Production plan created', {
        weekNumber,
        year,
        uploadedBy,
        itemCount: parseResult.data.length
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

    logger.debug('Loaded production plans', {
      plansFound: plans.length,
      plansWithItems: plans.filter(p => p.items.length > 0).length,
      totalItems: plans.reduce((sum, p) => sum + p.items.length, 0)
    });

    const decryptedPlans = plans.map(plan => ({
      ...plan,
      items: plan.items.map(decryptProductionPlanItem)
    }));

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

function mapProductionPlanItem(item: ProductionPlanItem, planId: string) {
  const encryptedAd = encryptionService.encryptString(item.ad);
  const encryptedSiparisVeren = encryptionService.encryptString(item.siparisVeren);
  const encryptedMusteriNo = encryptionService.encryptString(item.musteriNo);
  const encryptedMusteriKalemi = encryptionService.encryptString(item.musteriKalemi);
  const encryptedSiparis = encryptionService.encryptString(item.siparis);
  const encryptedMalzemeNo = encryptionService.encryptString(item.malzemeNo);
  const encryptedMalzemeKisaMetni = encryptionService.encryptString(item.malzemeKisaMetni);

  return {
    ...item,
    planId,
    ad: encryptedAd,
    siparisVeren: encryptedSiparisVeren,
    musteriNo: encryptedMusteriNo,
    musteriKalemi: encryptedMusteriKalemi,
    siparis: encryptedSiparis,
    malzemeNo: encryptedMalzemeNo,
    malzemeKisaMetni: encryptedMalzemeKisaMetni,
    encryptedAd,
    encryptedSiparisVeren,
    encryptedMusteriNo,
    encryptedMusteriKalemi,
    encryptedSiparis,
    encryptedMalzemeNo,
    encryptedMalzemeKisaMetni
  };
}

function decryptProductionPlanItem(item: ProductionPlanItem & {
  encryptedAd?: string | null;
  encryptedSiparisVeren?: string | null;
  encryptedMusteriNo?: string | null;
  encryptedMusteriKalemi?: string | null;
  encryptedSiparis?: string | null;
  encryptedMalzemeNo?: string | null;
  encryptedMalzemeKisaMetni?: string | null;
}): ProductionPlanItem {
  const resolveField = (encrypted: string | null | undefined, fallback: string | null): string | null => {
    if (encrypted && encrypted.trim()) {
      return encryptionService.decryptString(encrypted);
    }

    return decryptField(fallback ?? null);
  };

  return {
    ...item,
    ad: resolveField(item.encryptedAd, item.ad),
    siparisVeren: resolveField(item.encryptedSiparisVeren, item.siparisVeren),
    musteriNo: resolveField(item.encryptedMusteriNo, item.musteriNo),
    musteriKalemi: resolveField(item.encryptedMusteriKalemi, item.musteriKalemi),
    siparis: resolveField(item.encryptedSiparis, item.siparis),
    malzemeNo: resolveField(item.encryptedMalzemeNo, item.malzemeNo),
    malzemeKisaMetni: resolveField(item.encryptedMalzemeKisaMetni, item.malzemeKisaMetni)
  };
}

export const productionPlanService = new ProductionPlanService(new PrismaClient());

/**
 * @fileoverview Cutting List Controller for manual cutting list creation
 * @module CuttingListController
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { PDFExportService } from '../services/pdfExportService';
import { ExcelExportService } from '../services/excelExportService';
import { ProfileSuggestionService } from '../services/profileSuggestionService';
import { QuantityCalculationService } from '../services/quantityCalculationService';
import { EnterpriseProfileSuggestionService } from '../services/enterpriseProfileSuggestionService';
import smartSuggestionService from '../services/smartSuggestionService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Profile item interface
 */
interface ProfileItem {
  readonly id: string;
  readonly profile?: string;
  readonly measurement: string;
  readonly quantity: number;
}

/**
 * Cutting list item interface
 */
interface CuttingListItem {
  readonly id: string;
  readonly workOrderId: string;
  readonly date: string;
  readonly version: string;
  readonly color: string;
  readonly note?: string;
  readonly orderQuantity: number;
  readonly size: string;
  readonly profiles: ReadonlyArray<ProfileItem>;
}

/**
 * Product section interface
 */
interface ProductSection {
  readonly id: string;
  readonly productName: string;
  readonly items: ReadonlyArray<CuttingListItem>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Cutting list interface
 */
interface CuttingList {
  readonly id: string;
  readonly title: string;
  readonly weekNumber: number;
  readonly sections: ReadonlyArray<ProductSection>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * API Response structure
 */
interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
  readonly timestamp: string;
  readonly requestId?: string;
}

// ============================================================================
// CUTTING LIST CONTROLLER CLASS
// ============================================================================

/**
 * Cutting List Controller
 */
export class CuttingListController {
  private cuttingLists: Map<string, CuttingList> = new Map();
  private requestCounter: number = 0;
  private readonly storageFile: string;
  private readonly pdfExportService: PDFExportService;
  private readonly excelExportService: ExcelExportService;
  private readonly profileSuggestionService: ProfileSuggestionService;
  private readonly quantityCalculationService: QuantityCalculationService;
  private readonly enterpriseProfileService: EnterpriseProfileSuggestionService;

  constructor() {
    // Create storage directory if it doesn't exist
    const storageDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    
    this.storageFile = path.join(storageDir, 'cutting-lists.json');
    this.pdfExportService = PDFExportService.getInstance();
    
    // Graceful shutdown için cleanup handler
    process.on('SIGINT', async () => {
      console.log('PDF Export Service cleanup...');
      await this.pdfExportService.cleanup();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('PDF Export Service cleanup...');
      await this.pdfExportService.cleanup();
      process.exit(0);
    });
    this.excelExportService = new ExcelExportService();
    this.profileSuggestionService = new ProfileSuggestionService();
    this.quantityCalculationService = new QuantityCalculationService();
    this.enterpriseProfileService = new EnterpriseProfileSuggestionService();
    this.loadFromStorage();
    
    // Analyze existing cutting lists for profile suggestions
    this.analyzeExistingData();
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `REQ-${Date.now()}-${++this.requestCounter}`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create API response
   */
  private createResponse<T>(
    success: boolean,
    data?: T,
    error?: string
  ): ApiResponse<T> {
    const response = {
      success,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    } as ApiResponse<T>;
    
    if (data !== undefined) {
      (response as any).data = data;
    }
    
    if (error !== undefined) {
      (response as any).error = error;
    }
    
    return response;
  }

  /**
   * Handle async errors
   */
  private asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  /**
   * Save data to file storage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.cuttingLists.entries());
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(this.storageFile, jsonData, 'utf8');
      console.log(`[STORAGE] Saved ${data.length} cutting lists to ${this.storageFile}`);
    } catch (error) {
      console.error('[STORAGE] Error saving to storage:', error);
    }
  }

  /**
   * Load data from file storage
   */
  private loadFromStorage(): void {
    try {
      if (fs.existsSync(this.storageFile)) {
        const jsonData = fs.readFileSync(this.storageFile, 'utf8');
        const data = JSON.parse(jsonData);
        
        // Hem Array hem Map formatını destekle
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0]) && data[0].length === 2) {
          // Map formatında veri var: [[id, cuttingList], ...]
          this.cuttingLists = new Map(data);
          console.log(`[STORAGE] ✅ Loaded ${this.cuttingLists.size} cutting lists from Map format`);
          console.log(`[STORAGE] First few IDs:`, Array.from(this.cuttingLists.keys()).slice(0, 3));
        } else if (Array.isArray(data)) {
          // Array formatında veri var
          this.cuttingLists = new Map();
          data.forEach((cuttingList, index) => {
            if (cuttingList && cuttingList.id) {
              this.cuttingLists.set(cuttingList.id, cuttingList);
            } else {
              console.log(`[STORAGE] Warning: Invalid cutting list at index ${index}`);
            }
          });
          console.log(`[STORAGE] ✅ Loaded ${this.cuttingLists.size} cutting lists from Array format`);
          console.log(`[STORAGE] First few IDs:`, Array.from(this.cuttingLists.keys()).slice(0, 3));
        } else {
          // Bilinmeyen format
          console.log('[STORAGE] ❌ Unknown data format, starting with empty storage');
          console.log('[STORAGE] Data type:', typeof data, 'Array?', Array.isArray(data));
          if (Array.isArray(data) && data.length > 0) {
            console.log('[STORAGE] First item type:', typeof data[0], 'Array?', Array.isArray(data[0]));
          }
          this.cuttingLists = new Map();
        }
        
        // Mevcut verileri temizle (CMmm, CM gibi eski formatları düzelt)
        this.cleanupExistingMeasurements();
      } else {
        console.log('[STORAGE] No existing storage file found, starting with empty storage');
      }
    } catch (error) {
      console.error('[STORAGE] Error loading from storage:', error);
      console.log('[STORAGE] Starting with empty storage due to error');
      this.cuttingLists = new Map();
    }
  }

  /**
   * Mevcut verilerdeki ölçü formatlarını temizle
   */
  private cleanupExistingMeasurements(): void {
    let hasChanges = false;
    
    this.cuttingLists.forEach((cuttingList) => {
      cuttingList.sections.forEach((section) => {
        section.items.forEach((item) => {
          item.profiles.forEach((profile) => {
            const originalMeasurement = profile.measurement;
            const cleanedMeasurement = this.convertMeasurementToMM(originalMeasurement);
            
            if (originalMeasurement !== cleanedMeasurement) {
              console.log(`[CLEANUP] Converting measurement: "${originalMeasurement}" → "${cleanedMeasurement}"`);
              (profile as any).measurement = cleanedMeasurement;
              hasChanges = true;
            }
          });
        });
      });
    });
    
    if (hasChanges) {
      console.log('[CLEANUP] ✅ Measurement cleanup completed, saving changes...');
      this.saveToStorage();
    } else {
      console.log('[CLEANUP] ✅ No measurement cleanup needed');
    }
  }

  /**
   * Ölçü dönüşümü utility fonksiyonu
   */
  private convertMeasurementToMM(input: string): string {
    if (!input || typeof input !== 'string') return input;
    
    const trimmedInput = input.trim().toUpperCase();
    
    // CMmm, CM gibi eski formatları temizle
    if (trimmedInput.includes('CM')) {
      const cmValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
      const cmNumber = parseFloat(cmValue);
      if (!isNaN(cmNumber)) {
        const mmValue = Math.round(cmNumber * 10);
        return `${mmValue}`;
      }
    }
    
    // M dönüşümü
    if (trimmedInput.includes('M') && !trimmedInput.includes('MM')) {
      const mValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
      const mNumber = parseFloat(mValue);
      if (!isNaN(mNumber)) {
        const mmValue = Math.round(mNumber * 1000);
        return `${mmValue}`;
      }
    }
    
    // Zaten MM ise sadece sayıyı al
    if (trimmedInput.includes('MM')) {
      const mmValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
      const mmNumber = parseFloat(mmValue);
      if (!isNaN(mmNumber)) {
        return `${Math.round(mmNumber)}`;
      }
    }
    
    // Sadece sayı ise olduğu gibi döndür
    const numericValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
    const numericNumber = parseFloat(numericValue);
    if (!isNaN(numericNumber)) {
      return `${Math.round(numericNumber)}`;
    }
    
    return input;
  }

  /**
   * Create new cutting list
   */
  public createCuttingList = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { title, weekNumber } = req.body;
    
    console.log(`[${requestId}] Creating cutting list: ${title}, week: ${weekNumber}`);

    try {
      // Validate input
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Title is required')
        );
        return;
      }

      if (!weekNumber || typeof weekNumber !== 'number' || weekNumber < 1) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Week number is required and must be a positive number')
        );
        return;
      }

      // Check if a cutting list already exists for this week
      const existingLists = Array.from(this.cuttingLists.values()).filter(list => list.weekNumber === weekNumber);
      
             if (existingLists.length > 0) {
         // Return 409 Conflict if any list exists for this week
         res.status(409).json(
           this.createResponse(false, undefined, `${weekNumber}. Hafta için zaten bir kesim listesi mevcut. Lütfen geçmiş haftalar bölümünden o listeyi görüntüleyin veya önce silin.`)
         );
         return;
       }

      // Create new cutting list if no existing list for this week
      const now = new Date().toISOString();
      const cuttingList: CuttingList = {
        id: this.generateId(),
        title: title.trim(),
        weekNumber: weekNumber,
        sections: [],
        createdAt: now,
        updatedAt: now
      };

      this.cuttingLists.set(cuttingList.id, cuttingList);
      this.saveToStorage();

      // Update profile suggestion database
      this.profileSuggestionService.analyzeCuttingLists(Array.from(this.cuttingLists.values()));

      console.log(`[${requestId}] New cutting list created: ${cuttingList.id} for week ${weekNumber}`);
      
      res.json(
        this.createResponse(true, cuttingList)
      );

    } catch (error) {
      console.error(`[${requestId}] Error creating cutting list:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Get all cutting lists data (public method for internal use)
   */
  public getAllCuttingListsData(): CuttingList[] {
    return Array.from(this.cuttingLists.values());
  }

  /**
   * Get all cutting lists
   */
  public getAllCuttingLists = this.asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    console.log(`[${requestId}] Getting all cutting lists`);

    try {
      const lists = Array.from(this.cuttingLists.values()).map(list => ({
        id: list.id,
        title: list.title,
        weekNumber: list.weekNumber,
        sections: list.sections,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt
      }));

      console.log(`[${requestId}] ✅ Found ${lists.length} cutting lists`);
      console.log(`[${requestId}] Memory has ${this.cuttingLists.size} cutting lists`);
      
      res.json(
        this.createResponse(true, lists)
      );

    } catch (error) {
      console.error(`[${requestId}] Error getting cutting lists:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Get cutting list by ID
   */
  public getCuttingListById = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { id } = req.params;
    
    console.log(`[${requestId}] Getting cutting list: ${id}`);

    try {
      // Validate input
      if (!id) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Cutting list ID is required')
        );
        return;
      }

      const cuttingList = this.cuttingLists.get(id);
      
      if (!cuttingList) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Cutting list not found')
        );
        return;
      }

      console.log(`[${requestId}] Found cutting list: ${id}`);
      
      res.json(
        this.createResponse(true, cuttingList)
      );

    } catch (error) {
      console.error(`[${requestId}] Error getting cutting list:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Update cutting list
   */
  public updateCuttingList = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { id } = req.params;
    const cuttingListData = req.body;
    
    console.log(`[${requestId}] Updating cutting list: ${id}`);

    try {
      // Validate input
      if (!id) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Cutting list ID is required')
        );
        return;
      }

      const existingCuttingList = this.cuttingLists.get(id);
      
      if (!existingCuttingList) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Cutting list not found')
        );
        return;
      }

      // Update the cutting list
      const updatedCuttingList: CuttingList = {
        ...existingCuttingList,
        ...cuttingListData,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };

      this.cuttingLists.set(id, updatedCuttingList);
      this.saveToStorage();

      console.log(`[${requestId}] Cutting list updated: ${id}`);
      
      res.json(
        this.createResponse(true, updatedCuttingList)
      );

    } catch (error) {
      console.error(`[${requestId}] Error updating cutting list:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Add product section to cutting list
   */
  public addProductSection = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { cuttingListId } = req.params;
    const { productName } = req.body;
    
    console.log(`[${requestId}] Adding product section: ${productName} to list: ${cuttingListId}`);

    try {
      // Validate input
      if (!cuttingListId) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Cutting list ID is required')
        );
        return;
      }

      if (!productName || typeof productName !== 'string' || productName.trim().length === 0) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Product name is required')
        );
        return;
      }

      const cuttingList = this.cuttingLists.get(cuttingListId);
      
      if (!cuttingList) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Cutting list not found')
        );
        return;
      }

      const now = new Date().toISOString();
      const newSection: ProductSection = {
        id: this.generateId(),
        productName: productName.trim(),
        items: [],
        createdAt: now,
        updatedAt: now
      };

      const updatedSections = [...cuttingList.sections, newSection];
      const updatedCuttingList: CuttingList = {
        ...cuttingList,
        sections: updatedSections,
        updatedAt: now
      };

      this.cuttingLists.set(cuttingListId, updatedCuttingList);
      this.saveToStorage();

      // Update profile suggestion database
      this.profileSuggestionService.analyzeCuttingLists(Array.from(this.cuttingLists.values()));

      console.log(`[${requestId}] Product section added: ${newSection.id}`);
      
      res.json(
        this.createResponse(true, newSection)
      );

    } catch (error) {
      console.error(`[${requestId}] Error adding product section:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Add item to product section
   */
  public addItemToSection = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { cuttingListId, sectionId } = req.params;
    const itemData = req.body;
    
          console.log(`[${requestId}] Adding item to section: ${sectionId}`);
      console.log(`[${requestId}] Request body:`, JSON.stringify(itemData, null, 2));

    try {
      // Validate input
      if (!cuttingListId || !sectionId) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Cutting list ID and section ID are required')
        );
        return;
      }

      // Validate item data
      const requiredFields = ['workOrderId', 'date', 'version', 'color', 'orderQuantity', 'size', 'profiles'];
      for (const field of requiredFields) {
        if (itemData[field] === undefined || itemData[field] === null || itemData[field] === '') {
          console.log(`[${requestId}] Missing required field: ${field}`);
          console.log(`[${requestId}] Available fields:`, Object.keys(itemData));
          console.log(`[${requestId}] Field values:`, {
            workOrderId: itemData.workOrderId,
            date: itemData.date,
            version: itemData.version,
            color: itemData.color,
            orderQuantity: itemData.orderQuantity,
            size: itemData.size,
            profiles: itemData.profiles
          });
          res.status(400).json(
            this.createResponse(false, undefined, `Field '${field}' is required`)
          );
          return;
        }
      }

      // Validate orderQuantity is a valid number
      const orderQuantity = parseInt(itemData.orderQuantity);
      if (isNaN(orderQuantity) || orderQuantity <= 0) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Order quantity must be a valid positive number')
        );
        return;
      }

      // Validate profiles
      if (!Array.isArray(itemData.profiles) || itemData.profiles.length === 0) {
        res.status(400).json(
          this.createResponse(false, undefined, 'At least one profile is required')
        );
        return;
      }

      for (const profile of itemData.profiles) {
        const profileFields = ['measurement', 'quantity'];
        for (const field of profileFields) {
          if (!profile[field]) {
            res.status(400).json(
              this.createResponse(false, undefined, `Profile field '${field}' is required`)
            );
            return;
          }
        }
        
        // Validate quantity is a valid number
        const quantity = parseInt(profile.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          res.status(400).json(
            this.createResponse(false, undefined, 'Profile quantity must be a valid positive number')
          );
          return;
        }
      }

      const cuttingList = this.cuttingLists.get(cuttingListId);
      
      if (!cuttingList) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Cutting list not found')
        );
        return;
      }

      const sectionIndex = cuttingList.sections.findIndex(s => s.id === sectionId);
      
      if (sectionIndex === -1) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Product section not found')
        );
        return;
      }

      // Ölçü dönüşümü utility fonksiyonu
      const convertMeasurementToMM = (input: string): string => {
        if (!input || typeof input !== 'string') return input;
        
        const trimmedInput = input.trim().toUpperCase();
        
        // CM dönüşümü
        if (trimmedInput.includes('CM')) {
          const cmValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
          const cmNumber = parseFloat(cmValue);
          if (!isNaN(cmNumber)) {
            const mmValue = Math.round(cmNumber * 10);
            return `${mmValue}`;
          }
        }
        
        // M dönüşümü
        if (trimmedInput.includes('M') && !trimmedInput.includes('MM')) {
          const mValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
          const mNumber = parseFloat(mValue);
          if (!isNaN(mNumber)) {
            const mmValue = Math.round(mNumber * 1000);
            return `${mmValue}`;
          }
        }
        
        // Zaten MM ise sadece sayıyı al
        if (trimmedInput.includes('MM')) {
          const mmValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
          const mmNumber = parseFloat(mmValue);
          if (!isNaN(mmNumber)) {
            return `${Math.round(mmNumber)}`;
          }
        }
        
        // Sadece sayı ise olduğu gibi döndür
        const numericValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
        const numericNumber = parseFloat(numericValue);
        if (!isNaN(numericNumber)) {
          return `${Math.round(numericNumber)}`;
        }
        
        return input;
      };

      const newItem: CuttingListItem = {
        id: this.generateId(),
        workOrderId: itemData.workOrderId,
        date: itemData.date,
        version: itemData.version,
        color: itemData.color,
        note: itemData.note || undefined,
        orderQuantity: orderQuantity,
        size: itemData.size,
        profiles: itemData.profiles.map((profile: { profile?: string; measurement: string; quantity: string | number }) => ({
          id: this.generateId(),
          profile: profile.profile || undefined,
          measurement: convertMeasurementToMM(profile.measurement),
          quantity: parseInt(String(profile.quantity))
        }))
      };

      const section = cuttingList.sections[sectionIndex];
      if (!section) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Product section not found')
        );
        return;
      }
      
      const updatedItems = [...section.items, newItem];
      const updatedSection: ProductSection = {
        ...section,
        items: updatedItems,
        updatedAt: new Date().toISOString()
      };

      const updatedSections = [...cuttingList.sections];
      updatedSections[sectionIndex] = updatedSection;

      const updatedCuttingList: CuttingList = {
        ...cuttingList,
        sections: updatedSections,
        updatedAt: new Date().toISOString()
      };

      this.cuttingLists.set(cuttingListId, updatedCuttingList);
      this.saveToStorage();

      // Update profile suggestion database
      this.profileSuggestionService.analyzeCuttingLists(Array.from(this.cuttingLists.values()));
      
      // Trigger smart suggestion database update in background
      setTimeout(() => {
        try {
          smartSuggestionService.reloadDatabase();
          console.log(`[SMART-LEARNING] Database updated after new item: ${newItem.id}`);
        } catch (error) {
          console.error('[SMART-LEARNING] Failed to update database:', error);
        }
      }, 2000); // 2 second delay to avoid blocking response

      console.log(`[${requestId}] Item added: ${newItem.id}`);
      
      res.json(
        this.createResponse(true, newItem)
      );

    } catch (error) {
      console.error(`[${requestId}] Error adding item:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Delete cutting list
   */
  public deleteCuttingList = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { id } = req.params;
    
    console.log(`[${requestId}] Deleting cutting list: ${id}`);

    try {
      // Validate input
      if (!id) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Cutting list ID is required')
        );
        return;
      }

      const cuttingList = this.cuttingLists.get(id);
      
      if (!cuttingList) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Cutting list not found')
        );
        return;
      }

      this.cuttingLists.delete(id);
      this.saveToStorage();

      console.log(`[${requestId}] Cutting list deleted: ${id}`);
      
      res.json(
        this.createResponse(true, { message: 'Cutting list deleted successfully' })
      );

    } catch (error) {
      console.error(`[${requestId}] Error deleting cutting list:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Delete product section
   */
  public deleteProductSection = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { cuttingListId, sectionId } = req.params;
    
    console.log(`[${requestId}] Deleting product section: ${sectionId}`);

    try {
      // Validate input
      if (!cuttingListId || !sectionId) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Cutting list ID and section ID are required')
        );
        return;
      }

      const cuttingList = this.cuttingLists.get(cuttingListId);
      
      if (!cuttingList) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Cutting list not found')
        );
        return;
      }

      const updatedSections = cuttingList.sections.filter(s => s.id !== sectionId);
      
      if (updatedSections.length === cuttingList.sections.length) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Product section not found')
        );
        return;
      }

      const updatedCuttingList: CuttingList = {
        ...cuttingList,
        sections: updatedSections,
        updatedAt: new Date().toISOString()
      };

      this.cuttingLists.set(cuttingListId, updatedCuttingList);
      this.saveToStorage();

      console.log(`[${requestId}] Product section deleted: ${sectionId}`);
      
      res.json(
        this.createResponse(true, { message: 'Product section deleted successfully' })
      );

    } catch (error) {
      console.error(`[${requestId}] Error deleting product section:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Update item in section
   */
  public updateItemInSection = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { cuttingListId, sectionId, itemId } = req.params;
    const itemData = req.body;
    
    console.log(`[${requestId}] Updating item: ${itemId} in section: ${sectionId}`);
    console.log(`[${requestId}] Request body:`, JSON.stringify(itemData, null, 2));
    console.log(`[${requestId}] Params:`, { cuttingListId, sectionId, itemId });

    try {
      // Validate input
      if (!cuttingListId || !sectionId || !itemId) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Cutting list ID, section ID and item ID are required')
        );
        return;
      }

      // Validate item data
      const requiredFields = ['workOrderId', 'date', 'version', 'color', 'orderQuantity', 'size', 'profiles'];
      for (const field of requiredFields) {
        if (itemData[field] === undefined || itemData[field] === null || itemData[field] === '') {
          console.log(`[${requestId}] Missing required field: ${field}`);
          console.log(`[${requestId}] Available fields:`, Object.keys(itemData));
          res.status(400).json(
            this.createResponse(false, undefined, `Field '${field}' is required`)
          );
          return;
        }
      }

      // Validate orderQuantity is a valid number
      const orderQuantity = parseInt(itemData.orderQuantity);
      if (isNaN(orderQuantity) || orderQuantity <= 0) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Order quantity must be a valid positive number')
        );
        return;
      }

      // Validate profiles
      if (!Array.isArray(itemData.profiles) || itemData.profiles.length === 0) {
        res.status(400).json(
          this.createResponse(false, undefined, 'At least one profile is required')
        );
        return;
      }

      for (const profile of itemData.profiles) {
        const profileFields = ['measurement', 'quantity'];
        for (const field of profileFields) {
          if (!profile[field]) {
            res.status(400).json(
              this.createResponse(false, undefined, `Profile field '${field}' is required`)
            );
            return;
          }
        }
        
        // Validate quantity is a valid number
        const quantity = parseInt(profile.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          res.status(400).json(
            this.createResponse(false, undefined, 'Profile quantity must be a valid positive number')
          );
          return;
        }
      }

      const cuttingList = this.cuttingLists.get(cuttingListId);
      
      if (!cuttingList) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Cutting list not found')
        );
        return;
      }

      const sectionIndex = cuttingList.sections.findIndex(s => s.id === sectionId);
      
      if (sectionIndex === -1) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Product section not found')
        );
        return;
      }

      const section = cuttingList.sections[sectionIndex];
      if (!section) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Product section not found')
        );
        return;
      }

      const itemIndex = section.items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Item not found')
        );
        return;
      }

      // Ölçü dönüşümü utility fonksiyonu
      const convertMeasurementToMM = (input: string): string => {
        if (!input || typeof input !== 'string') return input;
        
        const trimmedInput = input.trim().toUpperCase();
        
        // CM dönüşümü
        if (trimmedInput.includes('CM')) {
          const cmValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
          const cmNumber = parseFloat(cmValue);
          if (!isNaN(cmNumber)) {
            const mmValue = Math.round(cmNumber * 10);
            return `${mmValue}`;
          }
        }
        
        // M dönüşümü
        if (trimmedInput.includes('M') && !trimmedInput.includes('MM')) {
          const mValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
          const mNumber = parseFloat(mValue);
          if (!isNaN(mNumber)) {
            const mmValue = Math.round(mNumber * 1000);
            return `${mmValue}`;
          }
        }
        
        // Zaten MM ise sadece sayıyı al
        if (trimmedInput.includes('MM')) {
          const mmValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
          const mmNumber = parseFloat(mmValue);
          if (!isNaN(mmNumber)) {
            return `${Math.round(mmNumber)}`;
          }
        }
        
        // Sadece sayı ise olduğu gibi döndür
        const numericValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
        const numericNumber = parseFloat(numericValue);
        if (!isNaN(numericNumber)) {
          return `${Math.round(numericNumber)}`;
        }
        
        return input;
      };

      const updatedItem: CuttingListItem = {
        id: itemId, // Keep the same ID
        workOrderId: itemData.workOrderId,
        date: itemData.date,
        version: itemData.version,
        color: itemData.color,
        note: itemData.note || undefined,
        orderQuantity: orderQuantity,
        size: itemData.size,
        profiles: itemData.profiles.map((profile: { id?: string; profile?: string; measurement: string; quantity: string | number }) => ({
          id: profile.id || this.generateId(), // Keep existing ID or generate new one
          profile: profile.profile || undefined,
          measurement: convertMeasurementToMM(profile.measurement),
          quantity: parseInt(String(profile.quantity))
        }))
      };

      const updatedItems = [...section.items];
      updatedItems[itemIndex] = updatedItem;

      const updatedSection: ProductSection = {
        ...section,
        items: updatedItems,
        updatedAt: new Date().toISOString()
      };

      const updatedSections = [...cuttingList.sections];
      updatedSections[sectionIndex] = updatedSection;

      const updatedCuttingList: CuttingList = {
        ...cuttingList,
        sections: updatedSections,
        updatedAt: new Date().toISOString()
      };

      this.cuttingLists.set(cuttingListId, updatedCuttingList);
      this.saveToStorage();

      console.log(`[${requestId}] Item updated: ${itemId}`);
      
      res.json(
        this.createResponse(true, updatedItem)
      );

    } catch (error) {
      console.error(`[${requestId}] Error updating item:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Get enterprise profile suggestions
   */
  public getEnterpriseProfileSuggestions = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { productName, size, note, version, color, limit = 15 } = req.query;
    
    console.log(`[${requestId}] Getting enterprise profile suggestions for: ${productName}, size: ${size}`);

    try {
      // Validate required parameters
      if (!productName || typeof productName !== 'string') {
        res.status(400).json(
          this.createResponse(false, undefined, 'Product name is required')
        );
        return;
      }

      if (!size || typeof size !== 'string') {
        res.status(400).json(
          this.createResponse(false, undefined, 'Size is required')
        );
        return;
      }

      const limitNumber = parseInt(limit as string) || 15;
      
      const analysisResult = this.enterpriseProfileService.getSmartSuggestions(
        productName,
        size,
        note as string,
        version as string,
        color as string,
        limitNumber
      );

      console.log(`[${requestId}] Generated ${analysisResult.suggestions.length} enterprise suggestions`);
      
      res.json(
        this.createResponse(true, analysisResult)
      );

    } catch (error) {
      console.error(`[${requestId}] Error getting enterprise profile suggestions:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Get smart measurement suggestions for a profile
   */
  public getSmartMeasurementSuggestions = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { productName, size, profileType, limit = 10 } = req.query;
    
    console.log(`[${requestId}] Getting smart measurement suggestions for profile: ${profileType}`);

    try {
      if (!profileType || typeof profileType !== 'string') {
        res.status(400).json(
          this.createResponse(false, undefined, 'Profile type is required')
        );
        return;
      }

      const limitNumber = parseInt(limit as string) || 10;
      
      // If we have product name and size, get context-aware suggestions
      if (productName && size) {
        const analysisResult = this.enterpriseProfileService.getSmartSuggestions(
          productName as string,
          size as string,
          undefined,
          undefined,
          undefined,
          50 // Get more suggestions to filter by profile
        );

        // Filter suggestions by profile type
        const profileSpecificSuggestions = analysisResult.suggestions
          .filter(s => s.profile.toUpperCase().includes(profileType.toUpperCase()))
          .map(s => s.measurement)
          .slice(0, limitNumber);

        if (profileSpecificSuggestions.length > 0) {
          res.json(
            this.createResponse(true, {
              data: profileSpecificSuggestions,
              source: 'context-aware',
              contextInsights: analysisResult.contextualInsights
            })
          );
          return;
        }
      }

      // Fallback to static suggestions with enhanced logic
      const measurementMap: Record<string, string[]> = {
        'L': ['2000', '2500', '3000', '3500', '4000', '4500', '5000', '6000'],
        'U': ['1500', '2000', '2500', '3000', '3500', '4000', '4500', '5000'],
        'KARE': ['1000', '1500', '2000', '2500', '3000', '3500', '4000'],
        'YUVARLAK': ['1000', '1500', '2000', '2500', '3000', '3500', '4000'],
        'KAPALI': ['2000', '2500', '3000', '3500', '4000', '4500', '5000'],
        'AÇIK': ['2000', '2500', '3000', '3500', '4000', '4500', '5000'],
        'ALT': ['1500', '2000', '2500', '3000', '3500', '4000'],
        'ÜST': ['1500', '2000', '2500', '3000', '3500', '4000'],
        'DEFAULT': ['2000', '2500', '3000', '3500', '4000', '4500', '5000', '6000']
      };
      
      const profileTypeUpper = profileType.toUpperCase();
      let measurements: string[] = measurementMap['DEFAULT'] || [];
      
      // Find best matching profile type
      for (const [key, values] of Object.entries(measurementMap)) {
        if (profileTypeUpper.includes(key)) {
          measurements = values;
          break;
        }
      }

      res.json(
        this.createResponse(true, {
          data: measurements.slice(0, limitNumber),
          source: 'static-enhanced',
          profileType: profileTypeUpper
        })
      );

    } catch (error) {
      console.error(`[${requestId}] Error getting smart measurement suggestions:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Get available sizes for a product
   */
  public getProductSizes = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { productName } = req.query;
    
    if (!productName || typeof productName !== 'string') {
      res.status(400).json(this.createResponse(false, undefined, 'Product name is required'));
      return;
    }

    console.log(`[${requestId}] Getting sizes for product: ${productName}`);

    try {
      const sizes = this.enterpriseProfileService.getAvailableSizesForProduct(productName);
      res.json(this.createResponse(true, { sizes }));
    } catch (error) {
      console.error(`[${requestId}] Error getting product sizes:`, error);
      res.status(500).json(this.createResponse(false, undefined, 'Failed to get product sizes'));
    }
  });

  /**
   * Get complete profile set for product-size combination
   */
  public getCompleteProfileSet = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { productName, size, orderQuantity } = req.query;
    
    if (!productName || typeof productName !== 'string') {
      res.status(400).json(this.createResponse(false, undefined, 'Product name is required'));
      return;
    }
    
    if (!size || typeof size !== 'string') {
      res.status(400).json(this.createResponse(false, undefined, 'Size is required'));
      return;
    }

    const orderQty = orderQuantity && typeof orderQuantity === 'string' ? parseInt(orderQuantity) : undefined;

    console.log(`[${requestId}] Getting complete profile set for: ${productName} - ${size} (Order Qty: ${orderQty || 'auto'})`);

    try {
      const profileSet = this.enterpriseProfileService.getCompleteProfileSet(productName, size, orderQty);
      res.json(this.createResponse(true, profileSet));
    } catch (error) {
      console.error(`[${requestId}] Error getting complete profile set:`, error);
      res.status(500).json(this.createResponse(false, undefined, 'Failed to get complete profile set'));
    }
  });

  /**
   * Get enterprise suggestion statistics
   */
  public getEnterpriseSuggestionStats = this.asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    
    console.log(`[${requestId}] Getting enterprise suggestion statistics`);

    try {
      const stats = this.enterpriseProfileService.getStatistics();
      
      res.json(
        this.createResponse(true, stats)
      );

    } catch (error) {
      console.error(`[${requestId}] Error getting enterprise stats:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Refresh enterprise analysis
   */
  public refreshEnterpriseAnalysis = this.asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    
    console.log(`[${requestId}] Refreshing enterprise analysis`);

    try {
      this.enterpriseProfileService.refreshAnalysis();
      
      res.json(
        this.createResponse(true, { message: 'Analysis refreshed successfully' })
      );

    } catch (error) {
      console.error(`[${requestId}] Error refreshing enterprise analysis:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Delete item from section
   */
  public deleteItemFromSection = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { cuttingListId, sectionId, itemId } = req.params;
    
    console.log(`[${requestId}] Deleting item: ${itemId} from section: ${sectionId}`);

    try {
      // Validate input
      if (!cuttingListId || !sectionId || !itemId) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Cutting list ID, section ID and item ID are required')
        );
        return;
      }

      const cuttingList = this.cuttingLists.get(cuttingListId);
      
      if (!cuttingList) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Cutting list not found')
        );
        return;
      }

      const sectionIndex = cuttingList.sections.findIndex(s => s.id === sectionId);
      
      if (sectionIndex === -1) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Product section not found')
        );
        return;
      }

      const section = cuttingList.sections[sectionIndex];
      if (!section) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Product section not found')
        );
        return;
      }
      
      const updatedItems = section.items.filter(item => item.id !== itemId);
      
      if (updatedItems.length === section.items.length) {
        res.status(404).json(
          this.createResponse(false, undefined, 'Item not found')
        );
        return;
      }

      const updatedSection: ProductSection = {
        ...section,
        items: updatedItems,
        updatedAt: new Date().toISOString()
      };

      const updatedSections = [...cuttingList.sections];
      updatedSections[sectionIndex] = updatedSection;

      const updatedCuttingList: CuttingList = {
        ...cuttingList,
        sections: updatedSections,
        updatedAt: new Date().toISOString()
      };

      this.cuttingLists.set(cuttingListId, updatedCuttingList);
      this.saveToStorage();

      console.log(`[${requestId}] Item deleted: ${itemId}`);
      
      res.json(
        this.createResponse(true, { message: 'Item deleted successfully' })
      );

    } catch (error) {
      console.error(`[${requestId}] Error deleting item:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Export cutting list to PDF
   */
  exportToPDF = async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    
    try {
      console.log(`[${requestId}] PDF Export başlatılıyor...`);
      
      const { cuttingList } = req.body;
      
      if (!cuttingList) {
        console.log(`[${requestId}] HATA: Cutting list data is required`);
        res.status(400).json(
          this.createResponse(false, undefined, 'Cutting list data is required')
        );
        return;
      }
      
      console.log(`[${requestId}] Cutting list alındı:`, {
        id: cuttingList.id,
        title: cuttingList.title,
        sectionsCount: cuttingList.sections?.length || 0
      });
      
      console.log(`[${requestId}] Cutting list data:`, JSON.stringify(cuttingList, null, 2));

      // PDF export service ile PDF oluştur
      console.log(`[${requestId}] PDF oluşturuluyor...`);
      const pdfResult = await this.pdfExportService.exportToPDF(cuttingList);
      console.log(`[${requestId}] PDF oluşturuldu, boyut: ${pdfResult.size} bytes`);
      
      // Sanitize filename for HTTP headers
      const sanitizedTitle = cuttingList.title
        .replace(/[ğ]/g, 'g')
        .replace(/[Ğ]/g, 'G')
        .replace(/[ü]/g, 'u')
        .replace(/[Ü]/g, 'U')
        .replace(/[ş]/g, 's')
        .replace(/[Ş]/g, 'S')
        .replace(/[ı]/g, 'i')
        .replace(/[İ]/g, 'I')
        .replace(/[ö]/g, 'o')
        .replace(/[Ö]/g, 'O')
        .replace(/[ç]/g, 'c')
        .replace(/[Ç]/g, 'C')
        .replace(/[^a-zA-Z0-9\s_-]/g, '')
        .replace(/\s+/g, '_');
      
      // Set proper headers for PDF response
      res.setHeader('Content-Type', 'application/pdf; charset=binary');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}_${cuttingList.weekNumber}_hafta.pdf"`);
      res.setHeader('Content-Length', pdfResult.size.toString());
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      console.log(`[${requestId}] PDF export completed successfully`);
      res.send(pdfResult.buffer);
      
    } catch (error) {
      console.error(`[${requestId}] PDF Export hatası:`, error);
      console.error(`[${requestId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
      console.error(`[${requestId}] Error details:`, {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        cause: error instanceof Error ? error.cause : undefined
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // JSON response olarak döndür
      res.status(500).json({
        success: false,
        error: `PDF export failed: ${errorMessage}`,
        details: {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace'
        }
      });
    }
  };

  /**
   * Test PDF export service
   */
  testPDFExport = async (_req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    
    try {
      console.log(`[${requestId}] Testing PDF export service...`);
      
      // Create a simple test cutting list
      const testCuttingList = {
        id: 'test-123',
        title: 'Test Kesim Listesi',
        weekNumber: 1,
        sections: [
          {
            id: 'section-1',
            name: 'Test Bölümü',
            items: [
              {
                id: 'item-1',
                workOrderId: 'WO-001',
                date: new Date().toISOString(),
                version: '1.0',
                color: 'Beyaz',
                note: 'Test notu',
                orderQuantity: 10,
                size: '1000x500',
                profiles: [
                  {
                    id: 'profile-1',
                    profile: 'Test Profil',
                    measurement: '1000mm',
                    quantity: 5
                  }
                ]
              }
            ]
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log(`[${requestId}] Test cutting list created, testing PDF export...`);
      const pdfResult = await this.pdfExportService.exportToPDF(testCuttingList);
      console.log(`[${requestId}] Test PDF export successful, buffer size: ${pdfResult.size}`);
      
      res.json({
        success: true,
        message: 'PDF export service is working',
        bufferSize: pdfResult.size
      });
      
    } catch (error) {
      console.error(`[${requestId}] Test PDF export failed:`, error);
      res.status(500).json({
        success: false,
        message: 'PDF export service test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Analyze existing data for profile suggestions
   */
  private analyzeExistingData(): void {
    const requestId = this.generateRequestId();
    console.log(`[${requestId}] Analyzing existing cutting lists for profile suggestions...`);
    
    try {
      const cuttingLists = Array.from(this.cuttingLists.values());
      this.profileSuggestionService.analyzeCuttingLists(cuttingLists);
      
      const stats = this.profileSuggestionService.getDatabaseStats();
      console.log(`[${requestId}] Profile suggestion database initialized:`, stats);
    } catch (error) {
      console.error(`[${requestId}] Error analyzing existing data:`, error);
    }
  }

  /**
   * Get profile variations for a product and size
   */
  public getProfileVariations = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { productName, size } = req.query;
    
    console.log(`[${requestId}] Getting profile variations for: ${productName}, size: ${size}`);

    try {
      // Validate input
      if (!productName || typeof productName !== 'string') {
        res.status(400).json(
          this.createResponse(false, undefined, 'Product name is required')
        );
        return;
      }

      if (!size || typeof size !== 'string') {
        res.status(400).json(
          this.createResponse(false, undefined, 'Size is required')
        );
        return;
      }

      const variations = this.profileSuggestionService.getProfileVariations(productName, size);

      console.log(`[${requestId}] Found ${variations.length} profile variations`);
      
      res.json(
        this.createResponse(true, { variations })
      );

    } catch (error) {
      console.error(`[${requestId}] Error getting profile variations:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Get profile suggestions for a product and size
   */
  public getProfileSuggestions = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { productName, size, limit = 5 } = req.query;
    
    console.log(`[${requestId}] Getting profile suggestions for: ${productName}, size: ${size}`);

    try {
      // Validate input
      if (!productName || typeof productName !== 'string') {
        res.status(400).json(
          this.createResponse(false, undefined, 'Product name is required')
        );
        return;
      }

      if (!size || typeof size !== 'string') {
        res.status(400).json(
          this.createResponse(false, undefined, 'Size is required')
        );
        return;
      }

      const limitNumber = parseInt(limit as string) || 15;
      const suggestions = this.profileSuggestionService.getProfileSuggestions(productName, size, limitNumber);

      console.log(`[${requestId}] Found ${suggestions.length} suggestions`);
      
      res.json(
        this.createResponse(true, { suggestions })
      );

    } catch (error) {
      console.error(`[${requestId}] Error getting profile suggestions:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Search for similar products
   */
  public searchSimilarProducts = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { searchTerm } = req.query;
    
    console.log(`[${requestId}] Searching for products: ${searchTerm}`);

    try {
      // Validate input
      if (!searchTerm || typeof searchTerm !== 'string') {
        res.status(400).json(
          this.createResponse(false, undefined, 'Search term is required')
        );
        return;
      }

      const similarProducts = this.profileSuggestionService.searchSimilarProducts(searchTerm);

      console.log(`[${requestId}] Found ${similarProducts.length} similar products`);
      
      res.json(
        this.createResponse(true, { products: similarProducts })
      );

    } catch (error) {
      console.error(`[${requestId}] Error searching products:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Get sizes for a specific product
   */
  public getSizesForProduct = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    const { productName } = req.query;
    
    console.log(`[${requestId}] Getting sizes for product: ${productName}`);

    try {
      // Validate input
      if (!productName || typeof productName !== 'string') {
        res.status(400).json(
          this.createResponse(false, undefined, 'Product name is required')
        );
        return;
      }

      const sizes = this.profileSuggestionService.getSizesForProduct(productName);

      console.log(`[${requestId}] Found ${sizes.length} sizes for product`);
      
      res.json(
        this.createResponse(true, { sizes })
      );

    } catch (error) {
      console.error(`[${requestId}] Error getting sizes:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Get profile suggestion database statistics
   */
  public getProfileSuggestionStats = this.asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    console.log(`[${requestId}] Getting profile suggestion statistics`);

    try {
      const stats = this.profileSuggestionService.getDatabaseStats();
      const allSuggestions = this.profileSuggestionService.getAllProductSizeSuggestions();

      console.log(`[${requestId}] Retrieved statistics and ${allSuggestions.length} product-size combinations`);
      
      res.json(
        this.createResponse(true, { 
          stats,
          productSizeCombinations: allSuggestions.slice(0, 20) // Limit to top 20
        })
      );

    } catch (error) {
      console.error(`[${requestId}] Error getting statistics:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  });

  /**
   * Export cutting list to Excel
   */
  exportToExcel = async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();
    
    try {
      console.log(`[${requestId}] Exporting to Excel`);
      
      const { cuttingList } = req.body;
      
      if (!cuttingList) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Cutting list data is required')
        );
        return;
      }

      // Use Excel export service
      const excelBuffer = this.excelExportService.exportToExcel(cuttingList);
      
      // Sanitize filename for HTTP headers (remove Turkish characters and special chars)
      const sanitizedTitle = cuttingList.title
        .replace(/[ğ]/g, 'g')
        .replace(/[Ğ]/g, 'G')
        .replace(/[ü]/g, 'u')
        .replace(/[Ü]/g, 'U')
        .replace(/[ş]/g, 's')
        .replace(/[Ş]/g, 'S')
        .replace(/[ı]/g, 'i')
        .replace(/[İ]/g, 'I')
        .replace(/[ö]/g, 'o')
        .replace(/[Ö]/g, 'O')
        .replace(/[ç]/g, 'c')
        .replace(/[Ç]/g, 'C')
        .replace(/[^a-zA-Z0-9\s_-]/g, '')
        .replace(/\s+/g, '_');
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.xlsx"`);
      res.setHeader('Content-Length', excelBuffer.length.toString());
      
      console.log(`[${requestId}] Excel export completed`);
      res.send(excelBuffer);
      
    } catch (error) {
      console.error(`[${requestId}] Error exporting to Excel:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(
        this.createResponse(false, undefined, errorMessage)
      );
    }
  };

  // ============================================================================
  // QUANTITY CALCULATION METHODS
  // ============================================================================

  /**
   * Calculate quantity based on order quantity and optional size/profile
   */
           calculateQuantity = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
           const requestId = this.generateRequestId();

           try {
             console.log(`[${requestId}] Calculating quantity`);


                         const { siparisAdedi, size, profile, profileIndex, totalProfiles, productName } = req.body;

            if (!siparisAdedi || typeof siparisAdedi !== 'number') {
              res.status(400).json(
                this.createResponse(false, undefined, 'Sipariş adedi is required and must be a number')
              );
              return;
            }

            const result = this.quantityCalculationService.calculateQuantity(
              siparisAdedi, 
              size, 
              profile, 
              profileIndex || 0, 
              totalProfiles || 1,
              productName
            );

             console.log(`[${requestId}] Quantity calculation completed:`, result);

             res.json(
               this.createResponse(true, result)
             );

           } catch (error) {
             console.error(`[${requestId}] Error calculating quantity:`, error);

             const errorMessage = error instanceof Error ? error.message : 'Unknown error';
             res.status(500).json(
               this.createResponse(false, undefined, errorMessage)
             );
           }
         });

  /**
   * Get quantity suggestions for a given order quantity
   */
           getQuantitySuggestions = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
           const requestId = this.generateRequestId();

           try {
             console.log(`[${requestId}] Getting quantity suggestions`);

             const { siparisAdedi, size, profile, profileIndex, totalProfiles } = req.body;

             if (!siparisAdedi || typeof siparisAdedi !== 'number') {
               res.status(400).json(
                 this.createResponse(false, undefined, 'Sipariş adedi is required and must be a number')
               );
               return;
             }

             const suggestions = this.quantityCalculationService.getQuantitySuggestions(
               siparisAdedi, 
               size, 
               profile, 
               profileIndex || 0, 
               totalProfiles || 1
             );

             console.log(`[${requestId}] Quantity suggestions retrieved:`, suggestions);

             res.json(
               this.createResponse(true, suggestions)
             );

           } catch (error) {
             console.error(`[${requestId}] Error getting quantity suggestions:`, error);

             const errorMessage = error instanceof Error ? error.message : 'Unknown error';
             res.status(500).json(
               this.createResponse(false, undefined, errorMessage)
             );
           }
         });

  /**
   * Validate quantity for a given order quantity
   */
           validateQuantity = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
           const requestId = this.generateRequestId();

           try {
             console.log(`[${requestId}] Validating quantity`);

             const { siparisAdedi, adet, size, profile, profileIndex, totalProfiles } = req.body;

             if (!siparisAdedi || typeof siparisAdedi !== 'number') {
               res.status(400).json(
                 this.createResponse(false, undefined, 'Sipariş adedi is required and must be a number')
               );
               return;
             }

             if (!adet || typeof adet !== 'number') {
               res.status(400).json(
                 this.createResponse(false, undefined, 'Adet is required and must be a number')
               );
               return;
             }

             const validation = this.quantityCalculationService.validateQuantity(
               siparisAdedi, 
               adet, 
               size, 
               profile, 
               profileIndex || 0, 
               totalProfiles || 1
             );

             console.log(`[${requestId}] Quantity validation completed:`, validation);

             res.json(
               this.createResponse(true, validation)
             );

           } catch (error) {
             console.error(`[${requestId}] Error validating quantity:`, error);

             const errorMessage = error instanceof Error ? error.message : 'Unknown error';
             res.status(500).json(
               this.createResponse(false, undefined, errorMessage)
             );
           }
         });

  /**
   * Get all possible quantities for a given order quantity
   */
           getPossibleQuantities = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
           const requestId = this.generateRequestId();

           try {
             console.log(`[${requestId}] Getting possible quantities`);

             const { siparisAdedi, size, profile, profileIndex, totalProfiles } = req.body;

             if (!siparisAdedi || typeof siparisAdedi !== 'number') {
               res.status(400).json(
                 this.createResponse(false, undefined, 'Sipariş adedi is required and must be a number')
               );
               return;
             }

             const possibilities = this.quantityCalculationService.getPossibleQuantities(
               siparisAdedi, 
               size, 
               profile, 
               profileIndex || 0, 
               totalProfiles || 1
             );

             console.log(`[${requestId}] Possible quantities retrieved:`, possibilities);

             res.json(
               this.createResponse(true, possibilities)
             );

           } catch (error) {
             console.error(`[${requestId}] Error getting possible quantities:`, error);

             const errorMessage = error instanceof Error ? error.message : 'Unknown error';
             res.status(500).json(
               this.createResponse(false, undefined, errorMessage)
             );
           }
         });
  // ============================================================================
  // EXCEL IMPORT METHODS
  // ============================================================================

  public importExcelData = async (req: Request, res: Response): Promise<void> => {
    const requestId = `import-${Date.now()}`;
    
    try {
      console.log(`[${requestId}] Excel data import started`);
      
      const { filePath, weekNumber, title, forceCreate } = req.body;
      
      if (!filePath) {
        res.status(400).json(
          this.createResponse(false, undefined, 'Excel file path is required')
        );
        return;
      }

      const targetWeek = weekNumber || 27;
      const targetTitle = title || `${targetWeek}. HAFTA KESİM LİSTESİ (Excel Import)`;

      // Mevcut listeyi bul veya yeni oluştur (hafta kontrolü yapmadan)
      let cuttingListId = null;
      
      if (!forceCreate) {
        // Mevcut listeyi ara
        const existingLists = Array.from(this.cuttingLists.values()).filter(list => list.weekNumber === targetWeek);
        if (existingLists.length > 0 && existingLists[0]) {
          cuttingListId = existingLists[0].id;
          console.log(`[${requestId}] Mevcut liste kullanılıyor: ${cuttingListId} (${targetWeek}. hafta)`);
        }
      }
      
      if (!cuttingListId) {
        // Yeni liste oluştur (hafta kontrolü bypass)
        const newCuttingList: CuttingList = {
          id: this.generateId(),
          title: targetTitle,
          weekNumber: targetWeek,
          sections: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        this.cuttingLists.set(newCuttingList.id, newCuttingList);
        this.saveToStorage();
        cuttingListId = newCuttingList.id;
        
        console.log(`[${requestId}] Yeni Excel import listesi oluşturuldu: ${cuttingListId} (${targetWeek}. hafta)`);
      }

      const result = {
        imported: true,
        cuttingListId: cuttingListId,
        filePath: filePath,
        weekNumber: targetWeek,
        title: targetTitle,
        message: 'Excel import için kesim listesi hazır'
      };

      console.log(`[${requestId}] Excel import completed`);
      
      // Trigger smart suggestion database update in background after Excel import
      setTimeout(() => {
        try {
          smartSuggestionService.reloadDatabase();
          console.log(`[SMART-LEARNING] Database updated after Excel import: ${cuttingListId}`);
        } catch (error) {
          console.error('[SMART-LEARNING] Failed to update database after import:', error);
        }
      }, 3000); // 3 second delay for Excel imports

      res.json(
        this.createResponse(true, result, 'Excel import ready')
      );
    } catch (error: unknown) {
      console.error(`[${requestId}] Excel import error:`, error);
      res.status(500).json(
        this.createResponse(false, undefined, `Excel import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  };
}

// ============================================================================
// ERROR HANDLER MIDDLEWARE
// ============================================================================

/**
 * Global error handler for cutting list routes
 */
export const cuttingListErrorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Cutting list route error:', error);
  
  const response: ApiResponse = {
    success: false,
    error: error instanceof Error ? error.message : 'Internal server error',
    timestamp: new Date().toISOString()
  };
  
  res.status(500).json(response);
};

// ============================================================================
// SMART SUGGESTION ENDPOINTS
// ============================================================================

/**
 * Get smart product suggestions
 */
export const getSmartProductSuggestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.headers['x-request-id'] || Date.now();
  
  try {
    console.log(`[REQ-${requestId}] Getting smart product suggestions`);
    
    const { query = '', limit = 10 } = req.query;
    
    const suggestions = smartSuggestionService.getProductSuggestions(
      String(query),
      parseInt(String(limit))
    );
    
    console.log(`[REQ-${requestId}] Found ${suggestions.data.length} product suggestions`);
    
    const response: ApiResponse = {
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Smart product suggestions error:`, error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get product suggestions',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

/**
 * Get smart size suggestions
 */
export const getSmartSizeSuggestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.headers['x-request-id'] || Date.now();
  
  try {
    console.log(`[REQ-${requestId}] Getting smart size suggestions`);
    
    const { productName, query = '', limit = 10 } = req.query;
    
    const suggestions = smartSuggestionService.getSizeSuggestions(
      productName ? String(productName) : undefined,
      String(query),
      parseInt(String(limit))
    );
    
    console.log(`[REQ-${requestId}] Found ${suggestions.data.length} size suggestions`);
    
    const response: ApiResponse = {
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Smart size suggestions error:`, error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get size suggestions',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

/**
 * Get smart profile suggestions
 */
export const getSmartProfileSuggestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.headers['x-request-id'] || Date.now();
  
  try {
    console.log(`[REQ-${requestId}] Getting smart profile suggestions`);
    
    const { productName, size, query = '', limit = 10 } = req.query;
    
    const suggestions = smartSuggestionService.getProfileSuggestions(
      productName ? String(productName) : undefined,
      size ? String(size) : undefined,
      String(query),
      parseInt(String(limit))
    );
    
    console.log(`[REQ-${requestId}] Found ${suggestions.data.length} profile suggestions`);
    
    const response: ApiResponse = {
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Smart profile suggestions error:`, error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get profile suggestions',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

/**
 * Get auto-complete suggestions
 */
export const getAutoCompleteSuggestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.headers['x-request-id'] || Date.now();
  
  try {
    console.log(`[REQ-${requestId}] Getting auto-complete suggestions`);
    
    const { type, query, limit = 5 } = req.query;
    
    if (!type || !query) {
      const response: ApiResponse = {
        success: false,
        error: 'Type and query parameters are required',
        timestamp: new Date().toISOString()
      };
      
      res.status(400).json(response);
      return;
    }
    
    const validTypes = ['product', 'size', 'profile', 'color', 'measurement'];
    if (!validTypes.includes(String(type))) {
      const response: ApiResponse = {
        success: false,
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
        timestamp: new Date().toISOString()
      };
      
      res.status(400).json(response);
      return;
    }
    
    const suggestions = smartSuggestionService.getAutoCompleteSuggestions(
      String(type) as any,
      String(query),
      parseInt(String(limit))
    );
    
    console.log(`[REQ-${requestId}] Found ${suggestions.length} auto-complete suggestions`);
    
    const response: ApiResponse = {
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Auto-complete suggestions error:`, error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get auto-complete suggestions',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

/**
 * Get smart suggestion database statistics
 */
export const getSmartSuggestionStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.headers['x-request-id'] || Date.now();
  
  try {
    console.log(`[REQ-${requestId}] Getting smart suggestion stats`);
    
    const stats = smartSuggestionService.getDatabaseStats();
    
    console.log(`[REQ-${requestId}] Smart suggestion stats retrieved`);
    
    const response: ApiResponse = {
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Smart suggestion stats error:`, error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get suggestion stats',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

  /**
   * Reload smart suggestion database
   */
export const reloadSmartSuggestionDatabase = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.headers['x-request-id'] || Date.now();
  
  try {
    console.log(`[REQ-${requestId}] Reloading smart suggestion database`);
    
    const success = smartSuggestionService.reloadDatabase();
    
    if (success) {
      console.log(`[REQ-${requestId}] Smart suggestion database reloaded successfully`);
      
      const response: ApiResponse = {
        success: true,
        data: { reloaded: true },
        message: 'Smart suggestion database reloaded successfully',
        timestamp: new Date().toISOString()
      };
      
      res.json(response);
    } else {
      throw new Error('Failed to reload database');
    }
    
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Smart suggestion database reload error:`, error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reload suggestion database',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

// ============================================================================
// NEW SMART WORK ORDER CREATION API ENDPOINTS
// ============================================================================

/**
 * Get smart suggestions for work order creation
 */
export const getSmartWorkOrderSuggestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.headers['x-request-id'] || Date.now();
  
  try {
    console.log(`[REQ-${requestId}] Getting smart work order suggestions`);
    
    const { productName, size, limit = 10 } = req.query;
    
    if (!productName || !size) {
      const response: ApiResponse = {
        success: false,
        error: 'Product name and size are required',
        timestamp: new Date().toISOString()
      };
      
      res.status(400).json(response);
      return;
    }
    
    // Context parsing removed as it's not used
    
    // Get smart suggestions from the service
    const suggestions = smartSuggestionService.getProfileSuggestions(
      String(productName),
      String(size),
      '',
      parseInt(String(limit))
    );
    
    console.log(`[REQ-${requestId}] Found ${suggestions.data.length} smart suggestions`);
    
    const response: ApiResponse = {
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Smart work order suggestions error:`, error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get smart suggestions',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

/**
 * Get smart insights for work order data
 */
export const getSmartWorkOrderInsights = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.headers['x-request-id'] || Date.now();
  
  try {
    console.log(`[REQ-${requestId}] Getting smart work order insights`);
    
    const workOrderData = req.body;
    
    if (!workOrderData) {
      const response: ApiResponse = {
        success: false,
        error: 'Work order data is required',
        timestamp: new Date().toISOString()
      };
      
      res.status(400).json(response);
      return;
    }
    
    // Return basic work order data analysis
    const insights = [{
      type: 'info',
      message: 'Work order data received successfully',
      timestamp: new Date().toISOString()
    }];
    
    console.log(`[REQ-${requestId}] Generated ${insights.length} insights`);
    
    const response: ApiResponse = {
      success: true,
      data: insights,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Smart work order insights error:`, error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate insights',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

/**
 * Apply smart profile set to work order
 */
export const applySmartProfileSet = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.headers['x-request-id'] || Date.now();
  
  try {
    console.log(`[REQ-${requestId}] Applying smart profile set`);
    
    const { productName, size, orderQuantity, suggestionId } = req.body;
    
    if (!productName || !size || !suggestionId) {
      const response: ApiResponse = {
        success: false,
        error: 'Product name, size, and suggestion ID are required',
        timestamp: new Date().toISOString()
      };
      
      res.status(400).json(response);
      return;
    }
    
    // Return mock profile set
    const profileSet = {
      id: suggestionId,
      productName: String(productName),
      size: String(size),
      profiles: [
        {
          id: 'profile-1',
          profile: 'L Profil',
          measurement: '2000',
          quantity: orderQuantity ? parseInt(String(orderQuantity)) * 2 : 10
        }
      ]
    };
    
    
    console.log(`[REQ-${requestId}] Applied smart profile set with ${profileSet.profiles.length} profiles`);
    
    const response: ApiResponse = {
      success: true,
      data: profileSet,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Apply smart profile set error:`, error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to apply smart profile set',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

/**
 * Get work order templates
 */
export const getWorkOrderTemplates = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.headers['x-request-id'] || Date.now();
  
  try {
    console.log(`[REQ-${requestId}] Getting work order templates`);
    
    const { limit = 20 } = req.query;
    
    const templates = [
      {
        id: 'template-1',
        name: 'Standard Template',
        category: 'general',
        description: 'Basic work order template'
      }
    ].slice(0, parseInt(String(limit)));
    
    console.log(`[REQ-${requestId}] Found ${templates.length} work order templates`);
    
    const response: ApiResponse = {
      success: true,
      data: templates,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Get work order templates error:`, error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get work order templates',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

/**
 * Duplicate work order with smart modifications
 */
export const duplicateWorkOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.headers['x-request-id'] || Date.now();
  
  try {
    console.log(`[REQ-${requestId}] Duplicating work order`);
    
    const { workOrderId } = req.body;
    
    if (!workOrderId) {
      const response: ApiResponse = {
        success: false,
        error: 'Work order ID is required',
        timestamp: new Date().toISOString()
      };
      
      res.status(400).json(response);
      return;
    }
    
    // Return mock duplicated work order
    const duplicatedWorkOrder = {
      id: `duplicate-${workOrderId}`,
      workOrderId: `DUP-${workOrderId}`,
      date: new Date().toISOString().split('T')[0],
      version: '1.0',
      color: 'Duplicated',
      note: 'Duplicated work order',
      orderQuantity: 1,
      size: 'Standard',
      profiles: [
        {
          id: 'profile-1',
          profile: 'L Profil',
          measurement: '2000',
          quantity: 2
        }
      ]
    };
    
    
    console.log(`[REQ-${requestId}] Work order duplicated successfully`);
    
    const response: ApiResponse = {
      success: true,
      data: duplicatedWorkOrder,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Duplicate work order error:`, error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to duplicate work order',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
};

// ============================================================================
// SMART SUGGESTIONS CONTROLLERS
// ============================================================================

export const getAvailableSizes = async (req: Request, res: Response) => {
  try {
    const { productName } = req.query;
    
    console.log('🔍 Backend: getAvailableSizes called with productName:', productName);
    
    if (!productName || typeof productName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Product name is required',
        timestamp: new Date().toISOString()
      });
    }

    // Get all cutting lists from the controller instance
    const controller = new CuttingListController();
    const cuttingLists = controller.getAllCuttingListsData();
    
    console.log('📊 Backend: Found cutting lists:', cuttingLists.length);
    console.log('📊 Backend: Cutting lists data:', JSON.stringify(cuttingLists, null, 2));

    // Extract unique sizes for the given product
    const sizes = new Set<string>();
    
    cuttingLists.forEach((cuttingList: CuttingList) => {
      console.log('🔍 Backend: Processing cutting list:', cuttingList.title);
      cuttingList.sections.forEach((section: ProductSection) => {
        console.log('🔍 Backend: Processing section:', section.productName);
        if (section.productName.toLowerCase().includes(productName.toLowerCase())) {
          console.log('✅ Backend: Section matches product name');
          section.items.forEach((item: CuttingListItem) => {
            console.log('🔍 Backend: Processing item with size:', item.size);
            if (item.size && item.size.trim()) {
              sizes.add(item.size.trim());
              console.log('✅ Backend: Added size:', item.size.trim());
            }
          });
        }
      });
    });

    const availableSizes = Array.from(sizes).sort();
    console.log('📊 Backend: Final available sizes:', availableSizes);

    return res.json({
      success: true,
      data: availableSizes,
      message: `Found ${availableSizes.length} available sizes for product: ${productName}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting available sizes:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get available sizes',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

export const getProfileCombinations = async (req: Request, res: Response) => {
  try {
    const { productName, size } = req.query;
    
    if (!productName || typeof productName !== 'string' || !size || typeof size !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Product name and size are required',
        timestamp: new Date().toISOString()
      });
    }

    // Get all cutting lists from the controller instance
    const controller = new CuttingListController();
    const cuttingLists = controller.getAllCuttingListsData();

    // Find matching items
    const matchingItems: (CuttingListItem & { sectionProductName: string })[] = [];
    
    cuttingLists.forEach((cuttingList: CuttingList) => {
      cuttingList.sections.forEach((section: ProductSection) => {
        if (section.productName.toLowerCase().includes(productName.toLowerCase())) {
          section.items.forEach((item: CuttingListItem) => {
            if (item.size && item.size.toLowerCase().includes(size.toLowerCase())) {
              matchingItems.push({
                ...item,
                sectionProductName: section.productName
              });
            }
          });
        }
      });
    });

    // Group by profile combinations
    const combinationMap = new Map<string, {
      profiles: Array<{ profile: string; measurement: string; ratio: number }>;
      usageCount: number;
      lastUsed: string;
    }>();

    matchingItems.forEach(item => {
      // Create a key for this combination
      const profileKey = item.profiles
        .map((p: ProfileItem) => `${p.profile}-${p.measurement}`)
        .sort()
        .join('|');

      if (!combinationMap.has(profileKey)) {
        // Calculate ratios based on order quantity
        const profiles = item.profiles.map((profile: ProfileItem) => ({
          profile: profile.profile || 'Unknown',
          measurement: profile.measurement,
          ratio: item.orderQuantity > 0 ? profile.quantity / item.orderQuantity : 0
        }));

        combinationMap.set(profileKey, {
          profiles,
          usageCount: 1,
          lastUsed: new Date().toISOString()
        });
      } else {
        const existing = combinationMap.get(profileKey)!;
        existing.usageCount++;
        
        // Update ratios with average
        existing.profiles.forEach((profile: { ratio: number }, index: number) => {
          const currentProfile = item.profiles[index];
          if (currentProfile) {
            const currentRatio = item.orderQuantity > 0 ? currentProfile.quantity / item.orderQuantity : 0;
            profile.ratio = (profile.ratio + currentRatio) / 2;
          }
        });

        // Update last used date
        const itemDate = new Date().toISOString();
        if (new Date(itemDate) > new Date(existing.lastUsed)) {
          existing.lastUsed = itemDate;
        }
      }
    });

    // Convert to array and sort by usage count
    const combinations = Array.from(combinationMap.entries()).map(([, data], index) => ({
      id: `combination-${index + 1}`,
      ...data
    })).sort((a, b) => b.usageCount - a.usageCount);

    return res.json({
      success: true,
      data: combinations,
      message: `Found ${combinations.length} profile combinations for ${productName} - ${size}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting profile combinations:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get profile combinations',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};
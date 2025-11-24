/**
 * @fileoverview Cutting List Controller - Refactored with Composition Pattern
 * @module controllers/cuttingListController
 * @version 3.0.0 - Refactored for Clean Architecture
 * @description Main controller using composition pattern to delegate to specialized controllers
 */

import { Request, Response, NextFunction } from "express";
import { CuttingListCRUDController } from "./cuttingList/CuttingListCRUDController";
import { CuttingListSectionController } from "./cuttingList/CuttingListSectionController";
import { CuttingListItemController } from "./cuttingList/CuttingListItemController";
import { CuttingListSuggestionController } from "./cuttingList/CuttingListSuggestionController";
import { CuttingListQuantityController } from "./cuttingList/CuttingListQuantityController";
import { CuttingListImportController } from "./cuttingList/CuttingListImportController";
import { CuttingListExportController } from "./cuttingListExportController";
import { logger } from "../services/logger";
import type { CuttingList } from "../types/cuttingList";
import type { ApiResponse } from "./cuttingList/shared/CuttingListBaseController";

/**
 * Cutting List Controller (Refactored)
 * Uses composition pattern to delegate to specialized controllers
 * Maintains backward compatibility with existing routes
 */
export class CuttingListController {
  // Specialized controllers
  private readonly crudController: CuttingListCRUDController;
  private readonly sectionController: CuttingListSectionController;
  private readonly itemController: CuttingListItemController;
  private readonly suggestionController: CuttingListSuggestionController;
  private readonly quantityController: CuttingListQuantityController;
  private readonly importController: CuttingListImportController;
  private readonly exportController: CuttingListExportController;

  // ============================================================================
  // CRUD Operations - Delegated to CuttingListCRUDController
  // ============================================================================

  /**
   * Create new cutting list
   */
  public createCuttingList!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Get all cutting lists
   */
  public getAllCuttingLists!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Get cutting list by ID
   */
  public getCuttingListById!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Update cutting list
   */
  public updateCuttingList!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Delete cutting list
   */
  public deleteCuttingList!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Get all cutting lists data (internal use)
   */
  public async getAllCuttingListsData(): Promise<CuttingList[]> {
    return this.crudController.getAllCuttingListsData();
  }

  // ============================================================================
  // Section Operations - Delegated to CuttingListSectionController
  // ============================================================================

  /**
   * Add product section
   */
  public addProductSection!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Delete product section
   */
  public deleteProductSection!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  // ============================================================================
  // Item Operations - Delegated to CuttingListItemController
  // ============================================================================

  /**
   * Add item to section
   */
  public addItemToSection!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Update item in section
   */
  public updateItemInSection!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Delete item from section
   */
  public deleteItemFromSection!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  // ============================================================================
  // Suggestion Operations - Delegated to CuttingListSuggestionController
  // ============================================================================

  /**
   * Get enterprise profile suggestions
   */
  public getEnterpriseProfileSuggestions!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Get smart measurement suggestions
   */
  public getSmartMeasurementSuggestions!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Get product sizes
   */
  public getProductSizes!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Get complete profile set
   */
  public getCompleteProfileSet!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Get enterprise suggestion stats
   */
  public getEnterpriseSuggestionStats!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Refresh enterprise analysis
   */
  public refreshEnterpriseAnalysis!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Get profile variations
   */
  public getProfileVariations!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Get profile suggestions
   */
  public getProfileSuggestions!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Search similar products
   */
  public searchSimilarProducts!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Get sizes for product
   */
  public getSizesForProduct!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Get profile suggestion stats
   */
  public getProfileSuggestionStats!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  // ============================================================================
  // Quantity Operations - Delegated to CuttingListQuantityController
  // ============================================================================

  /**
   * Calculate quantity
   */
  public calculateQuantity!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Get quantity suggestions
   */
  public getQuantitySuggestions!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Validate quantity
   */
  public validateQuantity!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Get possible quantities
   */
  public getPossibleQuantities!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  // ============================================================================
  // Import Operations - Delegated to CuttingListImportController
  // ============================================================================

  /**
   * Import Excel data
   */
  public importExcelData!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  // ============================================================================
  // Export Operations - Delegated to CuttingListExportController
  // ============================================================================

  /**
   * Export to PDF
   */
  public exportToPDF!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Test PDF export
   */
  public testPDFExport!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  /**
   * Export to Excel
   */
  public exportToExcel!: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  constructor() {
    // Initialize specialized controllers
    this.crudController = new CuttingListCRUDController();
    this.sectionController = new CuttingListSectionController();
    this.itemController = new CuttingListItemController();
    this.suggestionController = new CuttingListSuggestionController();
    this.quantityController = new CuttingListQuantityController();
    this.importController = new CuttingListImportController();
    this.exportController = new CuttingListExportController();

    // Bind methods after initialization
    this.createCuttingList = this.crudController.createCuttingList.bind(
      this.crudController,
    );
    this.getAllCuttingLists = this.crudController.getAllCuttingLists.bind(
      this.crudController,
    );
    this.getCuttingListById = this.crudController.getCuttingListById.bind(
      this.crudController,
    );
    this.updateCuttingList = this.crudController.updateCuttingList.bind(
      this.crudController,
    );
    this.deleteCuttingList = this.crudController.deleteCuttingList.bind(
      this.crudController,
    );

    this.addProductSection = this.sectionController.addProductSection.bind(
      this.sectionController,
    );
    this.deleteProductSection =
      this.sectionController.deleteProductSection.bind(this.sectionController);

    this.addItemToSection = this.itemController.addItemToSection.bind(
      this.itemController,
    );
    this.updateItemInSection = this.itemController.updateItemInSection.bind(
      this.itemController,
    );
    this.deleteItemFromSection = this.itemController.deleteItemFromSection.bind(
      this.itemController,
    );

    this.getEnterpriseProfileSuggestions =
      this.suggestionController.getEnterpriseProfileSuggestions.bind(
        this.suggestionController,
      );
    this.getSmartMeasurementSuggestions =
      this.suggestionController.getSmartMeasurementSuggestions.bind(
        this.suggestionController,
      );
    this.getProductSizes = this.suggestionController.getProductSizes.bind(
      this.suggestionController,
    );
    this.getCompleteProfileSet =
      this.suggestionController.getCompleteProfileSet.bind(
        this.suggestionController,
      );
    this.getEnterpriseSuggestionStats =
      this.suggestionController.getEnterpriseSuggestionStats.bind(
        this.suggestionController,
      );
    this.refreshEnterpriseAnalysis =
      this.suggestionController.refreshEnterpriseAnalysis.bind(
        this.suggestionController,
      );
    this.getProfileVariations =
      this.suggestionController.getProfileVariations.bind(
        this.suggestionController,
      );
    this.getProfileSuggestions =
      this.suggestionController.getProfileSuggestions.bind(
        this.suggestionController,
      );
    this.searchSimilarProducts =
      this.suggestionController.searchSimilarProducts.bind(
        this.suggestionController,
      );
    this.getSizesForProduct = this.suggestionController.getSizesForProduct.bind(
      this.suggestionController,
    );
    this.getProfileSuggestionStats =
      this.suggestionController.getProfileSuggestionStats.bind(
        this.suggestionController,
      );

    this.calculateQuantity = this.quantityController.calculateQuantity.bind(
      this.quantityController,
    );
    this.getQuantitySuggestions =
      this.quantityController.getQuantitySuggestions.bind(
        this.quantityController,
      );
    this.validateQuantity = this.quantityController.validateQuantity.bind(
      this.quantityController,
    );
    this.getPossibleQuantities =
      this.quantityController.getPossibleQuantities.bind(
        this.quantityController,
      );

    this.importExcelData = this.importController.importExcelData.bind(
      this.importController,
    );

    this.exportToPDF = this.exportController.exportToPDF.bind(
      this.exportController,
    );
    this.testPDFExport = this.exportController.testPDFExport.bind(
      this.exportController,
    );
    this.exportToExcel = this.exportController.exportToExcel.bind(
      this.exportController,
    );
  }
}

/**
 * Singleton instance
 */
let controllerInstance: CuttingListController | null = null;

/**
 * Get singleton instance of CuttingListController
 */
export const getCuttingListController = (): CuttingListController => {
  if (!controllerInstance) {
    controllerInstance = new CuttingListController();
  }
  return controllerInstance;
};

/**
 * Error handler for cutting list routes
 */
export const cuttingListErrorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error(
    "[CuttingList] Route error",
    error instanceof Error ? error : new Error(String(error)),
  );

  const response: ApiResponse = {
    success: false,
    error: error instanceof Error ? error.message : "Internal server error",
    timestamp: new Date().toISOString(),
  };

  res.status(500).json(response);
};

/**
 * Legacy exports for backward compatibility
 * These will be deprecated in a future version
 */
export {
  getSmartProductSuggestions,
  getSmartSizeSuggestions,
  getSmartProfileSuggestions,
  getAutoCompleteSuggestions,
  getSmartSuggestionStats,
  reloadSmartSuggestionDatabase,
  getSmartWorkOrderSuggestions,
  getSmartWorkOrderInsights,
  applySmartProfileSet,
  getWorkOrderTemplates,
  duplicateWorkOrder,
  getAvailableSizes,
  getProfileCombinations,
} from "./cuttingList/deprecated";

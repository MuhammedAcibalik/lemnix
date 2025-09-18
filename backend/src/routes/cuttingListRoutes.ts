/**
 * @fileoverview Cutting List Routes
 * @module CuttingListRoutes
 * @version 1.0.0
 */

import { Router, Request, Response } from 'express';
import { 
  CuttingListController, 
  cuttingListErrorHandler,
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
  getProfileCombinations
} from '../controllers/cuttingListController';

const router = Router();
const cuttingListController = new CuttingListController();

// ============================================================================
// CUTTING LIST ROUTES
// ============================================================================

// Create new cutting list
router.post('/', cuttingListController.createCuttingList);

// Get all cutting lists
router.get('/', cuttingListController.getAllCuttingLists);

// Test PDF export (must be before /:id route)
router.get('/test-pdf', cuttingListController.testPDFExport);

// Get cutting list by ID
router.get('/:id', cuttingListController.getCuttingListById);

// Update cutting list
router.put('/:id', cuttingListController.updateCuttingList);

// Delete cutting list
router.delete('/:id', cuttingListController.deleteCuttingList);

// ============================================================================
// PRODUCT SECTION ROUTES
// ============================================================================

// Add product section to cutting list
router.post('/:cuttingListId/sections', cuttingListController.addProductSection);

// Delete product section
router.delete('/:cuttingListId/sections/:sectionId', cuttingListController.deleteProductSection);

// ============================================================================
// ITEM ROUTES
// ============================================================================

// Add item to product section
router.post('/:cuttingListId/sections/:sectionId/items', cuttingListController.addItemToSection);

// Update item in section
router.put('/:cuttingListId/sections/:sectionId/items/:itemId', cuttingListController.updateItemInSection);

// Delete item from section
router.delete('/:cuttingListId/sections/:sectionId/items/:itemId', cuttingListController.deleteItemFromSection);

// ============================================================================
// EXPORT ROUTES
// ============================================================================

// Export to PDF
router.post('/export/pdf', cuttingListController.exportToPDF);

// Export to Excel
router.post('/export/excel', cuttingListController.exportToExcel);

// ============================================================================
// PROFILE SUGGESTION ROUTES
// ============================================================================

// Get profile variations for a product and size (multiple options)
router.get('/suggestions/variations', cuttingListController.getProfileVariations);

// Get profile suggestions for a product and size
router.get('/suggestions/profiles', cuttingListController.getProfileSuggestions);

// Search for similar products
router.get('/suggestions/products', cuttingListController.searchSimilarProducts);

// Get sizes for a specific product
router.get('/suggestions/sizes', cuttingListController.getSizesForProduct);

// Get profile suggestion database statistics
router.get('/suggestions/stats', cuttingListController.getProfileSuggestionStats);

// ============================================================================
// QUANTITY CALCULATION ROUTES
// ============================================================================

// Calculate quantity based on order quantity and optional size/profile
router.post('/quantity/calculate', cuttingListController.calculateQuantity);

// Get quantity suggestions for a given order quantity
router.post('/quantity/suggestions', cuttingListController.getQuantitySuggestions);

// Validate quantity for a given order quantity
router.post('/quantity/validate', cuttingListController.validateQuantity);

// Get all possible quantities for a given order quantity
router.post('/quantity/possibilities', cuttingListController.getPossibleQuantities);

// ============================================================================
// EXCEL IMPORT ROUTES
// ============================================================================

// Import Excel data to cutting list
router.post('/import/excel', cuttingListController.importExcelData);

// ============================================================================
// SMART SUGGESTION ROUTES
// ============================================================================

// Get smart product suggestions with confidence scoring
router.get('/smart/products', getSmartProductSuggestions);

// Get smart size suggestions (product-aware)
router.get('/smart/sizes', getSmartSizeSuggestions);

// Get smart profile suggestions (context-aware)
router.get('/smart/profiles', getSmartProfileSuggestions);

// Get auto-complete suggestions
router.get('/smart/autocomplete', getAutoCompleteSuggestions);

// Get smart suggestion database statistics
router.get('/smart/stats', getSmartSuggestionStats);

// Reload smart suggestion database
router.post('/smart/reload', reloadSmartSuggestionDatabase);

// ============================================================================
// SMART WORK ORDER CREATION ROUTES
// ============================================================================

// Get smart suggestions for work order creation
router.get('/smart/suggestions', getSmartWorkOrderSuggestions);

// Get smart insights for work order data
router.post('/smart/insights', getSmartWorkOrderInsights);

// Apply smart profile set to work order
router.post('/smart/apply-profile-set', applySmartProfileSet);

// Get work order templates
router.get('/smart/templates', getWorkOrderTemplates);

// Duplicate work order with smart modifications
router.post('/smart/duplicate', duplicateWorkOrder);

// ============================================================================
// ENTERPRISE PROFILE SUGGESTION ROUTES
// ============================================================================

// Get enterprise profile suggestions (context-aware)
router.get('/enterprise/profiles', cuttingListController.getEnterpriseProfileSuggestions);

// Get smart measurement suggestions (context-aware)
router.get('/enterprise/measurements', cuttingListController.getSmartMeasurementSuggestions);

// Get enterprise suggestion statistics
router.get('/enterprise/stats', cuttingListController.getEnterpriseSuggestionStats);

// Refresh enterprise analysis
router.post('/enterprise/refresh', cuttingListController.refreshEnterpriseAnalysis);

// Get available sizes for a product
router.get('/enterprise/product-sizes', cuttingListController.getProductSizes);

// Get complete profile set for product-size combination
router.get('/enterprise/complete-profile-set', cuttingListController.getCompleteProfileSet);

// ============================================================================
// PROFILE API ROUTES (for frontend profile suggestions)
// ============================================================================

// Profile suggestions endpoint - maps to smart profiles
router.get('/profiles/suggestions', (req: Request, res: Response) => {
  // Redirect to smart profiles with query parameter
  req.query['query'] = req.query['q'] as string || '';
  getSmartProfileSuggestions(req, res);
});

// Profile measurements endpoint  
router.get('/profiles/:profileType/measurements', async (req: Request, res: Response): Promise<void> => {
  try {
    const { profileType } = req.params;
    const { limit = 10 } = req.query;
    
    if (!profileType) {
      res.status(400).json({
        success: false,
        error: 'Profile type is required',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Common measurements for different profile types
    const measurementMap: Record<string, string[]> = {
      'L': ['2000', '2500', '3000', '3500', '4000', '4500', '5000', '6000'],
      'U': ['1500', '2000', '2500', '3000', '3500', '4000', '4500', '5000'],
      'KARE': ['1000', '1500', '2000', '2500', '3000', '3500', '4000'],
      'YUVARLAK': ['1000', '1500', '2000', '2500', '3000', '3500', '4000'],
      'KAPALI': ['2000', '2500', '3000', '3500', '4000', '4500', '5000'],
      'AÇIK': ['2000', '2500', '3000', '3500', '4000', '4500', '5000'],
      'DEFAULT': ['2000', '2500', '3000', '3500', '4000', '4500', '5000', '6000']
    };
    
    const profileTypeUpper = profileType.toUpperCase();
    let measurements: string[] = measurementMap['DEFAULT']!;
    
    // Find matching profile type
    for (const [key, values] of Object.entries(measurementMap)) {
      if (profileTypeUpper.includes(key)) {
        measurements = values;
        break;
      }
    }
    
    res.json({
      success: true,
      data: measurements.slice(0, parseInt(limit as string) || 10),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get measurements',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// SMART SUGGESTIONS ROUTES
// ============================================================================

// Get available sizes for a product
router.get('/smart-suggestions/sizes', getAvailableSizes);

// Get profile combinations for a product and size
router.get('/smart-suggestions/combinations', getProfileCombinations);

// ============================================================================
// ERROR HANDLER
// ============================================================================

router.use(cuttingListErrorHandler);

export default router;

/**
 * @fileoverview Material Profile Mapping Routes
 * @module routes/materialProfileMappingRoutes
 * @version 1.0.0
 */

import { Router } from 'express';
import { materialProfileMappingController } from '../controllers/materialProfileMappingController';
import { authenticateToken } from '../middleware/authentication';

const router: Router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route GET /api/material-profile-mappings/suggestions
 * @desc Get profile suggestions for a material number
 * @access Private
 */
router.get('/suggestions', materialProfileMappingController.getSuggestions.bind(materialProfileMappingController));

/**
 * @route GET /api/material-profile-mappings/most-popular
 * @desc Get most popular mapping for a material number
 * @access Private
 */
router.get('/most-popular', materialProfileMappingController.getMostPopularMapping.bind(materialProfileMappingController));

/**
 * @route GET /api/material-profile-mappings/similar
 * @desc Get similar suggestions for a material number
 * @access Private
 */
router.get('/similar', materialProfileMappingController.getSimilarSuggestions.bind(materialProfileMappingController));

/**
 * @route POST /api/material-profile-mappings
 * @desc Save new profile mapping from user input
 * @access Private
 */
router.post('/', materialProfileMappingController.saveMappingFromUserInput.bind(materialProfileMappingController));

export { router as materialProfileMappingRoutes };
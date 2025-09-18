/**
 * WebGPU Routes
 * API endpoints for WebGPU optimization
 */

import { Router, Request, Response } from 'express';
import { WebGPUOptimizationService } from '../services/webgpuOptimizationService';

const router = Router();
const webgpuOptimizationService = new WebGPUOptimizationService();

/**
 * GET /api/webgpu/status
 * Get WebGPU status and support information
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const isAvailable = webgpuOptimizationService.isAvailable();
  const gpuInfo = webgpuOptimizationService.getCurrentGPUInfo();
    
    res.json({
      success: true,
      data: {
        available: isAvailable,
        gpuInfo,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'WEBGPU_STATUS_ERROR',
        message: 'Failed to get WebGPU status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * POST /api/webgpu/initialize
 * Initialize WebGPU
 */
router.post('/initialize', async (_req: Request, res: Response) => {
  try {
    const initialized = await webgpuOptimizationService.initialize();
    
    if (initialized) {
      const gpuInfo = webgpuOptimizationService.getCurrentGPUInfo();
      
      res.json({
        success: true,
        data: {
          initialized: true,
          gpuInfo,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: {
          code: 'WEBGPU_INIT_FAILED',
          message: 'Failed to initialize WebGPU',
          details: 'WebGPU initialization failed'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'WEBGPU_INIT_ERROR',
        message: 'WebGPU initialization error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * POST /api/webgpu/optimize
 * Run WebGPU optimization
 */
router.post('/optimize', async (req: Request, res: Response) => {
  try {
    const { population, fitnessWeights, generations, mutationRate, crossoverRate } = req.body;
    
    // Validate input
    if (!population || !Array.isArray(population) || population.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid population data',
          details: 'Population must be a non-empty array'
        }
      });
    }
    
    if (!fitnessWeights || !Array.isArray(fitnessWeights) || fitnessWeights.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid fitness weights',
          details: 'Fitness weights must be a non-empty array'
        }
      });
    }
    
    const params = {
      population,
      fitnessWeights,
      generations: generations || 100,
      mutationRate: mutationRate || 0.1,
      crossoverRate: crossoverRate || 0.8
    };
    
    const result = await webgpuOptimizationService.optimizeGeneticAlgorithm(params);
    
    if (result.success) {
      return res.json({
        success: true,
        data: {
          result,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEBGPU_OPTIMIZATION_FAILED',
          message: 'WebGPU optimization failed',
          details: result.error || 'Unknown error'
        }
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'WEBGPU_OPTIMIZATION_ERROR',
        message: 'WebGPU optimization error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * GET /api/webgpu/info
 * Get WebGPU device information
 */
router.get('/info', async (_req: Request, res: Response) => {
  try {
    const gpuInfo = webgpuOptimizationService.getCurrentGPUInfo();
    const isAvailable = webgpuOptimizationService.isAvailable();
    
    res.json({
      success: true,
      data: {
        available: isAvailable,
        gpuInfo,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'WEBGPU_INFO_ERROR',
        message: 'Failed to get WebGPU info',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * POST /api/webgpu/cleanup
 * Cleanup WebGPU resources
 */
router.post('/cleanup', async (_req: Request, res: Response) => {
  try {
    await webgpuOptimizationService.cleanup();
    
    res.json({
      success: true,
      data: {
        message: 'WebGPU resources cleaned up',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'WEBGPU_CLEANUP_ERROR',
        message: 'WebGPU cleanup error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

export default router;

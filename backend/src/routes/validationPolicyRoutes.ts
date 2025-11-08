/**
 * LEMNİX Validation Policy Routes
 * Provides endpoints for validation monitoring and quarantine management
 */

import { Router, type Router as ExpressRouter, Request, Response } from 'express';
import { getValidationPolicyService } from '../services/policies/validationPolicyService';
import { logger } from '../services/logger';
import { asyncHandler } from '../middleware/errorHandler';

const router: ExpressRouter = Router();
const validationPolicyService = getValidationPolicyService(logger);

/**
 * POST /api/validation/validate
 * Validate a single record
 */
router.post('/validate', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { data, recordId } = req.body;
  const correlationId = req.headers['x-correlation-id'] as string || 'unknown';

  if (!data) {
    res.status(400).json({
      error: {
        id: correlationId,
        correlationId,
        class: 'CLIENT',
        code: 'VALIDATION_DATA_MISSING',
        message: 'Validation data is required',
        recoverable: false,
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  const report = await validationPolicyService.validateRecord(data, correlationId, recordId);

  res.json({
    success: true,
    data: report,
    timestamp: new Date().toISOString()
  });
}));

/**
 * GET /api/validation/metrics
 * Get validation metrics
 */
router.get('/metrics', asyncHandler(async (req: Request, res: Response) => {
  const metrics = validationPolicyService.getValidationMetrics();

  res.json({
    success: true,
    data: metrics,
    timestamp: new Date().toISOString()
  });
}));

/**
 * GET /api/validation/quarantine
 * Get quarantine records with optional filters
 */
router.get('/quarantine', asyncHandler(async (req: Request, res: Response) => {
  const {
    status,
    reviewedBy,
    startDate,
    endDate,
    limit = '100',
    offset = '0'
  } = req.query;

  const filters: Record<string, unknown> = {};
  if (status) filters.status = status as string;
  if (reviewedBy) filters.reviewedBy = reviewedBy as string;
  if (startDate) filters.startDate = startDate as string;
  if (endDate) filters.endDate = endDate as string;

  const records = validationPolicyService.getQuarantineRecords(filters);

  // Apply pagination
  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);
  const paginatedRecords = records.slice(offsetNum, offsetNum + limitNum);

  res.json({
    success: true,
    data: {
      records: paginatedRecords,
      total: records.length,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < records.length
    },
    timestamp: new Date().toISOString()
  });
}));

/**
 * POST /api/validation/quarantine/:recordId/review
 * Review a quarantine record
 */
router.post('/quarantine/:recordId/review', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { recordId } = req.params;
  const { decision, reviewedBy, notes } = req.body;
  const correlationId = req.headers['x-correlation-id'] as string || 'unknown';

  if (!decision || !reviewedBy) {
    res.status(400).json({
      error: {
        id: correlationId,
        correlationId,
        class: 'CLIENT',
        code: 'REVIEW_DATA_MISSING',
        message: 'Decision and reviewedBy are required',
        recoverable: false,
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  if (!['APPROVE', 'REJECT', 'MODIFY'].includes(decision)) {
    res.status(400).json({
      error: {
        id: correlationId,
        correlationId,
        class: 'CLIENT',
        code: 'INVALID_DECISION',
        message: 'Decision must be APPROVE, REJECT, or MODIFY',
        recoverable: false,
        timestamp: new Date().toISOString()
      }
    });
  }

  const success = validationPolicyService.reviewQuarantineRecord(recordId, decision, reviewedBy, notes);

  if (!success) {
    res.status(404).json({
      error: {
        id: correlationId,
        correlationId,
        class: 'CLIENT',
        code: 'QUARANTINE_RECORD_NOT_FOUND',
        message: 'Quarantine record not found',
        recoverable: false,
        timestamp: new Date().toISOString()
      }
    });
  }

  res.json({
    success: true,
    data: {
      recordId,
      decision,
      reviewedBy,
      notes,
      reviewedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
}));

/**
 * GET /api/validation/daily-report
 * Get daily validation report
 */
router.get('/daily-report', asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.query;
  const targetDate = date as string || new Date().toISOString().split('T')[0];

  const report = validationPolicyService.getDailyValidationReport(targetDate);

  res.json({
    success: true,
    data: report,
    timestamp: new Date().toISOString()
  });
}));

/**
 * GET /api/validation/dashboard/summary
 * Get validation dashboard summary
 */
router.get('/dashboard/summary', asyncHandler(async (req: Request, res: Response) => {
  const metrics = validationPolicyService.getValidationMetrics();
  const quarantineRecords = validationPolicyService.getQuarantineRecords();
  
  const summary = {
    // Overall metrics
    totalRecords: metrics.totalRecords,
    passedRecords: metrics.passedRecords,
    quarantinedRecords: metrics.quarantinedRecords,
    rejectedRecords: metrics.rejectedRecords,
    autoFixedRecords: metrics.autoFixedRecords,
    
    // Compliance metrics
    compliance: {
      rejectionRate: Math.round(metrics.rejectionRate * 10000) / 100, // percentage
      quarantineRate: Math.round(metrics.quarantineRate * 10000) / 100, // percentage
      autoFixRate: Math.round(metrics.autoFixRate * 10000) / 100, // percentage
      dataFreshnessCompliance: Math.round(metrics.dataFreshnessCompliance * 10000) / 100 // percentage
    },
    
    // Performance metrics
    performance: {
      averageProcessingTime: Math.round(metrics.averageProcessingTime),
      averageDataFreshness: Math.round(metrics.averageDataFreshness),
      p95ProcessingTime: Math.round(metrics.p95ProcessingTime),
      p95DataFreshness: Math.round(metrics.p95DataFreshness)
    },
    
    // Violation breakdown
    violations: {
      critical: metrics.criticalViolations,
      high: metrics.highViolations,
      medium: metrics.mediumViolations,
      low: metrics.lowViolations
    },
    
    // Quarantine status
    quarantine: {
      total: quarantineRecords.length,
      pending: quarantineRecords.filter(r => r.status === 'PENDING').length,
      reviewed: quarantineRecords.filter(r => r.status === 'REVIEWED').length,
      resolved: quarantineRecords.filter(r => r.status === 'RESOLVED').length
    },
    
    // Health status
    health: {
      status: metrics.rejectionRate < 0.05 && metrics.dataFreshnessCompliance > 0.95 ? 'HEALTHY' : 
              metrics.rejectionRate < 0.1 && metrics.dataFreshnessCompliance > 0.90 ? 'WARNING' : 'CRITICAL',
      issues: [] as string[]
    }
  };

  // Build health issues array (immutable pattern)
  const healthIssues: string[] = [];
  if (metrics.rejectionRate >= 0.05) {
    healthIssues.push(`High rejection rate: ${summary.compliance.rejectionRate}%`);
  }
  if (metrics.dataFreshnessCompliance < 0.95) {
    healthIssues.push(`Low data freshness compliance: ${summary.compliance.dataFreshnessCompliance}%`);
  }
  if (metrics.averageProcessingTime > 5000) {
    healthIssues.push(`Slow processing time: ${summary.performance.averageProcessingTime}ms`);
  }
  summary.health.issues = healthIssues;

  res.json({
    success: true,
    data: summary,
    timestamp: new Date().toISOString()
  });
}));

/**
 * GET /api/validation/dashboard/violations
 * Get violation breakdown by category and severity
 */
router.get('/dashboard/violations', asyncHandler(async (req: Request, res: Response) => {
  const metrics = validationPolicyService.getValidationMetrics();
  const quarantineRecords = validationPolicyService.getQuarantineRecords();

  // Analyze violations by category
  const violationsByCategory = {
    dataQuality: 0,
    businessLogic: 0,
    unitConsistency: 0,
    mathematical: 0,
    format: 0
  };

  // Analyze violations by severity
  const violationsBySeverity = {
    critical: metrics.criticalViolations,
    high: metrics.highViolations,
    medium: metrics.mediumViolations,
    low: metrics.lowViolations
  };

  // Analyze top violation types
  const violationTypes = new Map<string, number>();
  quarantineRecords.forEach(record => {
    record.validationResults.forEach(result => {
      if (!result.passed) {
        const current = violationTypes.get(result.ruleName) || 0;
        violationTypes.set(result.ruleName, current + 1);
      }
    });
  });

  const topViolations = Array.from(violationTypes.entries())
    .map(([rule, count]) => ({ rule, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Analyze violation trends (last 24 hours)
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  const recentRecords = quarantineRecords.filter(r => 
    new Date(r.quarantinedAt).getTime() > oneDayAgo
  );

  const recentViolations = {
    total: recentRecords.length,
    bySeverity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }
  };

  recentRecords.forEach(record => {
    record.validationResults.forEach(result => {
      if (!result.passed) {
        switch (result.severity) {
          case 'CRITICAL': recentViolations.bySeverity.critical++; break;
          case 'HIGH': recentViolations.bySeverity.high++; break;
          case 'MEDIUM': recentViolations.bySeverity.medium++; break;
          case 'LOW': recentViolations.bySeverity.low++; break;
        }
      }
    });
  });

  res.json({
    success: true,
    data: {
      violationsByCategory,
      violationsBySeverity,
      topViolations,
      recentViolations,
      totalViolations: metrics.criticalViolations + metrics.highViolations + 
                      metrics.mediumViolations + metrics.lowViolations
    },
    timestamp: new Date().toISOString()
  });
}));

/**
 * GET /api/validation/dashboard/compliance
 * Get compliance metrics and thresholds
 */
router.get('/dashboard/compliance', asyncHandler(async (req: Request, res: Response) => {
  const metrics = validationPolicyService.getValidationMetrics();

  const compliance = {
    // Thresholds
    thresholds: {
      maxRejectionRate: 0.05, // 5%
      minDataFreshnessCompliance: 0.95, // 95%
      maxProcessingTime: 5000, // 5 seconds
      maxQuarantineRate: 0.10 // 10%
    },
    
    // Current metrics
    current: {
      rejectionRate: metrics.rejectionRate,
      dataFreshnessCompliance: metrics.dataFreshnessCompliance,
      averageProcessingTime: metrics.averageProcessingTime,
      quarantineRate: metrics.quarantineRate
    },
    
    // Compliance status
    status: {
      rejectionRate: metrics.rejectionRate <= 0.05 ? 'COMPLIANT' : 'NON_COMPLIANT',
      dataFreshness: metrics.dataFreshnessCompliance >= 0.95 ? 'COMPLIANT' : 'NON_COMPLIANT',
      processingTime: metrics.averageProcessingTime <= 5000 ? 'COMPLIANT' : 'NON_COMPLIANT',
      quarantineRate: metrics.quarantineRate <= 0.10 ? 'COMPLIANT' : 'NON_COMPLIANT'
    },
    
    // Overall compliance
    overallCompliance: {
      score: 0,
      status: 'UNKNOWN'
    }
  };

  // Calculate overall compliance score
  let compliantCount = 0;
  let totalCount = 0;

  Object.values(compliance.status).forEach(status => {
    totalCount++;
    if (status === 'COMPLIANT') {
      compliantCount++;
    }
  });

  compliance.overallCompliance.score = totalCount > 0 ? (compliantCount / totalCount) * 100 : 0;
  compliance.overallCompliance.status = compliance.overallCompliance.score >= 75 ? 'COMPLIANT' : 'NON_COMPLIANT';

  res.json({
    success: true,
    data: compliance,
    timestamp: new Date().toISOString()
  });
}));

export default router;

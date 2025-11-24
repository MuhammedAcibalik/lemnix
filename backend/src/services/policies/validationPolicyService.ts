/**
 * Data Validation Policy Service
 * Comprehensive validation engine with quarantine management
 * Validates data records and manages quarantine for invalid data
 */

import {
  ValidationRule,
  ValidationResult,
  ValidationReport,
  QuarantineRecord,
  ValidationMetrics,
  ValidationSeverity,
  ValidationAction,
  ValidationCategory,
  EDGE_CASE_RULES,
  VALIDATION_THRESHOLDS,
  determineValidationAction,
  calculateDataFreshness,
  isDataFresh,
} from "../../types/validationPolicyTypes";
import { ILogger } from "../logger";
import { v4 as uuidv4 } from "uuid";

export class DataValidationPolicyService {
  private logger: ILogger;
  private validationRules: Map<string, ValidationRule> = new Map();
  private quarantineRecords: Map<string, QuarantineRecord> = new Map();
  private validationMetrics: ValidationMetrics = this.initializeMetrics();
  private readonly maxQuarantineRecords = 10000;

  constructor(logger: ILogger) {
    this.logger = logger;
    this.initializeValidationRules();
    this.startCleanupTimer();
  }

  /**
   * Validate a single record
   */
  public async validateRecord(
    data: Record<string, unknown>,
    correlationId: string,
    recordId?: string,
  ): Promise<ValidationReport> {
    const startTime = Date.now();
    const recordIdFinal = recordId || uuidv4();

    try {
      // Calculate data freshness
      const dataFreshness = data.timestamp
        ? calculateDataFreshness(data.timestamp as string)
        : 0;

      // Run all validation rules
      const results: ValidationResult[] = [];
      let overallStatus: ValidationReport["overallStatus"] = "PASSED";

      for (const rule of this.validationRules.values()) {
        try {
          const passed = !rule.condition(data);
          const confidence = this.calculateConfidence(rule, data);
          const action = determineValidationAction(rule.severity, confidence);

          const result: ValidationResult = {
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            action,
            passed,
            message: passed
              ? "Validation passed"
              : `Validation failed: ${rule.description}`,
            originalValue: this.extractValue(data, rule),
            confidence,
          };

          // Apply auto-fix if applicable
          if (!passed && action === ValidationAction.AUTO_FIX && rule.fixer) {
            try {
              result.fixedValue = rule.fixer(data);
              result.message += " (Auto-fixed)";
            } catch (error) {
              this.logger.warn("Auto-fix failed", {
                ruleId: rule.id,
                error: (error as Error).message,
                correlationId,
              });
              result.action = ValidationAction.QUARANTINE;
            }
          }

          results.push(result);

          // Update overall status based on severity and action
          if (!passed) {
            if (rule.severity === ValidationSeverity.CRITICAL) {
              overallStatus = "REJECTED";
            } else if (
              rule.severity === ValidationSeverity.HIGH &&
              overallStatus !== "REJECTED"
            ) {
              overallStatus = "QUARANTINED";
            } else if (
              action === ValidationAction.AUTO_FIX &&
              overallStatus === "PASSED"
            ) {
              overallStatus = "AUTO_FIXED";
            }
          }
        } catch (error) {
          this.logger.error("Validation rule execution failed", {
            ruleId: rule.id,
            error: (error as Error).message,
            correlationId,
          });
        }
      }

      // Create validation report
      const report: ValidationReport = {
        recordId: recordIdFinal,
        correlationId,
        timestamp: new Date().toISOString(),
        overallStatus,
        results,
        processingTime: Date.now() - startTime,
        dataFreshness,
      };

      // Handle based on overall status
      await this.handleValidationResult(report, data);

      // Update metrics
      this.updateMetrics(report);

      return report;
    } catch (error) {
      this.logger.error("Validation failed", {
        error: (error as Error).message,
        correlationId,
        recordId: recordIdFinal,
      });

      // Return failed validation report
      return {
        recordId: recordIdFinal,
        correlationId,
        timestamp: new Date().toISOString(),
        overallStatus: "REJECTED",
        results: [
          {
            ruleId: "SYSTEM_ERROR",
            ruleName: "System Error",
            severity: ValidationSeverity.CRITICAL,
            action: ValidationAction.REJECT,
            passed: false,
            message: `System error during validation: ${(error as Error).message}`,
            confidence: 0,
          },
        ],
        processingTime: Date.now() - startTime,
        dataFreshness: 0,
      };
    }
  }

  /**
   * Handle validation result based on status
   */
  private async handleValidationResult(
    report: ValidationReport,
    originalData: Record<string, unknown>,
  ): Promise<void> {
    switch (report.overallStatus) {
      case "REJECTED":
        await this.handleRejectedRecord(report, originalData);
        break;
      case "QUARANTINED":
        await this.handleQuarantinedRecord(report, originalData);
        break;
      case "AUTO_FIXED":
        await this.handleAutoFixedRecord(report, originalData);
        break;
      case "PASSED":
        await this.handlePassedRecord(report, originalData);
        break;
    }
  }

  /**
   * Handle rejected record
   */
  private async handleRejectedRecord(
    report: ValidationReport,
    originalData: Record<string, unknown>,
  ): Promise<void> {
    this.logger.warn("Record rejected", {
      recordId: report.recordId,
      correlationId: report.correlationId,
      violations: report.results
        .filter((r) => !r.passed)
        .map((r) => ({
          rule: r.ruleName,
          severity: r.severity,
          message: r.message,
        })),
    });
  }

  /**
   * Handle quarantined record
   */
  private async handleQuarantinedRecord(
    report: ValidationReport,
    originalData: Record<string, unknown>,
  ): Promise<void> {
    const quarantineRecord: QuarantineRecord = {
      id: report.recordId,
      correlationId: report.correlationId,
      originalData,
      validationResults: report.results.filter((r) => !r.passed),
      quarantineReason: this.generateQuarantineReason(report.results),
      quarantinedAt: new Date().toISOString(),
      status: "PENDING",
    };

    this.quarantineRecords.set(report.recordId, quarantineRecord);

    this.logger.info("Record quarantined", {
      recordId: report.recordId,
      correlationId: report.correlationId,
      reason: quarantineRecord.quarantineReason,
      violations: report.results.filter((r) => !r.passed).length,
    });
  }

  /**
   * Handle auto-fixed record
   */
  private async handleAutoFixedRecord(
    report: ValidationReport,
    originalData: Record<string, unknown>,
  ): Promise<void> {
    this.logger.info("Record auto-fixed", {
      recordId: report.recordId,
      correlationId: report.correlationId,
      fixes: report.results
        .filter((r) => r.fixedValue !== undefined)
        .map((r) => ({
          rule: r.ruleName,
          original: r.originalValue,
          fixed: r.fixedValue,
        })),
    });
  }

  /**
   * Handle passed record
   */
  private async handlePassedRecord(
    report: ValidationReport,
    originalData: Record<string, unknown>,
  ): Promise<void> {
    this.logger.debug("Record passed validation", {
      recordId: report.recordId,
      correlationId: report.correlationId,
      processingTime: report.processingTime,
      dataFreshness: report.dataFreshness,
    });
  }

  /**
   * Get quarantine records
   */
  public getQuarantineRecords(filters?: {
    status?: QuarantineRecord["status"];
    reviewedBy?: string;
    startDate?: string;
    endDate?: string;
  }): QuarantineRecord[] {
    let records = Array.from(this.quarantineRecords.values());

    if (filters) {
      if (filters.status) {
        records = records.filter((r) => r.status === filters.status);
      }
      if (filters.reviewedBy) {
        records = records.filter((r) => r.reviewedBy === filters.reviewedBy);
      }
      if (filters.startDate) {
        records = records.filter((r) => r.quarantinedAt >= filters.startDate!);
      }
      if (filters.endDate) {
        records = records.filter((r) => r.quarantinedAt <= filters.endDate!);
      }
    }

    return records.sort(
      (a, b) =>
        new Date(b.quarantinedAt).getTime() -
        new Date(a.quarantinedAt).getTime(),
    );
  }

  /**
   * Review quarantine record
   */
  public reviewQuarantineRecord(
    recordId: string,
    decision: QuarantineRecord["reviewDecision"],
    reviewedBy: string,
    notes?: string,
  ): boolean {
    const record = this.quarantineRecords.get(recordId);
    if (!record) {
      this.logger.warn("Quarantine record not found", { recordId });
      return false;
    }

    record.reviewedBy = reviewedBy;
    record.reviewedAt = new Date().toISOString();
    record.reviewDecision = decision;
    record.reviewNotes = notes;
    record.status = "REVIEWED";

    this.logger.info("Quarantine record reviewed", {
      recordId,
      decision,
      reviewedBy,
      notes,
    });

    return true;
  }

  /**
   * Get validation metrics
   */
  public getValidationMetrics(): ValidationMetrics {
    return { ...this.validationMetrics };
  }

  /**
   * Get daily validation report
   */
  public getDailyValidationReport(date?: string): {
    date: string;
    metrics: ValidationMetrics;
    topViolations: Array<{
      rule: string;
      count: number;
      severity: ValidationSeverity;
    }>;
    quarantineSummary: {
      total: number;
      pending: number;
      reviewed: number;
      resolved: number;
    };
    dataFreshnessCompliance: number;
  } {
    const targetDate = date || new Date().toISOString().split("T")[0];

    // Filter records by date
    const dailyRecords = Array.from(this.quarantineRecords.values()).filter(
      (r) => r.quarantinedAt.startsWith(targetDate),
    );

    // Calculate top violations
    const violationCounts = new Map<
      string,
      { count: number; severity: ValidationSeverity }
    >();
    dailyRecords.forEach((record) => {
      record.validationResults.forEach((result) => {
        if (!result.passed) {
          const current = violationCounts.get(result.ruleName) || {
            count: 0,
            severity: result.severity,
          };
          current.count++;
          violationCounts.set(result.ruleName, current);
        }
      });
    });

    const topViolations = Array.from(violationCounts.entries())
      .map(([rule, data]) => ({ rule, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Quarantine summary
    const quarantineSummary = {
      total: dailyRecords.length,
      pending: dailyRecords.filter((r) => r.status === "PENDING").length,
      reviewed: dailyRecords.filter((r) => r.status === "REVIEWED").length,
      resolved: dailyRecords.filter((r) => r.status === "RESOLVED").length,
    };

    // Data freshness compliance
    const dataFreshnessCompliance =
      this.validationMetrics.dataFreshnessCompliance;

    return {
      date: targetDate,
      metrics: this.getValidationMetrics(),
      topViolations,
      quarantineSummary,
      dataFreshnessCompliance,
    };
  }

  /**
   * Initialize validation rules from edge cases
   */
  private initializeValidationRules(): void {
    EDGE_CASE_RULES.forEach((edgeCase, index) => {
      const rule: ValidationRule = {
        id: `rule-${index + 1}`,
        name: edgeCase.name,
        description: edgeCase.description,
        severity: edgeCase.severity,
        action: ValidationAction.AUTO_FIX, // Will be determined dynamically
        condition: edgeCase.condition,
        fixer: edgeCase.fix,
        category: this.categorizeRule(edgeCase.name),
      };

      this.validationRules.set(rule.id, rule);
    });

    this.logger.info("Validation rules initialized", {
      totalRules: this.validationRules.size,
      categories: Array.from(
        new Set(
          Array.from(this.validationRules.values()).map((r) => r.category),
        ),
      ),
    });
  }

  /**
   * Categorize validation rule
   */
  private categorizeRule(ruleName: string): ValidationCategory {
    if (ruleName.includes("Waste") || ruleName.includes("Dimension")) {
      return ValidationCategory.MATHEMATICAL;
    }
    if (ruleName.includes("Unit")) {
      return ValidationCategory.UNIT_CONSISTENCY;
    }
    if (ruleName.includes("Required") || ruleName.includes("Freshness")) {
      return ValidationCategory.DATA_QUALITY;
    }
    if (ruleName.includes("Kerf")) {
      return ValidationCategory.BUSINESS_LOGIC;
    }
    return ValidationCategory.DATA_QUALITY;
  }

  /**
   * Calculate confidence score for validation rule
   */
  private calculateConfidence(
    rule: ValidationRule,
    data: Record<string, unknown>,
  ): number {
    // Base confidence on rule type and data quality
    let confidence = 0.8; // Base confidence

    // Adjust based on rule category
    switch (rule.category) {
      case ValidationCategory.MATHEMATICAL:
        confidence = 0.95; // High confidence for mathematical rules
        break;
      case ValidationCategory.UNIT_CONSISTENCY:
        confidence = 0.85; // High confidence for unit rules
        break;
      case ValidationCategory.BUSINESS_LOGIC:
        confidence = 0.75; // Medium confidence for business rules
        break;
      case ValidationCategory.DATA_QUALITY:
        confidence = 0.7; // Lower confidence for data quality rules
        break;
    }

    // Adjust based on data completeness
    const requiredFields = ["profileType", "stockLength", "quantity"];
    const completeness =
      requiredFields.filter(
        (field) => data[field] !== undefined && data[field] !== null,
      ).length / requiredFields.length;
    confidence *= completeness;

    return Math.min(1.0, Math.max(0.0, confidence));
  }

  /**
   * Extract value from data for validation rule
   */
  private extractValue(
    data: Record<string, unknown>,
    rule: ValidationRule,
  ): unknown {
    // Extract relevant value based on rule name
    if (rule.name.includes("Waste")) return data.wastePercentage;
    if (rule.name.includes("Kerf")) return data.kerf;
    if (rule.name.includes("Quantity")) return data.quantity;
    if (rule.name.includes("Dimension"))
      return { length: data.length, width: data.width, height: data.height };
    if (rule.name.includes("Unit"))
      return { length: data.length, unit: data.unit };
    if (rule.name.includes("Required"))
      return {
        profileType: data.profileType,
        stockLength: data.stockLength,
        quantity: data.quantity,
      };
    if (rule.name.includes("Freshness")) return data.timestamp;

    return data;
  }

  /**
   * Generate quarantine reason
   */
  private generateQuarantineReason(results: ValidationResult[]): string {
    const failedResults = results.filter((r) => !r.passed);
    if (failedResults.length === 0) return "No violations found";

    const critical = failedResults.filter(
      (r) => r.severity === ValidationSeverity.CRITICAL,
    );
    const high = failedResults.filter(
      (r) => r.severity === ValidationSeverity.HIGH,
    );

    if (critical.length > 0) {
      return `Critical violations: ${critical.map((r) => r.ruleName).join(", ")}`;
    }
    if (high.length > 0) {
      return `High severity violations: ${high.map((r) => r.ruleName).join(", ")}`;
    }

    return `Multiple violations: ${failedResults.map((r) => r.ruleName).join(", ")}`;
  }

  /**
   * Update validation metrics
   */
  private updateMetrics(report: ValidationReport): void {
    this.validationMetrics.totalRecords++;

    switch (report.overallStatus) {
      case "PASSED":
        this.validationMetrics.passedRecords++;
        break;
      case "QUARANTINED":
        this.validationMetrics.quarantinedRecords++;
        break;
      case "REJECTED":
        this.validationMetrics.rejectedRecords++;
        break;
      case "AUTO_FIXED":
        this.validationMetrics.autoFixedRecords++;
        break;
    }

    // Update violation counts by severity
    report.results
      .filter((r) => !r.passed)
      .forEach((result) => {
        switch (result.severity) {
          case ValidationSeverity.CRITICAL:
            this.validationMetrics.criticalViolations++;
            break;
          case ValidationSeverity.HIGH:
            this.validationMetrics.highViolations++;
            break;
          case ValidationSeverity.MEDIUM:
            this.validationMetrics.mediumViolations++;
            break;
          case ValidationSeverity.LOW:
            this.validationMetrics.lowViolations++;
            break;
        }
      });

    // Update processing time metrics
    const totalProcessingTime =
      this.validationMetrics.averageProcessingTime *
        (this.validationMetrics.totalRecords - 1) +
      report.processingTime;
    this.validationMetrics.averageProcessingTime =
      totalProcessingTime / this.validationMetrics.totalRecords;

    // Update data freshness metrics
    const totalDataFreshness =
      this.validationMetrics.averageDataFreshness *
        (this.validationMetrics.totalRecords - 1) +
      report.dataFreshness;
    this.validationMetrics.averageDataFreshness =
      totalDataFreshness / this.validationMetrics.totalRecords;

    // Update compliance metrics
    this.validationMetrics.rejectionRate =
      this.validationMetrics.rejectedRecords /
      this.validationMetrics.totalRecords;
    this.validationMetrics.quarantineRate =
      this.validationMetrics.quarantinedRecords /
      this.validationMetrics.totalRecords;
    this.validationMetrics.autoFixRate =
      this.validationMetrics.autoFixedRecords /
      this.validationMetrics.totalRecords;
    this.validationMetrics.dataFreshnessCompliance =
      report.dataFreshness <= VALIDATION_THRESHOLDS.DATA_FRESHNESS_SECONDS
        ? 1
        : 0;
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): ValidationMetrics {
    return {
      totalRecords: 0,
      passedRecords: 0,
      quarantinedRecords: 0,
      rejectedRecords: 0,
      autoFixedRecords: 0,
      criticalViolations: 0,
      highViolations: 0,
      mediumViolations: 0,
      lowViolations: 0,
      dataQualityIssues: 0,
      businessLogicIssues: 0,
      unitConsistencyIssues: 0,
      mathematicalIssues: 0,
      formatIssues: 0,
      averageProcessingTime: 0,
      p95ProcessingTime: 0,
      averageDataFreshness: 0,
      p95DataFreshness: 0,
      rejectionRate: 0,
      quarantineRate: 0,
      autoFixRate: 0,
      dataFreshnessCompliance: 0,
    };
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupOldQuarantineRecords();
    }, 3600000); // Cleanup every hour
  }

  /**
   * Cleanup old quarantine records
   */
  private cleanupOldQuarantineRecords(): void {
    const cutoffTime =
      Date.now() -
      VALIDATION_THRESHOLDS.QUARANTINE_RETENTION_HOURS * 60 * 60 * 1000;

    let cleanedCount = 0;
    for (const [id, record] of this.quarantineRecords.entries()) {
      if (new Date(record.quarantinedAt).getTime() < cutoffTime) {
        this.quarantineRecords.delete(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.info("Cleaned up old quarantine records", {
        count: cleanedCount,
      });
    }

    // Limit quarantine records
    if (this.quarantineRecords.size > this.maxQuarantineRecords) {
      const records = Array.from(this.quarantineRecords.entries())
        .sort(
          ([, a], [, b]) =>
            new Date(b.quarantinedAt).getTime() -
            new Date(a.quarantinedAt).getTime(),
        )
        .slice(0, this.maxQuarantineRecords);

      this.quarantineRecords.clear();
      records.forEach(([id, record]) => this.quarantineRecords.set(id, record));

      this.logger.info("Limited quarantine records", {
        maxRecords: this.maxQuarantineRecords,
      });
    }
  }
}

// Singleton instance
let dataValidationPolicyService: DataValidationPolicyService | null = null;

export function getDataValidationPolicyService(
  logger: ILogger,
): DataValidationPolicyService {
  if (!dataValidationPolicyService) {
    dataValidationPolicyService = new DataValidationPolicyService(logger);
  }
  return dataValidationPolicyService;
}

// Legacy export for backward compatibility
export const ValidationPolicyService = DataValidationPolicyService;
export const getValidationPolicyService = getDataValidationPolicyService;

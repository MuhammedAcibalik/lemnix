/**
 * @fileoverview Compliance Check Script
 * @module ComplianceCheck
 * @version 1.0.0
 * 
 * Automated compliance checking for database security and compliance requirements.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/services/logger';

/**
 * Compliance check result
 */
interface ComplianceCheckResult {
  check: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: string;
}

/**
 * Compliance Checker
 */
class ComplianceChecker {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Run all compliance checks
   */
  async runAllChecks(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];

    // SSL Configuration
    results.push(await this.checkSSLConfiguration());

    // Audit Logging
    results.push(await this.checkAuditLogging());

    // Connection Security
    results.push(await this.checkConnectionSecurity());

    // Data Retention
    results.push(await this.checkDataRetention());

    // Access Control
    results.push(await this.checkAccessControl());

    // Password Policy
    results.push(await this.checkPasswordPolicy());

    // Backup Status
    results.push(await this.checkBackupStatus());

    return results;
  }

  /**
   * Check SSL configuration
   */
  private async checkSSLConfiguration(): Promise<ComplianceCheckResult> {
    try {
      const result = await this.prisma.$queryRaw<Array<{ name: string; setting: string }>>`
        SELECT name, setting
        FROM pg_settings
        WHERE name = 'ssl'
      `;

      const sslEnabled = result[0]?.setting === 'on';

      return {
        check: 'SSL Configuration',
        status: sslEnabled ? 'PASS' : 'FAIL',
        message: sslEnabled
          ? 'SSL is enabled'
          : 'SSL is not enabled - security risk',
        details: `SSL setting: ${result[0]?.setting || 'unknown'}`,
      };
    } catch (error) {
      return {
        check: 'SSL Configuration',
        status: 'WARNING',
        message: 'Could not check SSL configuration',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check audit logging
   */
  private async checkAuditLogging(): Promise<ComplianceCheckResult> {
    try {
      const result = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count
        FROM audit_logs
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      `;

      const recentLogs = Number(result[0]?.count || 0);
      const hasRecentLogs = recentLogs > 0;

      return {
        check: 'Audit Logging',
        status: hasRecentLogs ? 'PASS' : 'WARNING',
        message: hasRecentLogs
          ? `Audit logging is active (${recentLogs} entries in last 24h)`
          : 'No audit log entries in last 24 hours',
        details: `Recent entries: ${recentLogs}`,
      };
    } catch (error) {
      return {
        check: 'Audit Logging',
        status: 'WARNING',
        message: 'Could not check audit logging',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check connection security
   */
  private async checkConnectionSecurity(): Promise<ComplianceCheckResult> {
    try {
      const result = await this.prisma.$queryRaw<Array<{
        total: bigint;
        ssl: bigint;
      }>>`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE ssl = true) as ssl
        FROM pg_stat_ssl
        JOIN pg_stat_activity ON pg_stat_ssl.pid = pg_stat_activity.pid
        WHERE pg_stat_activity.datname = 'lemnix_db'
      `;

      const total = Number(result[0]?.total || 0);
      const ssl = Number(result[0]?.ssl || 0);
      const sslRatio = total > 0 ? ssl / total : 0;

      return {
        check: 'Connection Security',
        status: sslRatio === 1 ? 'PASS' : sslRatio > 0.9 ? 'WARNING' : 'FAIL',
        message:
          sslRatio === 1
            ? 'All connections use SSL'
            : `${Math.round(sslRatio * 100)}% of connections use SSL`,
        details: `SSL connections: ${ssl}/${total}`,
      };
    } catch (error) {
      return {
        check: 'Connection Security',
        status: 'WARNING',
        message: 'Could not check connection security',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check data retention
   */
  private async checkDataRetention(): Promise<ComplianceCheckResult> {
    try {
      // Check if old partitions exist (should be cleaned up)
      const result = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename LIKE '%_p%'
          AND tablename ~ '_p[0-9]{6}'
      `;

      const oldPartitions = Number(result[0]?.count || 0);

      return {
        check: 'Data Retention',
        status: oldPartitions < 20 ? 'PASS' : 'WARNING',
        message:
          oldPartitions < 20
            ? 'Partition count is reasonable'
            : `High number of partitions (${oldPartitions}) - review retention policy`,
        details: `Partition count: ${oldPartitions}`,
      };
    } catch (error) {
      return {
        check: 'Data Retention',
        status: 'WARNING',
        message: 'Could not check data retention',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check access control
   */
  private async checkAccessControl(): Promise<ComplianceCheckResult> {
    try {
      const result = await this.prisma.$queryRaw<Array<{
        role_name: string;
        is_superuser: boolean;
      }>>`
        SELECT
          rolname as role_name,
          rolsuper as is_superuser
        FROM pg_roles
        WHERE rolcanlogin = true
          AND rolname NOT LIKE 'pg_%'
      `;

      const superusers = result.filter((r) => r.is_superuser);
      const hasSuperusers = superusers.length > 0;

      return {
        check: 'Access Control',
        status: !hasSuperusers ? 'PASS' : 'WARNING',
        message: !hasSuperusers
          ? 'No superuser roles found'
          : `Superuser roles found: ${superusers.map((r) => r.role_name).join(', ')}`,
        details: `Total login roles: ${result.length}`,
      };
    } catch (error) {
      return {
        check: 'Access Control',
        status: 'WARNING',
        message: 'Could not check access control',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check password policy
   */
  private async checkPasswordPolicy(): Promise<ComplianceCheckResult> {
    // Note: PostgreSQL doesn't enforce password policies directly
    // This check verifies that password encryption is set correctly
    try {
      const result = await this.prisma.$queryRaw<Array<{ setting: string }>>`
        SELECT setting
        FROM pg_settings
        WHERE name = 'password_encryption'
      `;

      const encryption = result[0]?.setting || 'unknown';
      const isSecure = encryption === 'scram-sha-256';

      return {
        check: 'Password Policy',
        status: isSecure ? 'PASS' : 'WARNING',
        message: isSecure
          ? 'Password encryption uses SCRAM-SHA-256'
          : `Password encryption: ${encryption} (should be scram-sha-256)`,
        details: `Encryption method: ${encryption}`,
      };
    } catch (error) {
      return {
        check: 'Password Policy',
        status: 'WARNING',
        message: 'Could not check password policy',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check backup status
   */
  private async checkBackupStatus(): Promise<ComplianceCheckResult> {
    // This is a placeholder - actual backup status would be checked
    // via backup system or file system
    return {
      check: 'Backup Status',
      status: 'WARNING',
      message: 'Backup status check not implemented - verify manually',
      details: 'Check backup logs and S3 upload status',
    };
  }

  /**
   * Generate compliance report
   */
  async generateReport(): Promise<string> {
    const checks = await this.runAllChecks();

    const passed = checks.filter((c) => c.status === 'PASS').length;
    const failed = checks.filter((c) => c.status === 'FAIL').length;
    const warnings = checks.filter((c) => c.status === 'WARNING').length;

    let report = '\n=== Compliance Check Report ===\n\n';
    report += `Total Checks: ${checks.length}\n`;
    report += `Passed: ${passed}\n`;
    report += `Failed: ${failed}\n`;
    report += `Warnings: ${warnings}\n\n`;

    report += '=== Check Results ===\n\n';
    for (const check of checks) {
      const statusIcon =
        check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '❌' : '⚠️';
      report += `${statusIcon} ${check.check}: ${check.message}\n`;
      if (check.details) {
        report += `   Details: ${check.details}\n`;
      }
      report += '\n';
    }

    return report;
  }
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const prisma = new PrismaClient();
  const checker = new ComplianceChecker(prisma);

  checker
    .generateReport()
    .then((report) => {
      console.log(report);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Compliance check error:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export default ComplianceChecker;


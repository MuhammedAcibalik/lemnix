/**
 * Partition Maintenance Script
 * 
 * Automatically creates future partitions and optionally drops old ones
 * Should be run via cron job (monthly for monthly tables, weekly for weekly tables)
 * 
 * Usage:
 *   npm run db:partitions:create-future
 *   npm run db:partitions:cleanup-old
 *   npm run db:partitions:stats
 */

import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

interface PartitionStats {
  tableName: string;
  size: string;
  rowCount: number;
}

/**
 * Create future partitions for all partitioned tables
 */
export async function createFuturePartitions(): Promise<void> {
  try {
    console.log('🔄 Creating future partitions...');
    
    await prisma.$executeRaw`SELECT create_future_partitions()`;
    
    console.log('✅ Future partitions created successfully');
  } catch (error) {
    console.error('❌ Error creating partitions:', error);
    throw error;
  }
}

/**
 * Get partition statistics
 */
export async function getPartitionStats(): Promise<PartitionStats[]> {
  try {
    const result = await prisma.$queryRaw<Array<{
      tablename: string;
      total_size: string;
      table_size: string;
      row_count: bigint;
    }>>`
      SELECT 
        tablename,
        pg_size_pretty(pg_total_relation_size('public.' || tablename)) as total_size,
        pg_size_pretty(pg_relation_size('public.' || tablename)) as table_size,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      WHERE tablename LIKE 'user_activities_%' 
         OR tablename LIKE 'system_metrics_%'
         OR tablename LIKE 'audit_logs_%'
         OR tablename LIKE 'optimization_statistics_%'
         OR tablename LIKE 'suggestion_metrics_%'
      ORDER BY tablename
    `;
    
    return result.map(row => ({
      tableName: row.tablename,
      size: row.total_size as string,
      rowCount: Number(row.row_count),
    }));
  } catch (error) {
    console.error('❌ Error getting partition stats:', error);
    throw error;
  }
}

/**
 * Drop old partitions (older than retention period)
 * WARNING: This permanently deletes data!
 */
export async function cleanupOldPartitions(
  retentionMonths: number = 12,
  retentionWeeks: number = 8
): Promise<void> {
  try {
    console.log(`🗑️  Cleaning up partitions older than ${retentionMonths} months / ${retentionWeeks} weeks...`);
    
    // Use SQL script for cleanup
    const { stdout, stderr } = await execAsync(
      `psql -U lemnix_user -d lemnix_db -f scripts/manage-partitions.sql`
    );
    
    if (stderr && !stderr.includes('NOTICE')) {
      console.error('⚠️  Warnings:', stderr);
    }
    
    console.log('✅ Old partitions cleaned up successfully');
  } catch (error) {
    console.error('❌ Error cleaning up partitions:', error);
    throw error;
  }
}

/**
 * List all partitions
 */
export async function listPartitions(): Promise<void> {
  try {
    const stats = await getPartitionStats();
    
    console.log('\n📊 Partition Statistics:\n');
    console.log('Table Name'.padEnd(40), 'Size'.padEnd(15), 'Row Count');
    console.log('-'.repeat(70));
    
    for (const stat of stats) {
      console.log(
        stat.tableName.padEnd(40),
        stat.size.padEnd(15),
        stat.rowCount.toLocaleString()
      );
    }
    
    console.log('\n');
  } catch (error) {
    console.error('❌ Error listing partitions:', error);
    throw error;
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'create-future':
        await createFuturePartitions();
        break;
        
      case 'cleanup-old':
        const retentionMonths = parseInt(process.argv[3] || '12', 10);
        const retentionWeeks = parseInt(process.argv[4] || '8', 10);
        await cleanupOldPartitions(retentionMonths, retentionWeeks);
        break;
        
      case 'stats':
        await listPartitions();
        break;
        
      default:
        console.log(`
Usage: ts-node partition-maintenance.ts <command> [options]

Commands:
  create-future          Create partitions for next month/week
  cleanup-old [months] [weeks]  Drop partitions older than retention period (default: 12 months, 8 weeks)
  stats                  List all partitions with statistics

Examples:
  npm run db:partitions:create-future
  npm run db:partitions:cleanup-old 12 8
  npm run db:partitions:stats
        `);
        process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}


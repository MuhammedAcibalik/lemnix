/**
 * Data Migration Script: SQLite → PostgreSQL
 * 
 * This script migrates existing data from SQLite to PostgreSQL.
 * Run after PostgreSQL setup and Prisma migration.
 * 
 * Usage:
 *   npm run migrate:sqlite-to-postgres
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../src/services/logger';

// SQLite connection
const sqlite = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

// PostgreSQL connection
const postgres = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    },
  },
});

interface MigrationStats {
  model: string;
  count: number;
  duration: number;
}

async function migrateModel<T extends Record<string, unknown>>(
  modelName: string,
  fetchFn: () => Promise<T[]>,
  insertFn: (data: T[]) => Promise<unknown>
): Promise<MigrationStats> {
  const startTime = Date.now();
  
  try {
    console.log(`\n📦 Migrating ${modelName}...`);
    const data = await fetchFn();
    
    if (data.length === 0) {
      console.log(`   ⚠️  No ${modelName} to migrate`);
      return { model: modelName, count: 0, duration: Date.now() - startTime };
    }
    
    await insertFn(data);
    const duration = Date.now() - startTime;
    
    console.log(`   ✅ Migrated ${data.length} ${modelName} (${duration}ms)`);
    return { model: modelName, count: data.length, duration };
  } catch (error) {
    console.error(`   ❌ Failed to migrate ${modelName}:`, error);
    throw error;
  }
}

async function migrateData(): Promise<void> {
  const stats: MigrationStats[] = [];
  const overallStart = Date.now();
  
  console.log('\n🚀 Starting SQLite → PostgreSQL migration...\n');
  console.log('=' .repeat(60));
  
  try {
    // 1. Users
    stats.push(await migrateModel(
      'Users',
      () => sqlite.user.findMany(),
      (data) => postgres.user.createMany({ data, skipDuplicates: true })
    ));
    
    // 2. Profile Types
    stats.push(await migrateModel(
      'ProfileTypes',
      () => sqlite.profileType.findMany(),
      (data) => postgres.profileType.createMany({ data, skipDuplicates: true })
    ));
    
    // 3. Stock Lengths
    stats.push(await migrateModel(
      'StockLengths',
      () => sqlite.stockLength.findMany(),
      (data) => postgres.stockLength.createMany({ data, skipDuplicates: true })
    ));
    
    // 4. Work Orders - Commented out as this model doesn't exist in current schema
    // stats.push(await migrateModel(
    //   'WorkOrders',
    //   () => sqlite.workOrder.findMany(),
    //   (data) => postgres.workOrder.createMany({ data, skipDuplicates: true })
    // ));
    
    // 5. Cutting Lists
    stats.push(await migrateModel(
      'CuttingLists',
      () => sqlite.cuttingList.findMany(),
      (data) => postgres.cuttingList.createMany({ 
        data: data.map(item => ({
          ...item,
          sections: item.sections ?? undefined,
          metadata: item.metadata ?? undefined,
        })), 
        skipDuplicates: true 
      })
    ));
    
    // 6. Cutting List Items
    stats.push(await migrateModel(
      'CuttingListItems',
      () => sqlite.cuttingListItem.findMany(),
      (data) => postgres.cuttingListItem.createMany({ data, skipDuplicates: true })
    ));
    
    // 7. Optimizations
    stats.push(await migrateModel(
      'Optimizations',
      () => sqlite.optimization.findMany(),
      (data) => postgres.optimization.createMany({ 
        data: data.map(item => ({
          ...item,
          parameters: item.parameters || Prisma.JsonNull,
          result: item.result ?? Prisma.JsonNull,
          metadata: item.metadata ?? Prisma.JsonNull,
        })), 
        skipDuplicates: true 
      })
    ));
    
    // 8. Statistics Models
    stats.push(await migrateModel(
      'CuttingListStatistics',
      () => sqlite.cuttingListStatistics.findMany(),
      (data) => postgres.cuttingListStatistics.createMany({ data, skipDuplicates: true })
    ));
    
    // WorkOrderStatistics - Commented out as this model doesn't exist in current schema
    // stats.push(await migrateModel(
    //   'WorkOrderStatistics',
    //   () => sqlite.workOrderStatistics.findMany(),
    //   (data) => postgres.workOrderStatistics.createMany({ data, skipDuplicates: true })
    // ));
    
    stats.push(await migrateModel(
      'ProfileUsageStatistics',
      () => sqlite.profileUsageStatistics.findMany(),
      (data) => postgres.profileUsageStatistics.createMany({ data, skipDuplicates: true })
    ));
    
    stats.push(await migrateModel(
      'OptimizationStatistics',
      () => sqlite.optimizationStatistics.findMany(),
      (data) => postgres.optimizationStatistics.createMany({ 
        data: data.map(item => ({
          ...item,
          parameters: item.parameters ?? undefined,
        })), 
        skipDuplicates: true 
      })
    ));
    
    // 9. System Metrics & Activity
    stats.push(await migrateModel(
      'SystemMetrics',
      () => sqlite.systemMetrics.findMany(),
      (data) => postgres.systemMetrics.createMany({ 
        data: data.map(item => ({
          ...item,
          metadata: item.metadata ?? undefined,
        })), 
        skipDuplicates: true 
      })
    ));
    
    stats.push(await migrateModel(
      'UserActivity',
      () => sqlite.userActivity.findMany(),
      (data) => postgres.userActivity.createMany({ 
        data: data.map(item => ({
          ...item,
          activityData: item.activityData ?? undefined,
        })), 
        skipDuplicates: true 
      })
    ));
    
    // Summary
    const totalDuration = Date.now() - overallStart;
    const totalRecords = stats.reduce((sum, stat) => sum + stat.count, 0);
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✨ Migration Summary:\n');
    
    stats.forEach((stat) => {
      if (stat.count > 0) {
        console.log(`   ${stat.model.padEnd(25)} ${String(stat.count).padStart(6)} records (${stat.duration}ms)`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`   Total records: ${totalRecords}`);
    console.log(`   Total duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
    console.log();
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    logger.error('Migration failed', { error });
    throw error;
  }
}

// Run migration
migrateData()
  .catch((error) => {
    console.error('Fatal migration error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await sqlite.$disconnect();
    await postgres.$disconnect();
    console.log('🔌 Database connections closed.\n');
  });


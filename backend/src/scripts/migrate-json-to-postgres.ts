/**
 * JSON to PostgreSQL Data Migration
 * Migrates cutting lists from JSON file to PostgreSQL database
 * 
 * Usage: ts-node src/scripts/migrate-json-to-postgres.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface JsonCuttingList {
  id: string;
  title: string;
  weekNumber: number;
  sections: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

async function migrateJsonData(): Promise<void> {
  console.log('\n🚀 Starting JSON → PostgreSQL migration...\n');
  
  const jsonFile = path.join(__dirname, '../../data/cutting-lists.json');
  
  if (!fs.existsSync(jsonFile)) {
    console.log('❌ No JSON data file found at:', jsonFile);
    return;
  }
  
  try {
    // Read JSON data
    const jsonData = fs.readFileSync(jsonFile, 'utf8');
    const data = JSON.parse(jsonData);
    
    console.log('📦 JSON data loaded');
    console.log('   Type:', Array.isArray(data) ? 'Array' : typeof data);
    console.log('   Length:', Array.isArray(data) ? data.length : 'N/A');
    
    // Convert Map format [[id, obj], ...] to Map
    let cuttingListsMap: Map<string, JsonCuttingList>;
    
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0]) && data[0].length === 2) {
      // Map format
      cuttingListsMap = new Map(data);
      console.log('   Format: Map (key-value pairs)');
    } else if (Array.isArray(data)) {
      // Array format
      cuttingListsMap = new Map();
      data.forEach((item: JsonCuttingList) => {
        if (item && item.id) {
          cuttingListsMap.set(item.id, item);
        }
      });
      console.log('   Format: Array of objects');
    } else {
      console.log('❌ Unknown data format');
      return;
    }
    
    console.log(`\n📊 Found ${cuttingListsMap.size} cutting lists to migrate\n`);
    
    // Create default user if not exists
    const defaultUser = await prisma.user.upsert({
      where: { email: 'default@lemnix.com' },
      create: {
        email: 'default@lemnix.com',
        name: 'Default User',
        role: 'admin',
        isActive: true
      },
      update: {}
    });
    
    console.log(`✅ Default user ready: ${defaultUser.email} (${defaultUser.id})\n`);
    
    // Migrate each cutting list
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const [id, cuttingList] of cuttingListsMap.entries()) {
      try {
        console.log(`   Migrating: ${cuttingList.title} (Week ${cuttingList.weekNumber})...`);
        
        await prisma.cuttingList.upsert({
          where: { id },
          create: {
            id,
            name: cuttingList.title,
            weekNumber: cuttingList.weekNumber,
            sections: cuttingList.sections as Prisma.InputJsonValue,
            userId: defaultUser.id,
            status: 'active',
            createdAt: cuttingList.createdAt ? new Date(cuttingList.createdAt) : undefined,
            updatedAt: cuttingList.updatedAt ? new Date(cuttingList.updatedAt) : undefined
          },
          update: {
            name: cuttingList.title,
            sections: cuttingList.sections as Prisma.InputJsonValue,
            updatedAt: new Date()
          }
        });
        
        migrated++;
        console.log(`      ✅ Success`);
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unique constraint')) {
          console.log(`      ⚠️  Skipped (already exists)`);
          skipped++;
        } else {
          console.error(`      ❌ Error:`, error instanceof Error ? error.message : error);
          errors++;
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✨ Migration Summary:\n');
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped:  ${skipped}`);
    console.log(`   Errors:   ${errors}`);
    console.log(`   Total:    ${cuttingListsMap.size}`);
    console.log('\n' + '='.repeat(60) + '\n');
    
    if (errors === 0) {
      console.log('🎉 Migration completed successfully!\n');
    } else {
      console.log('⚠️  Migration completed with errors\n');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateJsonData()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed.\n');
  });


/**
 * LEMNİX Database Seed
 * Populates database with sample data for development
 * 
 * @version 1.0.0 - Enterprise Compliance
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[INFO] Starting database seed...');

  // Create system user for cutting lists
  const systemUser = await prisma.user.upsert({
    where: { id: 'system-user' },
    update: {},
    create: {
      id: 'system-user',
      email: 'system@lemnix.com',
      name: 'System User',
      role: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  console.log(`[INFO] System user created: ${systemUser.id}`);

  // Real cutting lists - no mock data
  const sampleCuttingLists: any[] = [];

  console.log(`[INFO] Seeding ${sampleCuttingLists.length} cutting lists...`);

  // Real optimization results - no mock data
  const sampleOptimizations: any[] = [];

  console.log(`[INFO] Seeding ${sampleOptimizations.length} optimization results...`);

  // Real profiles - no mock data
  const sampleProfiles: any[] = [];

  console.log(`[INFO] Seeding ${sampleProfiles.length} profile definitions...`);

  console.log('[INFO] Database seed completed successfully');
  console.log('[INFO] Summary:');
  console.log(`[INFO]   - Users: 1 (system-user)`);
  console.log(`[INFO]   - Cutting Lists: ${sampleCuttingLists.length}`);
  console.log(`[INFO]   - Optimization Results: ${sampleOptimizations.length}`);
  console.log(`[INFO]   - Profile Definitions: ${sampleProfiles.length}`);
}

main()
  .catch((e) => {
    console.error('[ERROR] Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


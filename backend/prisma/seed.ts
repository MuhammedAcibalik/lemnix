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

  console.log('[INFO] Database seed completed successfully');
  console.log('[INFO] Summary:');
  console.log(`[INFO]   - Users: 1 (system-user)`);
}

main()
  .catch((e) => {
    console.error('[ERROR] Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


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

  const systemUserId = process.env.SYSTEM_USER_ID ?? 'system-user';
  const systemUserEmail = process.env.SYSTEM_USER_EMAIL ?? 'system@lemnix.com';
  const systemUserName = process.env.SYSTEM_USER_NAME ?? 'System User';
  const systemUserRole = process.env.SYSTEM_USER_ROLE ?? 'system';

  // Create system user for cutting lists
  const systemUser = await prisma.user.upsert({
    where: { id: systemUserId },
    update: {
      email: systemUserEmail,
      name: systemUserName,
      role: systemUserRole
    },
    create: {
      id: systemUserId,
      email: systemUserEmail,
      name: systemUserName,
      role: systemUserRole,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  console.log(`[INFO] System user created: ${systemUser.id}`);

  console.log('[INFO] Database seed completed successfully');
  console.log('[INFO] Summary:');
  console.log(`[INFO]   - Users: 1 (${systemUserId})`);
}

main()
  .catch((e) => {
    console.error('[ERROR] Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


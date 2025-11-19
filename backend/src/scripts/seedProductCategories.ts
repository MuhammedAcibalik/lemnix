/**
 * Seed Product Categories
 * Populates the database with initial product categories
 *
 * @module scripts/seedProductCategories
 * @version 1.0.0
 */

import { prisma } from "../config/database";
import { logger } from "../services/logger";

// Type-safe Prisma client with ProductCategory model
type PrismaClientWithProductCategory = typeof prisma & {
  productCategory: {
    findUnique: (args: {
      where: { name: string };
    }) => Promise<{ id: string; name: string } | null>;
    create: (args: {
      data: { name: string; description?: string };
    }) => Promise<{ id: string; name: string }>;
  };
};

const typedPrisma = prisma as unknown as PrismaClientWithProductCategory;

// ============================================================================
// PRODUCT CATEGORIES DATA
// ============================================================================

const PRODUCT_CATEGORIES = [
  "Snap/Poster Frames",
  "Illuminated Products",
  "Pavement Signs",
  "Printable Solutions",
  "Wood Displays",
  "Exhibition Displays",
  "Counter Displays",
  "Banners",
  "Poster Holders",
  "Real Estate Sign",
  "Menuboards",
  "Noticeboards",
  "Frameboards",
  "Showboards",
  "Info Stands",
  "Presentation Systems",
  "Leaflet Dispensers",
  "Brochure Sets",
  "Que Control System",
  "Personal Protection Equipment",
  "Slide-in Frames",
  "Door Signs",
  "Office Facilities",
  "Digital Solutions",
  "Outdoor Displays",
  "Accessories",
  "Semi Products",
  "LED Module",
  "Plastic Extrusion Sheets",
] as const;

// ============================================================================
// SEED FUNCTION
// ============================================================================

export async function seedProductCategories(): Promise<void> {
  try {
    logger.info("Starting product categories seed");

    let createdCount = 0;
    let skippedCount = 0;

    for (const categoryName of PRODUCT_CATEGORIES) {
      try {
        // Check if category already exists
        const existing = await typedPrisma.productCategory.findUnique({
          where: { name: categoryName },
        });

        if (existing) {
          logger.debug(`Category already exists: ${categoryName}`);
          skippedCount++;
          continue;
        }

        // Create category
        await typedPrisma.productCategory.create({
          data: {
            name: categoryName,
            description: `Product category for ${categoryName}`,
          },
        });

        logger.debug(`Created category: ${categoryName}`);
        createdCount++;
      } catch (error) {
        logger.error(`Failed to create category: ${categoryName}`, { error });
        // Continue with next category
      }
    }

    logger.info("Product categories seed completed", {
      created: createdCount,
      skipped: skippedCount,
      total: PRODUCT_CATEGORIES.length,
    });
  } catch (error) {
    logger.error("Failed to seed product categories", { error });
    throw error;
  }
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

// Run if executed directly
(async () => {
  try {
    await seedProductCategories();
    logger.info("Seed script completed successfully");
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    logger.error("Seed script failed", { error });
    await prisma.$disconnect();
    process.exit(1);
  }
})();


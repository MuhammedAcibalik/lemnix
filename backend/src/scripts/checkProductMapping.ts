/**
 * Check Product Mapping Script
 * Utility script to check if a product has a category mapping
 *
 * Usage: npx tsx src/scripts/checkProductMapping.ts "İNCE HELEZON"
 */

import { prisma } from "../config/database";

async function checkProductMapping(productName: string): Promise<void> {
  try {
    const normalizedProductName = productName.toUpperCase().trim();

    console.log("🔍 Checking product mapping...");
    console.log(`   Original: "${productName}"`);
    console.log(`   Normalized: "${normalizedProductName}"`);

    // Check if mapping exists
    const mapping = await prisma.productMapping.findUnique({
      where: { productName: normalizedProductName },
      include: { category: true },
    });

    if (mapping) {
      console.log("✅ Mapping found!");
      console.log(`   Category: ${mapping.category.name}`);
      console.log(`   Category ID: ${mapping.categoryId}`);
      console.log(`   Created: ${mapping.createdAt}`);
      console.log(`   Updated: ${mapping.updatedAt}`);
    } else {
      console.log("❌ No mapping found");
      console.log(
        "   This is expected for new products or products without categories",
      );
    }

    // Also check all mappings for similar product names
    const similarMappings = await prisma.productMapping.findMany({
      where: {
        productName: {
          contains: normalizedProductName.substring(0, 3),
          mode: "insensitive",
        },
      },
      include: { category: true },
      take: 10,
    });

    if (similarMappings.length > 0) {
      console.log("\n📋 Similar product mappings found:");
      similarMappings.forEach((m) => {
        console.log(`   - "${m.productName}" → ${m.category.name}`);
      });
    }

    // Check total mappings count
    const totalMappings = await prisma.productMapping.count();
    console.log(`\n📊 Total product mappings in database: ${totalMappings}`);
  } catch (error) {
    console.error("❌ Error checking product mapping:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// CLI execution
const productName = process.argv[2];

if (!productName) {
  console.error(
    '❌ Usage: npx tsx src/scripts/checkProductMapping.ts "PRODUCT_NAME"',
  );
  process.exit(1);
}

checkProductMapping(productName)
  .then(() => {
    console.log("\n✅ Check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Check failed:", error);
    process.exit(1);
  });

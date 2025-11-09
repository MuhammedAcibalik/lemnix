/**
 * @fileoverview Smart Suggestion Data Migration Script
 * @module scripts/migrateSuggestionData
 * @version 1.0.0
 *
 * Migrates cutting-lists.json data to PostgreSQL:
 * 1. Analyzes existing data
 * 2. Builds suggestion patterns
 * 3. Calculates confidence scores
 * 4. Populates SuggestionPattern table
 */

import fs from "fs";
import path from "path";
import { prisma } from "../config/database";
import { logger } from "../services/logger";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ProfileItem {
  readonly id: string;
  readonly profile?: string;
  readonly measurement: string;
  readonly quantity: number;
}

interface CuttingListItem {
  readonly id: string;
  readonly workOrderId: string;
  readonly date?: string;
  readonly version?: string;
  readonly color?: string;
  readonly note?: string;
  readonly orderQuantity: number;
  readonly size: string;
  readonly profiles: ReadonlyArray<ProfileItem>;
}

interface ProductSection {
  readonly id: string;
  readonly productName: string;
  readonly items: ReadonlyArray<CuttingListItem>;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

interface CuttingList {
  readonly id: string;
  readonly title: string;
  readonly weekNumber: number;
  readonly sections: ReadonlyArray<ProductSection>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface PatternData {
  productName: string;
  size: string;
  profile: string;
  measurement: string;
  quantity: number;
  orderQuantity: number;
  ratio: number;
  frequency: number;
  contexts: string[];
  variations: string[];
  totalQuantity: number;
  totalOrderQuantity: number;
  ratioHistory: Array<{ orderQty: number; profileQty: number; ratio: number }>;
  lastUsed: Date;
}

// ============================================================================
// MIGRATION SERVICE
// ============================================================================

class SuggestionDataMigration {
  private readonly dataPath: string;
  private patterns: Map<string, PatternData> = new Map();

  constructor() {
    this.dataPath = path.join(__dirname, "../../data/cutting-lists.json");
  }

  /**
   * Main migration method
   */
  async migrate(): Promise<void> {
    logger.info("🚀 Starting Smart Suggestion Data Migration");

    try {
      // Step 1: Load data
      const data = this.loadCuttingLists();
      logger.info(`✅ Loaded ${data.length} cutting lists`);

      // Step 2: Analyze patterns
      this.analyzePatterns(data);
      logger.info(`✅ Analyzed ${this.patterns.size} unique patterns`);

      // Step 3: Calculate confidence scores
      this.calculateConfidence();
      logger.info("✅ Calculated confidence scores");

      // Step 4: Populate database
      await this.populateDatabase();
      logger.info("✅ Database populated");

      // Step 5: Verify migration
      await this.verifyMigration();
      logger.info("✅ Migration verified");

      logger.info("🎉 Migration completed successfully!");
    } catch (error) {
      logger.error("❌ Migration failed", { error });
      throw error;
    }
  }

  /**
   * Load cutting lists from JSON
   */
  private loadCuttingLists(): CuttingList[] {
    if (!fs.existsSync(this.dataPath)) {
      throw new Error(`Data file not found: ${this.dataPath}`);
    }

    const raw = fs.readFileSync(this.dataPath, "utf-8");
    const data = JSON.parse(raw);

    // Handle Map format: [[key, value], ...]
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
      return data.map(([_, list]) => list as CuttingList);
    }

    // Handle direct array
    return data as CuttingList[];
  }

  /**
   * Analyze patterns from cutting lists
   */
  private analyzePatterns(lists: CuttingList[]): void {
    for (const list of lists) {
      const listDate = new Date(list.updatedAt || list.createdAt);

      for (const section of list.sections) {
        const productName = section.productName.toUpperCase().trim();

        for (const item of section.items) {
          const size = item.size.toUpperCase().trim();
          const contextKey = `${productName}|${size}`;

          for (const profile of item.profiles) {
            const profileName = (profile.profile || "UNKNOWN")
              .toUpperCase()
              .trim();
            const measurement = profile.measurement.trim();
            const quantity = profile.quantity;

            const patternKey = `${productName}|${size}|${profileName}|${measurement}`;
            const orderQty = item.orderQuantity || 1;
            const ratio = orderQty > 0 ? quantity / orderQty : 1;

            // Get or create pattern
            let pattern = this.patterns.get(patternKey);
            if (!pattern) {
              pattern = {
                productName,
                size,
                profile: profileName,
                measurement,
                quantity,
                orderQuantity: orderQty,
                ratio,
                frequency: 0,
                contexts: [],
                variations: [measurement],
                totalQuantity: 0,
                totalOrderQuantity: 0,
                ratioHistory: [],
                lastUsed: listDate,
              };
              this.patterns.set(patternKey, pattern);
            }

            // Update pattern
            pattern.frequency++;
            pattern.totalQuantity += quantity;
            pattern.totalOrderQuantity += orderQty;

            // Add to ratio history
            pattern.ratioHistory.push({
              orderQty,
              profileQty: quantity,
              ratio,
            });
            if (listDate > pattern.lastUsed) {
              pattern.lastUsed = listDate;
            }

            // Add context if unique
            if (!pattern.contexts.includes(contextKey)) {
              pattern.contexts.push(contextKey);
            }

            // Add measurement variation if unique
            if (!pattern.variations.includes(measurement)) {
              pattern.variations.push(measurement);
            }
          }
        }
      }
    }
  }

  /**
   * Calculate confidence scores using ML-like algorithm
   * Confidence = Frequency Score (0-40) + Recency Score (0-30) + Context Score (0-30)
   */
  private calculateConfidence(): void {
    const allPatterns = Array.from(this.patterns.values());
    const maxFrequency = Math.max(...allPatterns.map((p) => p.frequency), 1);
    const now = Date.now();

    for (const pattern of allPatterns) {
      // 1. Frequency Score (0-40 points)
      const frequencyScore = (pattern.frequency / maxFrequency) * 40;

      // 2. Recency Score (0-30 points) - Exponential decay
      const daysSinceLastUse =
        (now - pattern.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = 30 * Math.exp(-daysSinceLastUse / 90); // 90-day half-life

      // 3. Context Score (0-30 points) - Based on context diversity
      const contextScore = Math.min(pattern.contexts.length * 10, 30);

      // Total confidence (0-100)
      const confidence = frequencyScore + recencyScore + contextScore;

      // Store back to pattern (will use in database insertion)
      (pattern as unknown as Record<string, unknown>).confidence =
        Math.round(confidence * 100) / 100;
    }
  }

  /**
   * Populate database with patterns
   */
  private async populateDatabase(): Promise<void> {
    logger.info("📝 Populating database...");

    // Clear existing patterns
    await prisma.suggestionPattern.deleteMany({});
    logger.info("🗑️  Cleared existing patterns");

    // Insert patterns in batches
    const patterns = Array.from(this.patterns.entries());
    const BATCH_SIZE = 100;

    for (let i = 0; i < patterns.length; i += BATCH_SIZE) {
      const batch = patterns.slice(i, i + BATCH_SIZE);

      await prisma.$transaction(
        batch.map(([patternKey, pattern]) => {
          const contextKey = `${pattern.productName}|${pattern.size}`;
          const averageQuantity = pattern.totalQuantity / pattern.frequency;
          const averageOrderQuantity =
            pattern.totalOrderQuantity / pattern.frequency;
          const averageRatio =
            averageOrderQuantity > 0
              ? averageQuantity / averageOrderQuantity
              : 1;

          return prisma.suggestionPattern.create({
            data: {
              contextKey,
              patternKey,
              productName: pattern.productName,
              size: pattern.size,
              profile: pattern.profile,
              measurement: pattern.measurement,
              quantity: pattern.quantity,
              orderQuantity: pattern.orderQuantity,
              ratio: pattern.ratio,
              frequency: pattern.frequency,
              confidence:
                ((pattern as unknown as Record<string, unknown>)
                  .confidence as number) || 0,
              lastUsed: pattern.lastUsed,
              averageQuantity,
              averageRatio,
              contexts: pattern.contexts,
              variations: pattern.variations,
              ratioHistory: pattern.ratioHistory,
              metadata: {
                totalQuantity: pattern.totalQuantity,
                totalOrderQuantity: pattern.totalOrderQuantity,
                averageOrderQuantity,
                variationCount: pattern.variations.length,
              },
            },
          });
        }),
      );

      logger.info(
        `✅ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(patterns.length / BATCH_SIZE)}`,
      );
    }
  }

  /**
   * Verify migration
   */
  private async verifyMigration(): Promise<void> {
    const count = await prisma.suggestionPattern.count();
    const avgConfidence = await prisma.suggestionPattern.aggregate({
      _avg: { confidence: true },
    });

    logger.info("📊 Migration Statistics:", {
      totalPatterns: count,
      averageConfidence: avgConfidence._avg.confidence?.toFixed(2),
      expectedPatterns: this.patterns.size,
    });

    if (count !== this.patterns.size) {
      throw new Error(
        `Pattern count mismatch: expected ${this.patterns.size}, got ${count}`,
      );
    }

    // Check high confidence patterns
    const highConfidence = await prisma.suggestionPattern.count({
      where: { confidence: { gte: 70 } },
    });

    logger.info(`✅ High confidence patterns (>=70): ${highConfidence}`);
  }
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

async function main() {
  const migration = new SuggestionDataMigration();

  try {
    await migration.migrate();
    process.exit(0);
  } catch (error) {
    logger.error("Migration failed", { error });
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { SuggestionDataMigration };

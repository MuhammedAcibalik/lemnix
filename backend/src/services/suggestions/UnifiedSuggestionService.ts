/**
 * @fileoverview Unified Suggestion Service
 * @module services/suggestions/UnifiedSuggestionService
 * @version 1.0.0
 *
 * Single source of truth for all smart suggestions
 * Uses PostgreSQL, ML-based scoring, and follows SOLID principles
 */

import { SuggestionPatternRepository } from "../../repositories/SuggestionPatternRepository";
import { ScoringService } from "./ScoringService";
import { logger } from "../logger";
import {
  normalizeProfile,
  normalizeMeasurement,
  createContextKey,
  createPatternKey,
} from "../../utils/stringNormalizer";
import { cacheService } from "../cache/RedisCache";
import { prisma } from "../../config/database";

// Use the repository's SuggestionPattern type
type SuggestionPattern = Record<string, unknown>;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SmartSuggestion {
  readonly type: "product" | "size" | "profile" | "combination";
  readonly value: string;
  readonly confidence: number;
  readonly frequency: number;
  readonly reasoning: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ProfileSuggestion {
  readonly profile: string;
  readonly measurement: string;
  readonly suggestedQuantity: number;
  readonly confidence: number;
  readonly reasoning: string;
  readonly alternatives: readonly AlternativeSuggestion[];
}

export interface AlternativeSuggestion {
  readonly profile: string;
  readonly measurement: string;
  readonly quantity: number;
  readonly confidence: number;
  readonly reason: string;
}

export interface CombinationSuggestion {
  readonly productName: string;
  readonly size: string;
  readonly profiles: readonly {
    readonly profile: string;
    readonly measurement: string;
    readonly ratio: number;
    readonly confidence: number;
  }[];
  readonly totalConfidence: number;
  readonly reasoning: string;
}

export interface SuggestionStatistics {
  readonly totalPatterns: number;
  readonly highConfidence: number;
  readonly mediumConfidence: number;
  readonly lowConfidence: number;
  readonly averageConfidence: number;
  readonly uniqueProducts: number;
  readonly recentActivity: number;
}

// ============================================================================
// UNIFIED SUGGESTION SERVICE
// ============================================================================

export class UnifiedSuggestionService {
  private static instance: UnifiedSuggestionService;

  private readonly patternRepo: SuggestionPatternRepository;
  private readonly scoringService: ScoringService;

  private constructor() {
    this.patternRepo = SuggestionPatternRepository.getInstance();
    this.scoringService = ScoringService.getInstance();
  }

  public static getInstance(): UnifiedSuggestionService {
    if (!UnifiedSuggestionService.instance) {
      UnifiedSuggestionService.instance = new UnifiedSuggestionService();
    }
    return UnifiedSuggestionService.instance;
  }

  // ==========================================================================
  // PRODUCT SUGGESTIONS
  // ==========================================================================

  /**
   * Get product suggestions based on query
   */
  async getProductSuggestions(
    query: string,
    limit: number = 10,
  ): Promise<SmartSuggestion[]> {
    try {
      const patterns = await this.patternRepo.searchByProduct(query, limit * 2);

      // Group by product name
      const productMap = new Map<string, SuggestionPattern[]>();
      for (const pattern of patterns) {
        const existing = productMap.get(pattern.productName as string) || [];
        existing.push(pattern);
        productMap.set(pattern.productName as string, existing);
      }

      // Calculate aggregate confidence for each product
      const suggestions: SmartSuggestion[] = [];
      for (const [productName, productPatterns] of Array.from(
        productMap.entries(),
      )) {
        const totalFrequency = productPatterns.reduce(
          (sum, p) => sum + (p.frequency as number),
          0,
        );
        const avgConfidence =
          productPatterns.reduce(
            (sum, p) => sum + (p.confidence as number),
            0,
          ) / productPatterns.length;

        suggestions.push({
          type: "product",
          value: productName,
          confidence: Math.round(avgConfidence * 100) / 100,
          frequency: totalFrequency,
          reasoning: `Used ${totalFrequency} times across ${productPatterns.length} patterns`,
          metadata: {
            patternCount: productPatterns.length,
            uniqueSizes: new Set(productPatterns.map((p) => p.size as string))
              .size,
          },
        });
      }

      // Sort by confidence and frequency
      this.sortSuggestions(suggestions);

      return suggestions.slice(0, limit);
    } catch (error) {
      logger.error("Failed to get product suggestions", {
        error,
        query,
        limit,
      });
      return [];
    }
  }

  // ==========================================================================
  // SIZE SUGGESTIONS
  // ==========================================================================

  /**
   * Get size suggestions for a product
   */
  async getSizeSuggestions(
    productName: string,
    query: string = "",
    limit: number = 10,
  ): Promise<SmartSuggestion[]> {
    try {
      // Get all sizes for this product
      const sizes =
        await this.patternRepo.getUniqueSizesForProduct(productName);

      // Filter by query if provided
      const filteredSizes = query
        ? sizes.filter((size) =>
            size.toUpperCase().includes(query.toUpperCase()),
          )
        : sizes;

      // Get patterns for each size to calculate confidence
      const suggestions: SmartSuggestion[] = [];

      for (const size of filteredSizes) {
        const patterns = await this.patternRepo.findByProductAndSize(
          productName,
          size,
        );

        if (patterns.length > 0) {
          const totalFrequency = patterns.reduce(
            (sum, p) => sum + (p.frequency as number),
            0,
          );
          const avgConfidence =
            patterns.reduce((sum, p) => sum + (p.confidence as number), 0) /
            patterns.length;

          suggestions.push({
            type: "size",
            value: size,
            confidence: Math.round(avgConfidence * 100) / 100,
            frequency: totalFrequency,
            reasoning: `Used ${totalFrequency} times with ${productName}`,
            metadata: {
              patternCount: patterns.length,
              uniqueProfiles: new Set(patterns.map((p) => p.profile as string))
                .size,
            },
          });
        }
      }

      // Sort by confidence and frequency
      this.sortSuggestions(suggestions);

      return suggestions.slice(0, limit);
    } catch (error) {
      logger.error("Failed to get size suggestions", {
        error,
        productName,
        query,
        limit,
      });
      return [];
    }
  }

  // ==========================================================================
  // PROFILE SUGGESTIONS
  // ==========================================================================

  /**
   * Get profile suggestions for product and size
   */
  async getProfileSuggestions(
    productName: string,
    size: string,
    query: string = "",
    limit: number = 10,
  ): Promise<ProfileSuggestion[]> {
    try {
      const patterns = await this.patternRepo.findByProductAndSize(
        productName,
        size,
      );

      // Filter by query if provided
      const filteredPatterns = query
        ? patterns.filter((p) =>
            (p.profile as string).toUpperCase().includes(query.toUpperCase()),
          )
        : patterns;

      // Get max frequency for scoring
      const maxFrequency = Math.max(
        ...filteredPatterns.map((p) => p.frequency as number),
        1,
      );

      const suggestions: ProfileSuggestion[] = [];

      for (const pattern of filteredPatterns.slice(0, limit)) {
        // Calculate detailed confidence
        const confidenceScore = this.scoringService.calculateConfidenceScore(
          {
            frequency: pattern.frequency as number,
            lastUsed: pattern.lastUsed as Date,
            contexts: pattern.contexts as string[],
            averageQuantity: pattern.averageQuantity as number,
            variations: pattern.variations as string[],
          },
          {
            productName,
            size,
          },
          maxFrequency,
        );

        // Predict quantity
        const quantityPrediction = this.scoringService.predictQuantity(
          {
            frequency: pattern.frequency as number,
            lastUsed: pattern.lastUsed as Date,
            contexts: pattern.contexts as string[],
            averageQuantity: pattern.averageQuantity as number,
            variations: pattern.variations as string[],
          },
          0, // No order quantity context yet
          confidenceScore.total,
        );

        // Find alternatives (similar profiles)
        const alternatives: AlternativeSuggestion[] = [];
        for (const altPattern of filteredPatterns) {
          if (altPattern.id !== pattern.id && alternatives.length < 3) {
            const similarity = this.scoringService.calculateStringSimilarity(
              pattern.profile as string,
              altPattern.profile as string,
            );

            if (similarity > 0.5) {
              alternatives.push({
                profile: altPattern.profile as string,
                measurement: altPattern.measurement as string,
                quantity: Math.round(altPattern.averageQuantity as number),
                confidence:
                  Math.round((altPattern.confidence as number) * 100) / 100,
                reason: `Similar to ${pattern.profile} (${Math.round(similarity * 100)}% match)`,
              });
            }
          }
        }

        suggestions.push({
          profile: pattern.profile as string,
          measurement: pattern.measurement as string,
          suggestedQuantity: quantityPrediction.predicted,
          confidence: confidenceScore.total,
          reasoning: `${confidenceScore.breakdown}. ${quantityPrediction.reasoning}`,
          alternatives,
        });
      }

      return suggestions;
    } catch (error) {
      logger.error("Failed to get profile suggestions", {
        error,
        productName,
        size,
        query,
        limit,
      });
      return [];
    }
  }

  // ==========================================================================
  // COMBINATION SUGGESTIONS
  // ==========================================================================

  /**
   * Get complete profile combination for product and size
   */
  async getCombinationSuggestions(
    productName: string,
    size: string,
    limit: number = 5,
  ): Promise<CombinationSuggestion[]> {
    try {
      const patterns = await this.patternRepo.findByProductAndSize(
        productName,
        size,
      );

      if (patterns.length === 0) {
        return [];
      }

      // Group patterns by profile to find most common combinations
      const profileGroups = new Map<string, SuggestionPattern[]>();
      for (const pattern of patterns) {
        const existing = profileGroups.get(pattern.profile as string) || [];
        existing.push(pattern);
        profileGroups.set(pattern.profile as string, existing);
      }

      // Build combination suggestions
      const suggestions: CombinationSuggestion[] = [];

      // Take top profiles by confidence
      const topProfiles = Array.from(profileGroups.entries())
        .map(([profile, patterns]) => {
          const avgConfidence =
            patterns.reduce((sum, p) => sum + (p.confidence as number), 0) /
            patterns.length;
          const totalFrequency = patterns.reduce(
            (sum, p) => sum + (p.frequency as number),
            0,
          );
          return { profile, patterns, avgConfidence, totalFrequency };
        })
        .sort((a, b) => b.avgConfidence - a.avgConfidence)
        .slice(0, Math.min(5, limit * 2));

      // Create combination
      const profiles = topProfiles.map(
        ({ profile, patterns, avgConfidence }) => {
          const mostCommon = patterns.sort(
            (a, b) => (b.frequency as number) - (a.frequency as number),
          )[0];
          const totalQuantity = patterns.reduce(
            (sum, p) => sum + (p.quantity as number) * (p.frequency as number),
            0,
          );
          const totalFrequency = patterns.reduce(
            (sum, p) => sum + (p.frequency as number),
            0,
          );

          return {
            profile,
            measurement: mostCommon.measurement as string,
            ratio: mostCommon.averageQuantity as number,
            confidence: Math.round(avgConfidence * 100) / 100,
          };
        },
      );

      const totalConfidence =
        profiles.reduce((sum, p) => sum + p.confidence, 0) / profiles.length;

      suggestions.push({
        productName,
        size,
        profiles,
        totalConfidence: Math.round(totalConfidence * 100) / 100,
        reasoning: `Based on ${patterns.length} historical patterns with average confidence ${totalConfidence.toFixed(1)}%`,
      });

      return suggestions.slice(0, limit);
    } catch (error) {
      logger.error("Failed to get combination suggestions", {
        error,
        productName,
        size,
        limit,
      });
      return [];
    }
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get suggestion system statistics
   */
  async getStatistics(): Promise<SuggestionStatistics> {
    try {
      const stats = await this.patternRepo.getStatistics();
      const uniqueProducts = await this.patternRepo.getUniqueProductsCount();
      const recentPatterns = await this.patternRepo.getRecentPatterns(30);

      return {
        totalPatterns: stats.totalPatterns,
        highConfidence: stats.highConfidence,
        mediumConfidence: stats.mediumConfidence,
        lowConfidence: stats.lowConfidence,
        averageConfidence: Math.round(stats.averageConfidence * 100) / 100,
        uniqueProducts,
        recentActivity: recentPatterns.length,
      };
    } catch (error) {
      logger.error("Failed to get statistics", { error });
      throw error;
    }
  }

  // ==========================================================================
  // LEARNING METHODS
  // ==========================================================================

  /**
   * Learn from a new pattern (called when user adds new items)
   */
  async learnFromPattern(patternData: {
    productName: string;
    size: string;
    profile: string;
    measurement: string;
    quantity: number;
    orderQuantity: number;
    lastUsed: Date;
    originalIndex?: number;
  }): Promise<void> {
    try {
      // ✅ FIXED: Input validation layer
      if (!patternData.productName?.trim()) {
        logger.warn("Invalid productName for pattern learning", {
          patternData,
        });
        return;
      }
      if (!patternData.size?.trim()) {
        logger.warn("Invalid size for pattern learning", { patternData });
        return;
      }
      if (!patternData.profile?.trim()) {
        logger.warn("Invalid profile for pattern learning", { patternData });
        return;
      }
      if (!patternData.measurement?.trim()) {
        logger.warn("Invalid measurement for pattern learning", {
          patternData,
        });
        return;
      }
      if (patternData.quantity <= 0) {
        logger.warn("Invalid quantity for pattern learning", { patternData });
        return;
      }
      if (patternData.orderQuantity <= 0) {
        logger.warn("Invalid orderQuantity for pattern learning", {
          patternData,
        });
        return;
      }
      // ✅ USE NORMALIZER: Consistent with findByProductAndSize
      const contextKey = createContextKey(
        patternData.productName,
        patternData.size,
      );
      const patternKey = createPatternKey(
        patternData.productName,
        patternData.size,
        patternData.profile,
        patternData.measurement,
      );

      logger.info("Learning from pattern", {
        productName: patternData.productName,
        size: patternData.size,
        normalizedContextKey: contextKey,
        normalizedPatternKey: patternKey,
      });

      // Check if pattern already exists
      const existing = await this.patternRepo.findByPatternKey(patternKey);

      if (existing) {
        // Update existing pattern - increment frequency and update ratios
        const newFrequency = (existing.frequency as number) + 1;

        // ✅ FIXED: Division by zero protection
        if (patternData.orderQuantity <= 0) {
          logger.warn("Invalid orderQuantity for pattern learning", {
            orderQuantity: patternData.orderQuantity,
            quantity: patternData.quantity,
            productName: patternData.productName,
          });
          return; // Skip learning this invalid pattern
        }

        const newRatio = patternData.quantity / patternData.orderQuantity;

        // Update ratio history
        const ratioHistory =
          (existing.ratioHistory as unknown as Array<{
            orderQty: number;
            profileQty: number;
            ratio: number;
          }>) || [];
        ratioHistory.push({
          orderQty: patternData.orderQuantity,
          profileQty: patternData.quantity,
          ratio: newRatio,
        });

        // Calculate new average ratio
        const totalRatio = ratioHistory.reduce((sum, r) => sum + r.ratio, 0);
        const averageRatio = totalRatio / ratioHistory.length;

        // ✅ FIXED: Only update frequency, averageRatio, ratioHistory
        // DO NOT override quantity/orderQuantity (they are from first usage)
        await this.patternRepo.update(existing.id as string, {
          frequency: newFrequency,
          lastUsed: patternData.lastUsed,
          averageRatio,
          ratioHistory,
          // ❌ REMOVED: orderQuantity, ratio - Don't override historical values
        });

        // ✅ FIXED: Cache invalidation after pattern update
        try {
          await cacheService.invalidateByTag("suggestion-patterns");
          logger.debug("Cache invalidated after pattern update", {
            patternId: existing.id,
          });
        } catch (cacheError) {
          logger.warn("Cache invalidation failed (non-critical)", {
            cacheError,
          });
        }

        logger.info("Updated existing pattern", {
          patternKey,
          newFrequency,
          newRatio,
          averageRatio,
        });
      } else {
        // Create new pattern
        const ratio = patternData.quantity / patternData.orderQuantity;
        const ratioHistory = [
          {
            orderQty: patternData.orderQuantity,
            profileQty: patternData.quantity,
            ratio,
          },
        ];

        await this.patternRepo.create({
          contextKey,
          patternKey,
          productName: patternData.productName,
          size: patternData.size,
          profile: patternData.profile,
          measurement: patternData.measurement,
          quantity: patternData.quantity,
          orderQuantity: patternData.orderQuantity,
          ratio,
          frequency: 1,
          confidence: 50, // Start with medium confidence
          lastUsed: patternData.lastUsed,
          averageQuantity: patternData.quantity,
          averageRatio: ratio,
          contexts: [contextKey],
          variations: [patternData.measurement],
          ratioHistory,
          metadata: {
            totalQuantity: patternData.quantity,
            totalOrderQuantity: patternData.orderQuantity,
            averageOrderQuantity: patternData.orderQuantity,
            variationCount: 1,
            originalIndex: patternData.originalIndex ?? 0, // ✅ Preserve input order
          },
        });

        logger.info("Created new pattern", {
          patternKey,
          ratio,
          productName: patternData.productName,
          size: patternData.size,
        });
      }
    } catch (error) {
      logger.error("Failed to learn from pattern", {
        error: error instanceof Error ? error.message : "Unknown error",
        patternData: {
          productName: patternData.productName,
          size: patternData.size,
          profile: patternData.profile,
          measurement: patternData.measurement,
          quantity: patternData.quantity,
          orderQuantity: patternData.orderQuantity,
        },
      });
      // ✅ FIXED: Don't throw error, just log and continue
      // This prevents pattern learning failures from breaking the main flow
      return;
    }
  }

  // ==========================================================================
  // SMART APPLY (ONE-CLICK)
  // ==========================================================================

  /**
   * Calculate profile match score for pattern selection
   * Higher score = better match
   */
  private calculateProfileMatchScore(
    patternProfile: string,
    requestedProfile?: string,
  ): number {
    if (!requestedProfile) return 0;

    const normalizedPattern = normalizeProfile(patternProfile);
    const normalizedRequested = normalizeProfile(requestedProfile);

    // Exact match: 100 points
    if (normalizedPattern === normalizedRequested) return 100;

    // Contains match (either direction): 50 points
    if (
      normalizedPattern.includes(normalizedRequested) ||
      normalizedRequested.includes(normalizedPattern)
    ) {
      return 50;
    }

    // No match: 0 points
    return 0;
  }

  /**
   * Calculate ratios from historical cutting list items
   * This is used when ratioHistory is empty to get real ratios from database
   * ✅ OPTIMIZED: Uses CuttingListItem table directly for better performance
   */
  private async calculateRatiosFromHistory(
    productName: string,
    size: string,
    profile: string,
    measurement: string,
  ): Promise<Array<{ orderQty: number; profileQty: number; ratio: number }>> {
    try {
      // Normalize inputs for matching
      const normalizedSize = size.toUpperCase().trim();
      const normalizedProfile = normalizeProfile(profile);
      const normalizedMeasurement = normalizeMeasurement(measurement);
      const normalizedProductName = productName.toUpperCase().trim();

      // Get all cutting lists with sections to find productName
      const cuttingLists = await prisma.cuttingList.findMany({
        select: {
          id: true,
          sections: true,
        },
      });

      // Build a map of cuttingListId -> productName from sections
      const cuttingListProductMap = new Map<string, string>();
      for (const cuttingList of cuttingLists) {
        if (!cuttingList.sections || typeof cuttingList.sections !== "object") {
          continue;
        }

        const sections = cuttingList.sections as unknown as Array<{
          productName?: string;
        }>;

        if (!Array.isArray(sections)) {
          continue;
        }

        for (const section of sections) {
          const sectionProductName =
            section.productName?.toUpperCase().trim() || "";
          if (sectionProductName.includes(normalizedProductName)) {
            cuttingListProductMap.set(cuttingList.id, sectionProductName);
            break; // Found matching product, no need to check other sections
          }
        }
      }

      if (cuttingListProductMap.size === 0) {
        logger.info("No cutting lists found with matching product name", {
          productName,
        });
        return [];
      }

      // Get all CuttingListItem records that match size and profile
      const matchingItems = await prisma.cuttingListItem.findMany({
        where: {
          cuttingListId: {
            in: Array.from(cuttingListProductMap.keys()),
          },
          size: {
            contains: normalizedSize,
            mode: "insensitive",
          },
          profileType: {
            // Use contains for partial match
            contains: normalizedProfile,
            mode: "insensitive",
          },
          orderQuantity: {
            not: null,
            gt: 0,
          },
          quantity: {
            gt: 0,
          },
        },
        select: {
          workOrderId: true,
          orderQuantity: true,
          quantity: true,
          length: true,
          size: true,
          profileType: true,
          cuttingListId: true,
        },
      });

      const ratios: Array<{
        orderQty: number;
        profileQty: number;
        ratio: number;
      }> = [];
      // Track processed workOrderId+profile+measurement combinations to avoid duplicates
      const processedCombinations = new Set<string>();

      for (const item of matchingItems) {
        // Check if product name matches (from cuttingListProductMap)
        if (!cuttingListProductMap.has(item.cuttingListId)) {
          continue;
        }

        // Normalize item values for comparison
        const itemSize = item.size.toUpperCase().trim();
        if (!itemSize.includes(normalizedSize)) {
          continue;
        }

        const itemProfile = normalizeProfile(item.profileType);
        if (itemProfile !== normalizedProfile) {
          continue;
        }

        // Convert length to measurement string for comparison
        const itemMeasurement = normalizeMeasurement(`${item.length}mm`);
        if (itemMeasurement !== normalizedMeasurement) {
          continue;
        }

        const orderQty = item.orderQuantity || 0;
        if (orderQty <= 0) {
          continue;
        }

        const profileQty = item.quantity || 0;
        if (profileQty <= 0) {
          continue;
        }

        // Create unique key for workOrderId+profile+measurement combination
        // This ensures we get one ratio per order per profile+measurement
        const combinationKey = `${item.workOrderId}|${itemProfile}|${itemMeasurement}`;
        if (!processedCombinations.has(combinationKey)) {
          processedCombinations.add(combinationKey);
          const ratio = profileQty / orderQty;
          ratios.push({
            orderQty,
            profileQty,
            ratio,
          });
        }
      }

      logger.info("Calculated ratios from historical cutting list items", {
        productName,
        size,
        profile,
        measurement,
        ratioCount: ratios.length,
        itemCount: matchingItems.length,
      });

      return ratios;
    } catch (error) {
      logger.error("Failed to calculate ratios from history", {
        error,
        productName,
        size,
        profile,
        measurement,
      });
      return [];
    }
  }

  /**
   * Apply smart suggestion - returns complete profiles with calculated quantities
   * This is the ONE-CLICK magic: user enters orderQuantity, we calculate all profile quantities
   *
   * ✅ FIXED: Added requestedProfile parameter for profile type matching
   */
  async applySmartSuggestion(
    productName: string,
    size: string,
    orderQuantity: number,
    requestedProfile?: string,
  ): Promise<{
    profiles: Array<{
      profile: string;
      measurement: string;
      quantity: number;
      confidence: number;
      reasoning: string;
    }>;
    totalConfidence: number;
    reasoning: string;
  }> {
    try {
      // Get best matching patterns
      const patterns = await this.patternRepo.findByProductAndSize(
        productName,
        size,
      );

      if (patterns.length === 0) {
        logger.warn("No patterns found for smart suggestion", {
          productName,
          size,
        });
        return {
          profiles: [],
          totalConfidence: 0,
          reasoning:
            "No historical data found for this product-size combination",
        };
      }

      // ✅ FIXED: Keep original order from database (createdAt ASC)
      // Use array instead of Map to preserve insertion order
      const seenKeys = new Set<string>();
      const uniquePatterns: Array<{
        key: string;
        patterns: SuggestionPattern[];
      }> = [];

      // ✅ FIXED: Use normalized profile and measurement for key matching
      for (const pattern of patterns) {
        const normalizedProfile = normalizeProfile(
          (pattern.profile as string) || "",
        );
        const normalizedMeasurement = normalizeMeasurement(
          (pattern.measurement as string) || "",
        );
        const key = `${normalizedProfile}|${normalizedMeasurement}`;

        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          // Get all patterns with same normalized key
          const matchingPatterns = patterns.filter((p) => {
            const pProfile = normalizeProfile((p.profile as string) || "");
            const pMeasurement = normalizeMeasurement(
              (p.measurement as string) || "",
            );
            return `${pProfile}|${pMeasurement}` === key;
          });
          uniquePatterns.push({ key, patterns: matchingPatterns });
        }
      }

      // Calculate quantities for each profile+measurement using ratio
      const profiles = await Promise.all(
        uniquePatterns.map(async ({ key, patterns: profilePatterns }) => {
          // ✅ FIXED: Pattern sorting with profile match priority
          // Priority: Profile Match > Confidence > Frequency
          const bestPattern = profilePatterns.sort((a, b) => {
            // 1. Profile match score (if requestedProfile provided)
            if (requestedProfile) {
              const aMatch = this.calculateProfileMatchScore(
                (a.profile as string) || "",
                requestedProfile,
              );
              const bMatch = this.calculateProfileMatchScore(
                (b.profile as string) || "",
                requestedProfile,
              );

              if (aMatch !== bMatch) {
                return bMatch - aMatch; // Higher match score = better
              }
            }

            // 2. Confidence score
            const aConfidence =
              typeof a.confidence === "number" ? a.confidence : 0;
            const bConfidence =
              typeof b.confidence === "number" ? b.confidence : 0;
            const confDiff = bConfidence - aConfidence;
            if (confDiff !== 0) return confDiff;

            // 3. Frequency (tiebreaker)
            const aFrequency =
              typeof a.frequency === "number" ? a.frequency : 0;
            const bFrequency =
              typeof b.frequency === "number" ? b.frequency : 0;
            return bFrequency - aFrequency;
          })[0];

          // ✅ FIXED: Combine ratio histories from all patterns for accurate calculation
          // Tüm pattern'lerin ratioHistory'lerini birleştir
          const combinedRatioHistory: Array<{
            orderQty: number;
            profileQty: number;
            ratio: number;
          }> = [];

          let totalFrequency = 0;
          let totalConfidence = 0;

          for (const pattern of profilePatterns) {
            // Collect ratio history from each pattern
            const ratioHistory =
              (pattern.ratioHistory as unknown as Array<{
                orderQty: number;
                profileQty: number;
                ratio: number;
              }>) || [];

            if (Array.isArray(ratioHistory) && ratioHistory.length > 0) {
              combinedRatioHistory.push(...ratioHistory);
            }

            // Sum up frequency and confidence for weighted calculation
            totalFrequency +=
              typeof pattern.frequency === "number" ? pattern.frequency : 0;
            totalConfidence +=
              typeof pattern.confidence === "number" ? pattern.confidence : 0;
          }

          // ✅ FIXED: Calculate combined average ratio from all ratio histories
          let combinedAverageRatio = 0;
          let reasoning = "";

          if (combinedRatioHistory.length > 0) {
            // Calculate average ratio from all combined ratio histories
            const totalRatio = combinedRatioHistory.reduce(
              (sum, r) => sum + r.ratio,
              0,
            );
            combinedAverageRatio = totalRatio / combinedRatioHistory.length;

            reasoning = `Ratio: ${combinedAverageRatio.toFixed(3)} (from ${combinedRatioHistory.length} historical uses across ${profilePatterns.length} pattern${profilePatterns.length > 1 ? "s" : ""})`;
          } else {
            // ✅ FIXED: Try to use averageRatio from all patterns if ratioHistory is empty
            // This handles cases where pattern was created before ratioHistory was implemented
            const validRatios: number[] = [];

            for (const pattern of profilePatterns) {
              const avgRatio =
                typeof pattern.averageRatio === "number"
                  ? pattern.averageRatio
                  : 0;
              if (avgRatio > 0 && !isNaN(avgRatio) && avgRatio !== 1.0) {
                // Only use if not fallback value (1.0)
                validRatios.push(avgRatio);
              }
            }

            if (validRatios.length > 0) {
              // Use average of all valid averageRatio values
              combinedAverageRatio =
                validRatios.reduce((sum, r) => sum + r, 0) / validRatios.length;
              reasoning = `Ratio: ${combinedAverageRatio.toFixed(3)} (from ${validRatios.length} pattern averageRatio${validRatios.length > 1 ? "s" : ""}, no ratioHistory)`;
            } else {
              // ✅ FIXED: Calculate ratios from historical cutting lists
              // This gets real ratios from database when ratioHistory is empty
              const historicalRatios = await this.calculateRatiosFromHistory(
                productName,
                size,
                bestPattern.profile as string,
                bestPattern.measurement as string,
              );

              if (historicalRatios.length > 0) {
                // Use average of historical ratios
                const totalRatio = historicalRatios.reduce(
                  (sum, r) => sum + r.ratio,
                  0,
                );
                combinedAverageRatio = totalRatio / historicalRatios.length;
                reasoning = `Ratio: ${combinedAverageRatio.toFixed(3)} (calculated from ${historicalRatios.length} historical order${historicalRatios.length > 1 ? "s" : ""} in cutting lists)`;

                // ✅ BONUS: Update pattern with calculated ratioHistory for future use
                try {
                  const patternToUpdate = profilePatterns[0];
                  if (patternToUpdate.id) {
                    await this.patternRepo.update(
                      patternToUpdate.id as string,
                      {
                        averageRatio: combinedAverageRatio,
                        ratioHistory: historicalRatios,
                      },
                    );
                    logger.info(
                      "Updated pattern with calculated ratioHistory",
                      {
                        patternId: patternToUpdate.id,
                        ratioCount: historicalRatios.length,
                      },
                    );
                  }
                } catch (updateError) {
                  logger.warn("Failed to update pattern with ratioHistory", {
                    error: updateError,
                  });
                  // Non-critical, continue
                }
              } else {
                // Fallback: Try to calculate ratio from quantity/orderQuantity fields
                const calculatedRatios: number[] = [];

                for (const pattern of profilePatterns) {
                  const patternQuantity =
                    typeof pattern.quantity === "number" ? pattern.quantity : 0;
                  const patternOrderQuantity =
                    typeof pattern.orderQuantity === "number"
                      ? pattern.orderQuantity
                      : 0;

                  if (patternOrderQuantity > 0 && patternQuantity > 0) {
                    const calculatedRatio =
                      patternQuantity / patternOrderQuantity;
                    if (calculatedRatio > 0 && !isNaN(calculatedRatio)) {
                      calculatedRatios.push(calculatedRatio);
                    }
                  }
                }

                if (calculatedRatios.length > 0) {
                  // Use average of calculated ratios
                  combinedAverageRatio =
                    calculatedRatios.reduce((sum, r) => sum + r, 0) /
                    calculatedRatios.length;
                  reasoning = `Ratio: ${combinedAverageRatio.toFixed(3)} (calculated from ${calculatedRatios.length} pattern${calculatedRatios.length > 1 ? "s" : " quantity/orderQuantity fields"})`;
                } else {
                  // Last resort: Fallback ratio
                  combinedAverageRatio = 1.0;
                  reasoning = `Fallback ratio 1:1 (no historical ratio data available)`;
                }
              }
            }
          }

          if (isNaN(combinedAverageRatio) || combinedAverageRatio <= 0) {
            logger.warn("Invalid combined averageRatio", {
              profile: bestPattern.profile,
              measurement: bestPattern.measurement,
              combinedAverageRatio,
              ratioHistoryCount: combinedRatioHistory.length,
              patternCount: profilePatterns.length,
            });
            // Use fallback ratio of 1:1
            const fallbackRatio = 1.0;
            const predictedQuantity = Math.round(orderQuantity * fallbackRatio);

            return {
              profile:
                typeof bestPattern.profile === "string"
                  ? bestPattern.profile
                  : "Unknown",
              measurement:
                typeof bestPattern.measurement === "string"
                  ? bestPattern.measurement
                  : "Unknown",
              quantity: predictedQuantity,
              confidence:
                Math.round(
                  (typeof bestPattern.confidence === "number"
                    ? bestPattern.confidence
                    : 0) * 100,
                ) / 100,
              reasoning: `Fallback ratio 1:1 (invalid combined ratio: ${combinedAverageRatio})`,
            };
          }

          // Calculate quantity using combined average ratio
          const predictedQuantity = Math.round(
            orderQuantity * combinedAverageRatio,
          );

          // Calculate average confidence
          const avgConfidence =
            profilePatterns.length > 0
              ? totalConfidence / profilePatterns.length
              : typeof bestPattern.confidence === "number"
                ? bestPattern.confidence
                : 0;

          logger.info("Calculating quantity for pattern", {
            profile: bestPattern.profile,
            measurement: bestPattern.measurement,
            orderQuantity,
            combinedAverageRatio,
            predictedQuantity,
            ratioHistoryCount: combinedRatioHistory.length,
            patternCount: profilePatterns.length,
            ratioHistoryDetails: combinedRatioHistory.map((r) => ({
              orderQty: r.orderQty,
              profileQty: r.profileQty,
              ratio: r.ratio,
            })),
            allPatternRatios: profilePatterns.map((p) => ({
              profile: p.profile,
              measurement: p.measurement,
              averageRatio: p.averageRatio,
              frequency: p.frequency,
              ratioHistoryCount: Array.isArray(p.ratioHistory)
                ? (p.ratioHistory as unknown[]).length
                : 0,
            })),
          });

          return {
            profile:
              typeof bestPattern.profile === "string"
                ? bestPattern.profile
                : "Unknown",
            measurement:
              typeof bestPattern.measurement === "string"
                ? bestPattern.measurement
                : "Unknown",
            quantity: predictedQuantity,
            confidence: Math.round(avgConfidence * 100) / 100,
            reasoning,
          };
        }),
      );

      // ✅ FIXED: Sort by original creation order (stable sort)
      // Don't re-sort - keep the order from database (which is ordered by pattern creation)
      // This preserves the original input order from the first usage

      const avgConfidence =
        profiles.reduce((sum, p) => sum + p.confidence, 0) / profiles.length;

      logger.info("Smart suggestion applied", {
        productName,
        size,
        orderQuantity,
        requestedProfile: requestedProfile || "none",
        profileCount: profiles.length,
        totalConfidence: avgConfidence.toFixed(2),
      });

      return {
        profiles,
        totalConfidence: Math.round(avgConfidence * 100) / 100,
        reasoning: `Applied ${profiles.length} profiles based on ${patterns.length} historical patterns. Order quantity: ${orderQuantity}`,
      };
    } catch (error) {
      logger.error("Failed to apply smart suggestion", {
        error: error instanceof Error ? error.message : "Unknown error",
        productName,
        size,
        orderQuantity,
      });

      // ✅ FIXED: Return empty result instead of throwing
      return {
        profiles: [],
        totalConfidence: 0,
        reasoning: "Smart suggestion failed due to system error",
      };
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Sort suggestions by confidence first, then by frequency
   * Extracted to avoid code duplication
   */
  private sortSuggestions<T extends { confidence: number; frequency: number }>(
    suggestions: T[],
  ): T[] {
    return suggestions.sort((a, b) => {
      const confDiff = b.confidence - a.confidence;
      return confDiff !== 0 ? confDiff : b.frequency - a.frequency;
    });
  }

  // ==========================================================================
  // MAINTENANCE
  // ==========================================================================

  /**
   * Clean up old patterns
   */
  async cleanupOldPatterns(days: number = 180): Promise<number> {
    try {
      const deleted = await this.patternRepo.deleteOldPatterns(days);
      logger.info("Cleaned up old patterns", { deleted, days });
      return deleted;
    } catch (error) {
      logger.error("Failed to cleanup old patterns", { error, days });
      throw error;
    }
  }
}

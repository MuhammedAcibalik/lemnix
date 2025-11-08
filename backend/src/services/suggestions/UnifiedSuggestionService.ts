/**
 * @fileoverview Unified Suggestion Service
 * @module services/suggestions/UnifiedSuggestionService
 * @version 1.0.0
 * 
 * Merges EnterpriseProfileSuggestionService and SmartSuggestionService
 * Single source of truth for all smart suggestions
 * Uses PostgreSQL, ML-based scoring, and follows SOLID principles
 */

import { SuggestionPatternRepository } from '../../repositories/SuggestionPatternRepository';
import { ScoringService } from './ScoringService';
import { logger } from '../logger';
import { createContextKey, createPatternKey } from '../../utils/stringNormalizer';
import { cacheService } from '../cache/RedisCache';

// Use the repository's SuggestionPattern type
type SuggestionPattern = Record<string, unknown>;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SmartSuggestion {
  readonly type: 'product' | 'size' | 'profile' | 'combination';
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
    limit: number = 10
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
      for (const [productName, productPatterns] of Array.from(productMap.entries())) {
        const totalFrequency = productPatterns.reduce((sum, p) => sum + (p.frequency as number), 0);
        const avgConfidence = productPatterns.reduce((sum, p) => sum + (p.confidence as number), 0) / productPatterns.length;
        
        suggestions.push({
          type: 'product',
          value: productName,
          confidence: Math.round(avgConfidence * 100) / 100,
          frequency: totalFrequency,
          reasoning: `Used ${totalFrequency} times across ${productPatterns.length} patterns`,
          metadata: {
            patternCount: productPatterns.length,
            uniqueSizes: new Set(productPatterns.map(p => p.size as string)).size
          }
        });
      }

      // Sort by confidence and frequency
      suggestions.sort((a, b) => {
        const confDiff = b.confidence - a.confidence;
        return confDiff !== 0 ? confDiff : b.frequency - a.frequency;
      });

      return suggestions.slice(0, limit);
    } catch (error) {
      logger.error('Failed to get product suggestions', { error, query, limit });
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
    query: string = '',
    limit: number = 10
  ): Promise<SmartSuggestion[]> {
    try {
      // Get all sizes for this product
      const sizes = await this.patternRepo.getUniqueSizesForProduct(productName);
      
      // Filter by query if provided
      const filteredSizes = query 
        ? sizes.filter(size => size.toUpperCase().includes(query.toUpperCase()))
        : sizes;

      // Get patterns for each size to calculate confidence
      const suggestions: SmartSuggestion[] = [];
      
      for (const size of filteredSizes) {
        const patterns = await this.patternRepo.findByProductAndSize(productName, size);
        
        if (patterns.length > 0) {
          const totalFrequency = patterns.reduce((sum, p) => sum + (p.frequency as number), 0);
          const avgConfidence = patterns.reduce((sum, p) => sum + (p.confidence as number), 0) / patterns.length;
          
          suggestions.push({
            type: 'size',
            value: size,
            confidence: Math.round(avgConfidence * 100) / 100,
            frequency: totalFrequency,
            reasoning: `Used ${totalFrequency} times with ${productName}`,
            metadata: {
              patternCount: patterns.length,
              uniqueProfiles: new Set(patterns.map(p => p.profile as string)).size
            }
          });
        }
      }

      // Sort by confidence and frequency
      suggestions.sort((a, b) => {
        const confDiff = b.confidence - a.confidence;
        return confDiff !== 0 ? confDiff : b.frequency - a.frequency;
      });

      return suggestions.slice(0, limit);
    } catch (error) {
      logger.error('Failed to get size suggestions', { error, productName, query, limit });
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
    query: string = '',
    limit: number = 10
  ): Promise<ProfileSuggestion[]> {
    try {
      const patterns = await this.patternRepo.findByProductAndSize(productName, size);
      
      // Filter by query if provided
      const filteredPatterns = query
        ? patterns.filter(p => (p.profile as string).toUpperCase().includes(query.toUpperCase()))
        : patterns;

      // Get max frequency for scoring
      const maxFrequency = Math.max(...filteredPatterns.map(p => p.frequency as number), 1);

      const suggestions: ProfileSuggestion[] = [];

      for (const pattern of filteredPatterns.slice(0, limit)) {
        // Calculate detailed confidence
        const confidenceScore = this.scoringService.calculateConfidenceScore(
          {
            frequency: pattern.frequency as number,
            lastUsed: pattern.lastUsed as Date,
            contexts: pattern.contexts as string[],
            averageQuantity: pattern.averageQuantity as number,
            variations: pattern.variations as string[]
          },
          {
            productName,
            size
          },
          maxFrequency
        );

        // Predict quantity
        const quantityPrediction = this.scoringService.predictQuantity(
          {
            frequency: pattern.frequency as number,
            lastUsed: pattern.lastUsed as Date,
            contexts: pattern.contexts as string[],
            averageQuantity: pattern.averageQuantity as number,
            variations: pattern.variations as string[]
          },
          0, // No order quantity context yet
          confidenceScore.total
        );

        // Find alternatives (similar profiles)
        const alternatives: AlternativeSuggestion[] = [];
        for (const altPattern of filteredPatterns) {
          if (altPattern.id !== pattern.id && alternatives.length < 3) {
            const similarity = this.scoringService.calculateStringSimilarity(
              pattern.profile as string,
              altPattern.profile as string
            );
            
            if (similarity > 0.5) {
              alternatives.push({
                profile: altPattern.profile as string,
                measurement: altPattern.measurement as string,
                quantity: Math.round(altPattern.averageQuantity as number),
                confidence: Math.round((altPattern.confidence as number) * 100) / 100,
                reason: `Similar to ${pattern.profile} (${Math.round(similarity * 100)}% match)`
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
          alternatives
        });
      }

      return suggestions;
    } catch (error) {
      logger.error('Failed to get profile suggestions', { error, productName, size, query, limit });
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
    limit: number = 5
  ): Promise<CombinationSuggestion[]> {
    try {
      const patterns = await this.patternRepo.findByProductAndSize(productName, size);
      
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
          const avgConfidence = patterns.reduce((sum, p) => sum + (p.confidence as number), 0) / patterns.length;
          const totalFrequency = patterns.reduce((sum, p) => sum + (p.frequency as number), 0);
          return { profile, patterns, avgConfidence, totalFrequency };
        })
        .sort((a, b) => b.avgConfidence - a.avgConfidence)
        .slice(0, Math.min(5, limit * 2));

      // Create combination
      const profiles = topProfiles.map(({ profile, patterns, avgConfidence }) => {
        const mostCommon = patterns.sort((a, b) => (b.frequency as number) - (a.frequency as number))[0];
        const totalQuantity = patterns.reduce((sum, p) => sum + ((p.quantity as number) * (p.frequency as number)), 0);
        const totalFrequency = patterns.reduce((sum, p) => sum + (p.frequency as number), 0);
        
        return {
          profile,
          measurement: mostCommon.measurement as string,
          ratio: mostCommon.averageQuantity as number,
          confidence: Math.round(avgConfidence * 100) / 100
        };
      });

      const totalConfidence = profiles.reduce((sum, p) => sum + p.confidence, 0) / profiles.length;

      suggestions.push({
        productName,
        size,
        profiles,
        totalConfidence: Math.round(totalConfidence * 100) / 100,
        reasoning: `Based on ${patterns.length} historical patterns with average confidence ${totalConfidence.toFixed(1)}%`
      });

      return suggestions.slice(0, limit);
    } catch (error) {
      logger.error('Failed to get combination suggestions', { error, productName, size, limit });
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
        recentActivity: recentPatterns.length
      };
    } catch (error) {
      logger.error('Failed to get statistics', { error });
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
        logger.warn('Invalid productName for pattern learning', { patternData });
        return;
      }
      if (!patternData.size?.trim()) {
        logger.warn('Invalid size for pattern learning', { patternData });
        return;
      }
      if (!patternData.profile?.trim()) {
        logger.warn('Invalid profile for pattern learning', { patternData });
        return;
      }
      if (!patternData.measurement?.trim()) {
        logger.warn('Invalid measurement for pattern learning', { patternData });
        return;
      }
      if (patternData.quantity <= 0) {
        logger.warn('Invalid quantity for pattern learning', { patternData });
        return;
      }
      if (patternData.orderQuantity <= 0) {
        logger.warn('Invalid orderQuantity for pattern learning', { patternData });
        return;
      }
      // ✅ USE NORMALIZER: Consistent with findByProductAndSize
      const contextKey = createContextKey(patternData.productName, patternData.size);
      const patternKey = createPatternKey(
        patternData.productName,
        patternData.size,
        patternData.profile,
        patternData.measurement
      );
      
      logger.info('Learning from pattern', {
        productName: patternData.productName,
        size: patternData.size,
        normalizedContextKey: contextKey,
        normalizedPatternKey: patternKey
      });
      
      // Check if pattern already exists
      const existing = await this.patternRepo.findByPatternKey(patternKey);
      
      if (existing) {
        // Update existing pattern - increment frequency and update ratios
        const newFrequency = (existing.frequency as number) + 1;
        
        // ✅ FIXED: Division by zero protection
        if (patternData.orderQuantity <= 0) {
          logger.warn('Invalid orderQuantity for pattern learning', {
            orderQuantity: patternData.orderQuantity,
            quantity: patternData.quantity,
            productName: patternData.productName
          });
          return; // Skip learning this invalid pattern
        }
        
        const newRatio = patternData.quantity / patternData.orderQuantity;
        
        // Update ratio history
        const ratioHistory = (existing.ratioHistory as unknown as Array<{
          orderQty: number;
          profileQty: number;
          ratio: number;
        }>) || [];
        ratioHistory.push({
          orderQty: patternData.orderQuantity,
          profileQty: patternData.quantity,
          ratio: newRatio
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
          ratioHistory
          // ❌ REMOVED: orderQuantity, ratio - Don't override historical values
        });
        
        // ✅ FIXED: Cache invalidation after pattern update
        try {
          await cacheService.invalidateByTag('suggestion-patterns');
          logger.debug('Cache invalidated after pattern update', { patternId: existing.id });
        } catch (cacheError) {
          logger.warn('Cache invalidation failed (non-critical)', { cacheError });
        }
        
        logger.info('Updated existing pattern', {
          patternKey,
          newFrequency,
          newRatio,
          averageRatio
        });
      } else {
        // Create new pattern
        const ratio = patternData.quantity / patternData.orderQuantity;
        const ratioHistory = [{
          orderQty: patternData.orderQuantity,
          profileQty: patternData.quantity,
          ratio
        }];
        
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
            originalIndex: patternData.originalIndex ?? 0  // ✅ Preserve input order
          }
        });
        
        logger.info('Created new pattern', {
          patternKey,
          ratio,
          productName: patternData.productName,
          size: patternData.size
        });
      }
      
    } catch (error) {
      logger.error('Failed to learn from pattern', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        patternData: {
          productName: patternData.productName,
          size: patternData.size,
          profile: patternData.profile,
          measurement: patternData.measurement,
          quantity: patternData.quantity,
          orderQuantity: patternData.orderQuantity
        }
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
   * Apply smart suggestion - returns complete profiles with calculated quantities
   * This is the ONE-CLICK magic: user enters orderQuantity, we calculate all profile quantities
   */
  async applySmartSuggestion(
    productName: string,
    size: string,
    orderQuantity: number
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
      const patterns = await this.patternRepo.findByProductAndSize(productName, size);
      
      if (patterns.length === 0) {
        logger.warn('No patterns found for smart suggestion', { productName, size });
        return {
          profiles: [],
          totalConfidence: 0,
          reasoning: 'No historical data found for this product-size combination'
        };
      }

      // ✅ FIXED: Keep original order from database (createdAt ASC)
      // Use array instead of Map to preserve insertion order
      const seenKeys = new Set<string>();
      const uniquePatterns: Array<{ key: string; patterns: SuggestionPattern[] }> = [];
      
      for (const pattern of patterns) {
        const key = `${pattern.profile as string}|${pattern.measurement as string}`;
        
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          // Get all patterns with same key
          const matchingPatterns = patterns.filter(p => 
            `${p.profile as string}|${p.measurement as string}` === key
          );
          uniquePatterns.push({ key, patterns: matchingPatterns });
        }
      }

      // Calculate quantities for each profile+measurement using ratio
      const profiles = uniquePatterns.map(({ key, patterns: profilePatterns }) => {
        // ✅ FIXED: Type-safe pattern sorting with validation
        const bestPattern = profilePatterns.sort((a, b) => {
          const aConfidence = typeof a.confidence === 'number' ? a.confidence : 0;
          const bConfidence = typeof b.confidence === 'number' ? b.confidence : 0;
          const aFrequency = typeof a.frequency === 'number' ? a.frequency : 0;
          const bFrequency = typeof b.frequency === 'number' ? b.frequency : 0;
          
          const confDiff = bConfidence - aConfidence;
          if (confDiff !== 0) return confDiff;
          return bFrequency - aFrequency;
        })[0];
        
        // ✅ FIXED: Type-safe ratio calculation with validation
        const averageRatio = typeof bestPattern.averageRatio === 'number' ? bestPattern.averageRatio : 0;
        if (isNaN(averageRatio) || averageRatio <= 0) {
          logger.warn('Invalid averageRatio for pattern', {
            profile: bestPattern.profile,
            measurement: bestPattern.measurement,
            averageRatio,
            patternId: bestPattern.id
          });
          // Use fallback ratio of 1:1
          const fallbackRatio = 1.0;
          const predictedQuantity = Math.round(orderQuantity * fallbackRatio);
          
          return {
            profile: typeof bestPattern.profile === 'string' ? bestPattern.profile : 'Unknown',
            measurement: typeof bestPattern.measurement === 'string' ? bestPattern.measurement : 'Unknown',
            quantity: predictedQuantity,
            confidence: Math.round((typeof bestPattern.confidence === 'number' ? bestPattern.confidence : 0) * 100) / 100,
            reasoning: `Fallback ratio 1:1 (invalid historical ratio: ${averageRatio})`
          };
        }
        
        // Calculate quantity using historical ratio
        const predictedQuantity = Math.round(orderQuantity * averageRatio);
        
        logger.info('Calculating quantity for pattern', {
          profile: bestPattern.profile,
          measurement: bestPattern.measurement,
          orderQuantity,
          averageRatio: bestPattern.averageRatio,
          predictedQuantity
        });
        
        return {
          profile: typeof bestPattern.profile === 'string' ? bestPattern.profile : 'Unknown',
          measurement: typeof bestPattern.measurement === 'string' ? bestPattern.measurement : 'Unknown',
          quantity: predictedQuantity,
          confidence: Math.round((typeof bestPattern.confidence === 'number' ? bestPattern.confidence : 0) * 100) / 100,
          reasoning: `Ratio: ${averageRatio.toFixed(2)} (from ${typeof bestPattern.frequency === 'number' ? bestPattern.frequency : 0} historical uses)`
        };
      });

      // ✅ FIXED: Sort by original creation order (stable sort)
      // Don't re-sort - keep the order from database (which is ordered by pattern creation)
      // This preserves the original input order from the first usage

      const avgConfidence = profiles.reduce((sum, p) => sum + p.confidence, 0) / profiles.length;

      logger.info('Smart suggestion applied', {
        productName,
        size,
        orderQuantity,
        profileCount: profiles.length,
        totalConfidence: avgConfidence.toFixed(2)
      });

      return {
        profiles,
        totalConfidence: Math.round(avgConfidence * 100) / 100,
        reasoning: `Applied ${profiles.length} profiles based on ${patterns.length} historical patterns. Order quantity: ${orderQuantity}`
      };
    } catch (error) {
      logger.error('Failed to apply smart suggestion', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        productName, 
        size, 
        orderQuantity 
      });
      
      // ✅ FIXED: Return empty result instead of throwing
      return {
        profiles: [],
        totalConfidence: 0,
        reasoning: 'Smart suggestion failed due to system error'
      };
    }
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
      logger.info('Cleaned up old patterns', { deleted, days });
      return deleted;
    } catch (error) {
      logger.error('Failed to cleanup old patterns', { error, days });
      throw error;
    }
  }
}


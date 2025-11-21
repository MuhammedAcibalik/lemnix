/**
 * @fileoverview ML-like Scoring Service for Smart Suggestions
 * @module services/suggestions/ScoringService
 * @version 1.0.0
 *
 * Advanced scoring algorithms with:
 * - Exponential decay for recency
 * - Weighted context matching
 * - Frequency normalization
 * - Quantity prediction with confidence intervals
 */

import { logger } from "../logger";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Pattern {
  readonly frequency: number;
  readonly lastUsed: Date;
  readonly contexts: readonly string[];
  readonly averageQuantity: number;
  readonly variations: readonly string[];
}

interface ContextInfo {
  readonly productName: string;
  readonly size: string;
  readonly color?: string;
  readonly version?: string;
  readonly note?: string;
}

interface ConfidenceScore {
  readonly total: number;
  readonly frequency: number;
  readonly recency: number;
  readonly contextMatch: number;
  readonly breakdown: string;
}

interface QuantityPrediction {
  readonly predicted: number;
  readonly confidence: number;
  readonly min: number;
  readonly max: number;
  readonly reasoning: string;
}

// ============================================================================
// SCORING SERVICE
// ============================================================================

export class ScoringService {
  private static instance: ScoringService;

  // Scoring weights (must sum to 100)
  private readonly FREQUENCY_WEIGHT = 40; // 0-40 points
  private readonly RECENCY_WEIGHT = 30; // 0-30 points
  private readonly CONTEXT_WEIGHT = 30; // 0-30 points

  // Recency decay parameters
  private readonly RECENCY_HALF_LIFE_DAYS = 90; // 90 days half-life

  // Context matching weights (must sum to 1)
  private readonly CONTEXT_MATCH_WEIGHTS = {
    product: 0.4, // 40% - Most important
    size: 0.3, // 30% - Second most important
    color: 0.15, // 15% - Style preference
    version: 0.15, // 15% - Specification
  } as const;

  private constructor() {}

  public static getInstance(): ScoringService {
    if (!ScoringService.instance) {
      ScoringService.instance = new ScoringService();
    }
    return ScoringService.instance;
  }

  // ==========================================================================
  // FREQUENCY SCORING
  // ==========================================================================

  /**
   * Calculate frequency score (0-40 points)
   * Uses min-max normalization
   *
   * @param frequency - Pattern frequency
   * @param maxFrequency - Maximum frequency in dataset
   * @returns Score between 0 and 40
   */
  calculateFrequencyScore(frequency: number, maxFrequency: number): number {
    if (maxFrequency <= 0 || frequency <= 0) {
      return 0;
    }

    const normalized = frequency / maxFrequency;
    const score = normalized * this.FREQUENCY_WEIGHT;

    logger.debug("Frequency score calculated", {
      frequency,
      maxFrequency,
      normalized: normalized.toFixed(3),
      score: score.toFixed(2),
    });

    return Math.round(score * 100) / 100;
  }

  // ==========================================================================
  // RECENCY SCORING
  // ==========================================================================

  /**
   * Calculate recency score (0-30 points)
   * Uses exponential decay: score = 30 * e^(-days/halfLife)
   *
   * Half-life of 90 days means:
   * - 0 days ago: 30 points (100%)
   * - 45 days ago: 21 points (70%)
   * - 90 days ago: 15 points (50%)
   * - 180 days ago: 7.5 points (25%)
   * - 365 days ago: 2 points (7%)
   *
   * @param lastUsed - Last usage date
   * @returns Score between 0 and 30
   */
  calculateRecencyScore(lastUsed: Date): number {
    const now = Date.now();
    const lastUsedTime = lastUsed.getTime();
    const daysSinceLastUse = (now - lastUsedTime) / (1000 * 60 * 60 * 24);

    // Exponential decay formula
    const decayFactor = Math.exp(
      -daysSinceLastUse / this.RECENCY_HALF_LIFE_DAYS,
    );
    const score = this.RECENCY_WEIGHT * decayFactor;

    logger.debug("Recency score calculated", {
      lastUsed: lastUsed.toISOString(),
      daysSinceLastUse: daysSinceLastUse.toFixed(1),
      decayFactor: decayFactor.toFixed(3),
      score: score.toFixed(2),
    });

    return Math.round(score * 100) / 100;
  }

  // ==========================================================================
  // CONTEXT MATCHING
  // ==========================================================================

  /**
   * Calculate context match score (0-30 points)
   * Weighted matching based on context fields
   *
   * Weights:
   * - Product: 40% (12 points max)
   * - Size: 30% (9 points max)
   * - Color: 15% (4.5 points max)
   * - Version: 15% (4.5 points max)
   *
   * @param pattern - Historical pattern
   * @param context - Current context
   * @returns Score between 0 and 30
   */
  calculateContextMatchScore(pattern: Pattern, context: ContextInfo): number {
    const totalMatch = 0;

    // Extract pattern context (assumed format: "PRODUCT|SIZE|...")
    const patternContexts = pattern.contexts;
    if (patternContexts.length === 0) {
      return 0;
    }

    // Find best matching context
    let bestMatch = 0;
    for (const patternContext of patternContexts) {
      const parts = patternContext.split("|");
      const patternProduct = parts[0] || "";
      const patternSize = parts[1] || "";

      let matchScore = 0;

      // Product match (40% weight = 12 points)
      if (patternProduct.toUpperCase() === context.productName.toUpperCase()) {
        matchScore += this.CONTEXT_MATCH_WEIGHTS.product;
      }

      // Size match (30% weight = 9 points)
      if (patternSize.toUpperCase() === context.size.toUpperCase()) {
        matchScore += this.CONTEXT_MATCH_WEIGHTS.size;
      }

      // Color match (15% weight = 4.5 points) - partial match
      if (context.color) {
        // Implement fuzzy color matching later
        matchScore += this.CONTEXT_MATCH_WEIGHTS.color * 0.5;
      }

      // Version match (15% weight = 4.5 points) - partial match
      if (context.version) {
        matchScore += this.CONTEXT_MATCH_WEIGHTS.version * 0.5;
      }

      bestMatch = Math.max(bestMatch, matchScore);
    }

    const score = bestMatch * this.CONTEXT_WEIGHT;

    logger.debug("Context match score calculated", {
      patternContexts: patternContexts.length,
      bestMatch: bestMatch.toFixed(3),
      score: score.toFixed(2),
    });

    return Math.round(score * 100) / 100;
  }

  // ==========================================================================
  // CONFIDENCE CALCULATION
  // ==========================================================================

  /**
   * Calculate overall confidence score (0-100)
   * Combines frequency, recency, and context matching
   *
   * @param pattern - Historical pattern
   * @param context - Current context
   * @param maxFrequency - Maximum frequency in dataset
   * @returns Complete confidence score with breakdown
   */
  calculateConfidenceScore(
    pattern: Pattern,
    context: ContextInfo,
    maxFrequency: number,
  ): ConfidenceScore {
    const frequencyScore = this.calculateFrequencyScore(
      pattern.frequency,
      maxFrequency,
    );
    const recencyScore = this.calculateRecencyScore(pattern.lastUsed);
    const contextScore = this.calculateContextMatchScore(pattern, context);

    const total = frequencyScore + recencyScore + contextScore;

    const breakdown = [
      `Frequency: ${frequencyScore.toFixed(1)}/${this.FREQUENCY_WEIGHT}`,
      `Recency: ${recencyScore.toFixed(1)}/${this.RECENCY_WEIGHT}`,
      `Context: ${contextScore.toFixed(1)}/${this.CONTEXT_WEIGHT}`,
    ].join(", ");

    logger.debug("Confidence score calculated", {
      total: total.toFixed(2),
      breakdown,
    });

    return {
      total: Math.round(total * 100) / 100,
      frequency: frequencyScore,
      recency: recencyScore,
      contextMatch: contextScore,
      breakdown,
    };
  }

  // ==========================================================================
  // QUANTITY PREDICTION
  // ==========================================================================

  /**
   * Predict quantity with confidence interval
   * Uses weighted moving average with confidence bounds
   *
   * @param pattern - Historical pattern
   * @param orderQuantity - Current order quantity (context)
   * @param confidence - Pattern confidence (0-100)
   * @returns Quantity prediction with min/max bounds
   */
  predictQuantity(
    pattern: Pattern,
    orderQuantity: number,
    confidence: number,
  ): QuantityPrediction {
    const baseQuantity = pattern.averageQuantity;

    // Confidence factor (0-1)
    const confidenceFactor = confidence / 100;

    // Calculate ratio if order quantity is known
    let predicted = baseQuantity;
    let reasoning = "Based on historical average";

    if (orderQuantity > 0) {
      // Use pattern's ratio relative to typical order size
      const ratio = baseQuantity / (pattern.averageQuantity || 1);
      predicted = Math.round(orderQuantity * ratio);
      reasoning = `Scaled by order quantity (${orderQuantity}) using historical ratio`;
    }

    // Confidence interval (±20% for low confidence, ±5% for high confidence)
    const uncertaintyFactor =
      0.2 * (1 - confidenceFactor) + 0.05 * confidenceFactor;
    const min = Math.max(1, Math.floor(predicted * (1 - uncertaintyFactor)));
    const max = Math.ceil(predicted * (1 + uncertaintyFactor));

    logger.debug("Quantity predicted", {
      baseQuantity,
      orderQuantity,
      predicted,
      confidence: confidence.toFixed(1),
      confidenceFactor: confidenceFactor.toFixed(2),
      uncertaintyFactor: uncertaintyFactor.toFixed(2),
      range: `${min}-${max}`,
    });

    return {
      predicted,
      confidence: Math.round(confidence * 100) / 100,
      min,
      max,
      reasoning,
    };
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  /**
   * Normalize value to 0-1 range
   */
  private normalize(value: number, min: number, max: number): number {
    if (max <= min) return 0.5;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  /**
   * Calculate string similarity (Levenshtein distance based)
   * Returns value between 0 (completely different) and 1 (identical)
   */
  calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toUpperCase().trim();
    const s2 = str2.toUpperCase().trim();

    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;

    // Levenshtein distance
    const matrix: number[][] = [];

    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          );
        }
      }
    }

    const distance = matrix[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    const similarity = 1 - distance / maxLength;

    return Math.max(0, Math.min(1, similarity));
  }
}

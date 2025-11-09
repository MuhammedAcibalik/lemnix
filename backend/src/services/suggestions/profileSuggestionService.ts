/**
 * @fileoverview Profile Suggestion Service
 * @module ProfileSuggestionService
 * @version 1.0.0
 */

import type {
  ProfileItem,
  CuttingListItem,
  ProductSection,
  CuttingList,
} from "./types/commonTypes";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ProfileSuggestion {
  readonly profile: string;
  readonly measurement: string;
  readonly frequency: number;
  readonly confidence: number;
}

interface ProfileVariation {
  id: string;
  name: string;
  profiles: Array<{
    profile: string;
    measurement: string;
    quantity: number;
    frequency: number;
    confidence: number;
  }>;
  totalFrequency: number;
  confidence: number;
  description: string;
  workOrderIds?: string[];
}

interface ProductSizeSuggestion {
  readonly productName: string;
  readonly size: string;
  readonly suggestions: ReadonlyArray<ProfileSuggestion>;
  readonly totalOccurrences: number;
}

// ============================================================================
// PROFILE SUGGESTION SERVICE
// ============================================================================

export class ProfileSuggestionService {
  private profileDatabase: Map<string, Map<string, Map<string, number>>> =
    new Map();
  private productSizeDatabase: Map<string, number> = new Map();
  private analyzedData: ReadonlyArray<CuttingList> = [];

  /**
   * Analyze cutting lists and build suggestion database
   */
  public analyzeCuttingLists(cuttingLists: ReadonlyArray<CuttingList>): void {
    console.log("[PROFILE-SUGGESTION] Starting analysis of cutting lists...");

    // Reset databases and store data for variations
    this.profileDatabase.clear();
    this.productSizeDatabase.clear();
    this.analyzedData = cuttingLists;

    let totalItems = 0;
    let totalProfiles = 0;

    // Process each cutting list
    for (const cuttingList of cuttingLists) {
      for (const section of cuttingList.sections) {
        for (const item of section.items) {
          totalItems++;

          // Create product-size key
          const productSizeKey = this.createProductSizeKey(
            section.productName,
            item.size,
          );

          // Update product-size frequency
          const currentFrequency =
            this.productSizeDatabase.get(productSizeKey) || 0;
          this.productSizeDatabase.set(productSizeKey, currentFrequency + 1);

          // Process each profile
          for (const profile of item.profiles) {
            totalProfiles++;

            // Create profile key
            const profileKey = profile.profile || "GENEL";

            // Get or create product-size profile map
            if (!this.profileDatabase.has(productSizeKey)) {
              this.profileDatabase.set(productSizeKey, new Map());
            }

            const profileMap = this.profileDatabase.get(productSizeKey)!;

            // Get or create measurement map
            if (!profileMap.has(profileKey)) {
              profileMap.set(profileKey, new Map());
            }

            const measurementMap = profileMap.get(profileKey)!;

            // Update measurement frequency
            const currentCount = measurementMap.get(profile.measurement) || 0;
            measurementMap.set(profile.measurement, currentCount + 1);
          }
        }
      }
    }

    console.log(
      `[PROFILE-SUGGESTION] Analysis completed: ${totalItems} items, ${totalProfiles} profiles analyzed`,
    );
    console.log(
      `[PROFILE-SUGGESTION] Database contains ${this.profileDatabase.size} product-size combinations`,
    );
  }

  /**
   * Get profile variations for a product and size (grouped by work order patterns)
   */
  public getProfileVariations(
    productName: string,
    size: string,
  ): ReadonlyArray<ProfileVariation> {
    // Get all items for this product-size combination from cutting lists
    const workOrderPatterns = new Map<string, ProfileVariation>();

    for (const cuttingList of this.analyzedData) {
      for (const section of cuttingList.sections) {
        if (section.productName.toUpperCase() !== productName.toUpperCase())
          continue;

        for (const item of section.items) {
          if (item.size.toUpperCase() !== size.toUpperCase()) continue;

          // Create a signature for this profile combination
          const profileSignature = item.profiles
            .map(
              (p) => `${p.profile || "GENEL"}:${p.measurement}:${p.quantity}`,
            )
            .sort()
            .join("|");

          if (!workOrderPatterns.has(profileSignature)) {
            // Calculate frequency and confidence
            const frequency = 1;
            const confidence = 75; // Base confidence

            workOrderPatterns.set(profileSignature, {
              id: `var-${workOrderPatterns.size + 1}`,
              name: `Varyasyon ${workOrderPatterns.size + 1}`,
              profiles: item.profiles.map((p) => ({
                profile: p.profile || "GENEL",
                measurement: p.measurement,
                quantity: p.quantity,
                frequency: frequency,
                confidence: confidence,
              })),
              totalFrequency: frequency,
              confidence: confidence,
              description: `${item.profiles.length} profilli kombinasyon - İş Emri: ${item.workOrderId}`,
              workOrderIds: [item.workOrderId],
            });
          } else {
            // Increase frequency for existing pattern
            const existing = workOrderPatterns.get(profileSignature)!;
            existing.totalFrequency++;
            existing.confidence = Math.min(95, existing.confidence + 5);
            existing.workOrderIds?.push(item.workOrderId);
            existing.description = `${existing.profiles.length} profilli kombinasyon - ${existing.totalFrequency} kez kullanıldı`;
          }
        }
      }
    }

    // Convert to array and sort by frequency
    const sortedVariations = Array.from(workOrderPatterns.values())
      .sort((a, b) => b.totalFrequency - a.totalFrequency)
      .slice(0, 8); // Max 8 variation

    return sortedVariations;
  }

  /**
   * Get profile suggestions for a product and size
   */
  public getProfileSuggestions(
    productName: string,
    size: string,
    limit: number = 15,
  ): ReadonlyArray<ProfileSuggestion> {
    const productSizeKey = this.createProductSizeKey(productName, size);
    const suggestions: ProfileSuggestion[] = [];

    // Get profile map for this product-size combination
    const profileMap = this.profileDatabase.get(productSizeKey);
    if (!profileMap) {
      console.log(`[PROFILE-SUGGESTION] No data found for: ${productSizeKey}`);
      return suggestions;
    }

    // Calculate total occurrences for this product-size
    const totalOccurrences = this.productSizeDatabase.get(productSizeKey) || 0;

    // Process each profile type
    for (const [profileName, measurementMap] of profileMap.entries()) {
      for (const [measurement, frequency] of measurementMap.entries()) {
        // Calculate confidence based on frequency and total occurrences
        const confidence =
          totalOccurrences > 0 ? (frequency / totalOccurrences) * 100 : 0;

        suggestions.push({
          profile: profileName === "GENEL" ? "" : profileName,
          measurement,
          frequency,
          confidence: Math.round(confidence * 100) / 100,
        });
      }
    }

    // Sort by frequency (descending) and then by confidence (descending)
    suggestions.sort((a, b) => {
      if (b.frequency !== a.frequency) {
        return b.frequency - a.frequency;
      }
      return b.confidence - a.confidence;
    });

    // Return top suggestions
    return suggestions.slice(0, limit);
  }

  /**
   * Get all product-size combinations with their suggestion counts
   */
  public getAllProductSizeSuggestions(): ReadonlyArray<ProductSizeSuggestion> {
    const suggestions: ProductSizeSuggestion[] = [];

    for (const [
      productSizeKey,
      totalOccurrences,
    ] of this.productSizeDatabase.entries()) {
      const [productName, size] = this.parseProductSizeKey(productSizeKey);
      const profileSuggestions = this.getProfileSuggestions(
        productName,
        size,
        10,
      );

      suggestions.push({
        productName,
        size,
        suggestions: profileSuggestions,
        totalOccurrences,
      });
    }

    // Sort by total occurrences (descending)
    suggestions.sort((a, b) => b.totalOccurrences - a.totalOccurrences);

    return suggestions;
  }

  /**
   * Search for similar product names (fuzzy matching)
   */
  public searchSimilarProducts(searchTerm: string): ReadonlyArray<string> {
    const similarProducts = new Set<string>();
    const searchLower = searchTerm.toLowerCase();

    for (const productSizeKey of this.productSizeDatabase.keys()) {
      if (!productSizeKey) continue;
      const [productName] = this.parseProductSizeKey(productSizeKey);

      // Check if product name contains search term
      if (productName.toLowerCase().includes(searchLower)) {
        similarProducts.add(productName);
      }
    }

    return Array.from(similarProducts).sort();
  }

  /**
   * Get all sizes for a specific product
   */
  public getSizesForProduct(productName: string): ReadonlyArray<string> {
    const sizes = new Set<string>();

    for (const productSizeKey of this.productSizeDatabase.keys()) {
      if (!productSizeKey) continue;
      const [keyProductName, size] = this.parseProductSizeKey(productSizeKey);

      if (keyProductName.toLowerCase() === productName.toLowerCase()) {
        sizes.add(size);
      }
    }

    return Array.from(sizes).sort();
  }

  /**
   * Get database statistics
   */
  public getDatabaseStats(): {
    totalProductSizeCombinations: number;
    totalProfiles: number;
    mostCommonProduct: string;
    mostCommonSize: string;
  } {
    let totalProfiles = 0;
    const productCounts = new Map<string, number>();
    const sizeCounts = new Map<string, number>();

    for (const [
      productSizeKey,
      frequency,
    ] of this.productSizeDatabase.entries()) {
      const [productName, size] = this.parseProductSizeKey(productSizeKey);

      // Count products
      const currentProductCount = productCounts.get(productName) || 0;
      productCounts.set(productName, currentProductCount + frequency);

      // Count sizes
      const currentSizeCount = sizeCounts.get(size) || 0;
      sizeCounts.set(size, currentSizeCount + frequency);

      // Count total profiles
      const profileMap = this.profileDatabase.get(productSizeKey);
      if (profileMap) {
        for (const measurementMap of profileMap.values()) {
          for (const profileCount of measurementMap.values()) {
            totalProfiles += profileCount;
          }
        }
      }
    }

    // Find most common product and size
    let mostCommonProduct = "";
    let maxProductCount = 0;
    for (const [product, count] of productCounts.entries()) {
      if (count > maxProductCount) {
        maxProductCount = count;
        mostCommonProduct = product;
      }
    }

    let mostCommonSize = "";
    let maxSizeCount = 0;
    for (const [size, count] of sizeCounts.entries()) {
      if (count > maxSizeCount) {
        maxSizeCount = count;
        mostCommonSize = size;
      }
    }

    return {
      totalProductSizeCombinations: this.productSizeDatabase.size,
      totalProfiles,
      mostCommonProduct,
      mostCommonSize,
    };
  }

  /**
   * Create product-size key for consistent lookup
   */
  private createProductSizeKey(productName: string, size: string): string {
    return `${productName.trim().toLowerCase()}|${size.trim().toLowerCase()}`;
  }

  /**
   * Parse product-size key back to product name and size
   */
  private parseProductSizeKey(key: string): [string, string] {
    const parts = key.split("|");
    if (parts.length === 2) {
      return [parts[0] || "", parts[1] || ""];
    }
    return ["", ""];
  }

  /**
   * Clear all data (for testing or reset)
   */
  public clearDatabase(): void {
    this.profileDatabase.clear();
    this.productSizeDatabase.clear();
    console.log("[PROFILE-SUGGESTION] Database cleared");
  }
}

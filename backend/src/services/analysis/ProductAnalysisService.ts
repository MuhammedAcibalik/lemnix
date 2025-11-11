/**
 * @fileoverview Product Analysis Service
 * @module ProductAnalysisService
 * @version 1.0.0
 * @description Analyzes product data to provide sizes and profile combinations
 */

interface ProfileItem {
  readonly id: string;
  readonly profile?: string;
  readonly measurement: string;
  readonly quantity: number;
}

interface CuttingListItem {
  readonly id: string;
  readonly workOrderId: string;
  readonly date: string;
  readonly version: string;
  readonly color: string;
  readonly note?: string;
  readonly orderQuantity: number;
  readonly size: string;
  readonly profiles: ReadonlyArray<ProfileItem>;
  readonly status?: "draft" | "ready" | "processing" | "completed";
  readonly priority?: "low" | "medium" | "high" | "urgent";
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

interface ProductSection {
  readonly id: string;
  readonly productName: string;
  readonly items: ReadonlyArray<CuttingListItem>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface CuttingList {
  readonly id: string;
  readonly title: string;
  readonly weekNumber: number;
  readonly sections: ReadonlyArray<ProductSection>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface ProfileCombination {
  readonly id: string;
  readonly profiles: ReadonlyArray<{
    readonly profile: string;
    readonly measurement: string;
    readonly ratio: number;
  }>;
  readonly usageCount: number;
  readonly lastUsed: string;
}

/**
 * Service for analyzing product data
 * Follows Single Responsibility Principle (SRP)
 */
export class ProductAnalysisService {
  /**
   * Get available sizes for a product
   */
  public getAvailableSizes(
    productName: string,
    cuttingLists: ReadonlyArray<CuttingList>,
  ): string[] {
    const sizes = new Set<string>();

    cuttingLists.forEach((cuttingList) => {
      cuttingList.sections.forEach((section) => {
        if (
          section.productName.toLowerCase().includes(productName.toLowerCase())
        ) {
          section.items.forEach((item) => {
            if (item.size && item.size.trim()) {
              sizes.add(item.size.trim());
            }
          });
        }
      });
    });

    return Array.from(sizes).sort();
  }

  /**
   * Get profile combinations for a product and size
   */
  public getProfileCombinations(
    productName: string,
    size: string,
    cuttingLists: ReadonlyArray<CuttingList>,
  ): ProfileCombination[] {
    const matchingItems: CuttingListItem[] = [];

    // Find matching items
    cuttingLists.forEach((cuttingList) => {
      cuttingList.sections.forEach((section) => {
        if (
          section.productName.toLowerCase().includes(productName.toLowerCase())
        ) {
          section.items.forEach((item) => {
            if (
              item.size &&
              item.size.toLowerCase() === size.toLowerCase() &&
              item.profiles.length > 0
            ) {
              matchingItems.push(item);
            }
          });
        }
      });
    });

    // Build profile combinations
    const combinationMap = new Map<string, ProfileCombination>();

    matchingItems.forEach((item) => {
      // Create a unique key for this profile combination
      const profileKey = item.profiles
        .map((p) => `${p.profile}-${p.measurement}`)
        .sort()
        .join("|");

      if (!combinationMap.has(profileKey)) {
        const profiles = item.profiles.map((profile) => ({
          profile: profile.profile || "Unknown",
          measurement: profile.measurement,
          ratio:
            item.orderQuantity > 0 ? profile.quantity / item.orderQuantity : 0,
        }));

        combinationMap.set(profileKey, {
          id: `combination-${combinationMap.size + 1}`,
          profiles,
          usageCount: 1,
          lastUsed: new Date().toISOString(),
        });
      } else {
        const existing = combinationMap.get(profileKey)!;
        
        // Update usage count
        const updated: ProfileCombination = {
          ...existing,
          usageCount: existing.usageCount + 1,
          lastUsed: new Date().toISOString(),
        };

        // Update ratios with average
        const updatedProfiles = updated.profiles.map((profile, index) => {
          const currentProfile = item.profiles[index];
          if (currentProfile) {
            const currentRatio =
              item.orderQuantity > 0
                ? currentProfile.quantity / item.orderQuantity
                : 0;
            return {
              ...profile,
              ratio: (profile.ratio + currentRatio) / 2,
            };
          }
          return profile;
        });

        combinationMap.set(profileKey, {
          ...updated,
          profiles: updatedProfiles,
        });
      }
    });

    // Convert to array and sort by usage count
    return Array.from(combinationMap.values()).sort(
      (a, b) => b.usageCount - a.usageCount,
    );
  }
}

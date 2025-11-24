/**
 * @fileoverview Cutting List Learning Service
 * @module services/cuttingList/CuttingListLearningService
 * @version 1.0.0
 * @description Service for learning patterns from cutting list items and updating suggestion database
 */

import { cuttingListRepository } from "../../repositories/CuttingListRepository";
import { UnifiedSuggestionService } from "../suggestions/UnifiedSuggestionService";
import { logger } from "../logger";
import type { ProductSection } from "../../types/cuttingList";

/**
 * Item data structure for learning
 */
export interface LearningItemData {
  readonly workOrderId: string;
  readonly date: string;
  readonly version: string;
  readonly color: string;
  readonly note?: string;
  readonly orderQuantity: number;
  readonly size: string;
  readonly priority: string;
  readonly status: string;
  readonly profiles: ReadonlyArray<{
    readonly id: string;
    readonly profile: string;
    readonly measurement: string;
    readonly quantity: number;
  }>;
}

/**
 * New item metadata for learning
 */
export interface NewItemMetadata {
  readonly id: string;
  readonly sectionId: string;
  readonly cuttingListId?: string;
}

/**
 * Profile pattern data for learning
 */
export interface ProfilePatternData {
  readonly productName: string;
  readonly size: string;
  readonly profile: string;
  readonly measurement: string;
  readonly quantity: number;
  readonly orderQuantity: number;
  readonly lastUsed: Date;
  readonly originalIndex: number;
}

/**
 * Cutting List Learning Service
 * Handles pattern learning from cutting list items
 */
export class CuttingListLearningService {
  /**
   * Learn from new cutting list item and save to suggestion patterns
   */
  public async learnFromNewItem(
    itemData: LearningItemData,
    newItem: NewItemMetadata,
  ): Promise<void> {
    try {
      // Get product name from section (we need to fetch the cutting list)
      const cuttingList = await cuttingListRepository.findById(
        newItem.cuttingListId || "unknown",
      );
      if (!cuttingList) {
        logger.warn("Cannot learn from item - cutting list not found", {
          itemId: newItem.id,
        });
        return;
      }

      // Find the section to get product name
      const sections =
        (cuttingList.sections as unknown as Array<{
          id: string;
          productName: string;
        }>) || [];
      const section = sections.find((s) => s.id === newItem.sectionId);
      if (!section?.productName) {
        logger.warn(
          "Cannot learn from item - section or product name not found",
          {
            itemId: newItem.id,
            sectionId: newItem.sectionId,
          },
        );
        return;
      }

      const productName = section.productName;
      const size = itemData.size;
      const orderQuantity = itemData.orderQuantity;

      // Learn from each profile with explicit index to preserve order
      for (let i = 0; i < itemData.profiles.length; i++) {
        const profile = itemData.profiles[i];

        await this.learnFromProfile({
          productName,
          size,
          profile: profile.profile,
          measurement: profile.measurement,
          quantity: profile.quantity,
          orderQuantity,
          lastUsed: new Date(),
          originalIndex: i, // Preserve original order
        });
      }

      logger.info("Smart learning completed for new item", {
        productName,
        size,
        orderQuantity,
        profileCount: itemData.profiles.length,
      });
    } catch (error) {
      logger.error("Failed to learn from new item", {
        error: error instanceof Error ? error : new Error(String(error)),
        itemData,
        newItem,
      });
      throw error;
    }
  }

  /**
   * Learn from a single profile pattern
   */
  public async learnFromProfile(
    patternData: ProfilePatternData,
  ): Promise<void> {
    try {
      const suggestionService = UnifiedSuggestionService.getInstance();

      // Create or update pattern with index
      await suggestionService.learnFromPattern(patternData);
    } catch (error) {
      logger.error("Failed to learn from profile", {
        error: error instanceof Error ? error : new Error(String(error)),
        patternData,
      });
      throw error;
    }
  }
}

/**
 * Singleton instance
 */
let learningServiceInstance: CuttingListLearningService | null = null;

/**
 * Get singleton instance of CuttingListLearningService
 */
export const getCuttingListLearningService = (): CuttingListLearningService => {
  if (!learningServiceInstance) {
    learningServiceInstance = new CuttingListLearningService();
  }
  return learningServiceInstance;
};

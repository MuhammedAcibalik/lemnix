/**
 * @fileoverview Profile Operations Controller
 * @module ProfileOperationsController
 * @version 1.0.0
 * @description Handles profile-specific operations
 * Extracted from cuttingListController to follow Single Responsibility Principle
 */

import { Request, Response } from "express";
import { cuttingListRepository } from "../repositories/CuttingListRepository";
import { logger } from "../services/logger";

interface ProfileItem {
  readonly profile: string;
  readonly measurement: string;
  readonly quantity: number;
}

interface ApiResponse {
  readonly success: boolean;
  readonly data?: unknown;
  readonly error?: string;
  readonly message?: string;
  readonly timestamp: string;
}

/**
 * Get available sizes for a product
 */
export const getAvailableSizes = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { productName } = req.query;

    logger.info(
      `Backend: getAvailableSizes called with productName: ${productName}`,
    );

    if (!productName || typeof productName !== "string") {
      return res.status(400).json({
        success: false,
        error: "Product name is required",
        timestamp: new Date().toISOString(),
      });
    }

    const cuttingLists = await cuttingListRepository.findAll();

    logger.info(`Backend: Found cutting lists: ${cuttingLists.length}`);

    const sizes = new Set<string>();

    cuttingLists.forEach((cuttingList) => {
      // sections is Json type in Prisma, safely cast and validate
      if (!cuttingList.sections || typeof cuttingList.sections !== "object") {
        return;
      }

      const sections = cuttingList.sections as unknown as Array<{
        productName: string;
        items: Array<{ size?: string }>;
      }>;

      if (!Array.isArray(sections)) {
        return;
      }

      sections.forEach((section) => {
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

    const availableSizes = Array.from(sizes).sort();
    logger.info(
      `Backend: Final available sizes: ${JSON.stringify(availableSizes)}`,
    );

    return res.json({
      success: true,
      data: availableSizes,
      message: `Found ${availableSizes.length} available sizes for product: ${productName}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error getting available sizes:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get available sizes",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get profile combinations for a product and size
 */
export const getProfileCombinations = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { productName, size } = req.query;

    if (
      !productName ||
      typeof productName !== "string" ||
      !size ||
      typeof size !== "string"
    ) {
      return res.status(400).json({
        success: false,
        error: "Product name and size are required",
        timestamp: new Date().toISOString(),
      });
    }

    const cuttingLists = await cuttingListRepository.findAll();

    interface MatchingItem {
      size: string;
      profiles: ProfileItem[];
      sectionProductName: string;
    }

    const matchingItems: MatchingItem[] = [];

    cuttingLists.forEach((cuttingList) => {
      // sections is Json type in Prisma, safely cast and validate
      if (!cuttingList.sections || typeof cuttingList.sections !== "object") {
        return;
      }

      const sections = cuttingList.sections as unknown as Array<{
        productName: string;
        items: Array<{
          size?: string;
          profiles?: ProfileItem[];
        }>;
      }>;

      if (!Array.isArray(sections)) {
        return;
      }

      sections.forEach((section) => {
        if (
          section.productName.toLowerCase().includes(productName.toLowerCase())
        ) {
          section.items.forEach((item) => {
            if (
              item.size &&
              item.size.toLowerCase().includes(size.toLowerCase()) &&
              item.profiles
            ) {
              matchingItems.push({
                size: item.size,
                profiles: item.profiles,
                sectionProductName: section.productName,
              });
            }
          });
        }
      });
    });

    // Group by profile combinations
    const combinationMap = new Map<
      string,
      {
        profiles: ProfileItem[];
        frequency: number;
        sources: string[];
      }
    >();

    matchingItems.forEach((item) => {
      const key = item.profiles
        .map((p) => `${p.profile}:${p.measurement}:${p.quantity}`)
        .sort()
        .join("|");

      if (combinationMap.has(key)) {
        const existing = combinationMap.get(key)!;
        existing.frequency += 1;
        existing.sources.push(item.sectionProductName);
      } else {
        combinationMap.set(key, {
          profiles: item.profiles,
          frequency: 1,
          sources: [item.sectionProductName],
        });
      }
    });

    const combinations = Array.from(combinationMap.values()).sort(
      (a, b) => b.frequency - a.frequency,
    );

    logger.info(
      `Backend: Found ${combinations.length} profile combinations for ${productName} - ${size}`,
    );

    return res.json({
      success: true,
      data: combinations,
      message: `Found ${combinations.length} profile combinations`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error getting profile combinations:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get profile combinations",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
};

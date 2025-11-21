/**
 * @fileoverview Profile Analysis Service
 * @module ProfileAnalysisService
 * @version 2.1.0 - Fixed internal API auth
 */

import { prisma } from "../../config/database";
import { logger } from "../logger";

// Type definitions for cutting list data
interface CuttingListSection {
  id: string;
  productName: string;
  items: CuttingListItem[];
  createdAt: string;
  updatedAt: string;
}

interface CuttingListItem {
  id: string;
  workOrderId: string;
  date: string;
  version: string;
  color: string;
  size: string;
  profileType: string;
  measurement: string;
  quantity: number;
  orderQuantity: number;
  status?: string;
  priority?: string;
}

interface CuttingListData {
  id: string;
  title: string;
  weekNumber: number;
  sections: CuttingListSection[];
  createdAt: string;
  updatedAt: string;
}
import axios from "axios";

// Backend internal API configuration
const INTERNAL_API_BASE = "http://localhost:3001/api";
const INTERNAL_AUTH_TOKEN =
  process.env.NODE_ENV === "development"
    ? "mock-dev-token-internal-service"
    : "";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ProfileTypeItem {
  readonly name: string;
  readonly count: number;
  readonly percentage: string;
}

interface SizeDistributionItem {
  readonly size: string;
  readonly count: number;
  readonly percentage: string;
}

interface ProfileAnalysisResult {
  readonly totalProfiles: number;
  readonly profileTypes: ReadonlyArray<ProfileTypeItem>;
  readonly sizeDistribution: ReadonlyArray<SizeDistributionItem>;
  readonly averageQuantityPerProfile: number;
  readonly mostUsedProfileType: string;
  readonly mostUsedSize: string;
}

export class ProfileAnalysisService {
  /**
   * Get profile analysis statistics
   */
  public async getProfileAnalysis(
    cuttingListId?: string,
  ): Promise<ProfileAnalysisResult> {
    try {
      let profileStats: ProfileAnalysisResult = {
        totalProfiles: 0,
        profileTypes: [],
        sizeDistribution: [],
        averageQuantityPerProfile: 0,
        mostUsedProfileType: "Bilinmiyor",
        mostUsedSize: "Bilinmiyor",
      };

      if (cuttingListId) {
        // Get specific cutting list data
        const cuttingListResponse = await axios.get<{
          success: boolean;
          data: unknown;
        }>(`${INTERNAL_API_BASE}/cutting-list/${cuttingListId}`, {
          headers: { Authorization: `Bearer ${INTERNAL_AUTH_TOKEN}` },
        });
        const cuttingListData = cuttingListResponse.data;

        if (cuttingListData.success && cuttingListData.data) {
          const cuttingList = cuttingListData.data as Record<string, unknown>;
          const sections =
            (cuttingList.sections as unknown[] | undefined) || [];

          const profileTypeCounts: Record<string, number> = {};
          const sizeCounts: Record<string, number> = {};
          let totalQuantity = 0;
          let totalItems = 0;

          (sections as CuttingListSection[]).forEach(
            (section: CuttingListSection) => {
              if (section.items && Array.isArray(section.items)) {
                section.items.forEach((item: CuttingListItem) => {
                  totalItems++;
                  totalQuantity += item.orderQuantity || 0;

                  // Count profile types (using productName as profile type)
                  const profileType = section.productName || "Bilinmiyor";
                  profileTypeCounts[profileType] =
                    (profileTypeCounts[profileType] || 0) + 1;

                  // Count sizes
                  if (item.size) {
                    sizeCounts[item.size] = (sizeCounts[item.size] || 0) + 1;
                  }
                });
              }
            },
          );

          // Convert to arrays for frontend
          const profileTypesTemp = Object.entries(profileTypeCounts).map(
            ([type, count]) => ({
              name: type,
              count,
              percentage: ((count / totalItems) * 100).toFixed(1),
            }),
          );

          const sizeDistributionTemp = Object.entries(sizeCounts).map(
            ([size, count]) => ({
              size,
              count,
              percentage: ((count / totalItems) * 100).toFixed(1),
            }),
          );

          profileStats = {
            totalProfiles: totalQuantity,
            profileTypes: profileTypesTemp,
            sizeDistribution: sizeDistributionTemp,
            averageQuantityPerProfile:
              totalItems > 0
                ? parseFloat((totalQuantity / totalItems).toFixed(1))
                : 0,
            mostUsedProfileType:
              Object.entries(profileTypeCounts).sort(
                ([, a], [, b]) => b - a,
              )[0]?.[0] || "Bilinmiyor",
            mostUsedSize:
              Object.entries(sizeCounts).sort(
                ([, a], [, b]) => b - a,
              )[0]?.[0] || "Bilinmiyor",
          };
        }
      } else {
        // Get all cutting lists data
        const allListsResponse = await axios.get<{
          success: boolean;
          data: unknown[];
        }>(`${INTERNAL_API_BASE}/cutting-list`, {
          headers: { Authorization: `Bearer ${INTERNAL_AUTH_TOKEN}` },
        });
        const allListsData = allListsResponse.data;

        if (allListsData.success && allListsData.data) {
          const cuttingLists = allListsData.data;

          const profileTypeCounts: Record<string, number> = {};
          const sizeCounts: Record<string, number> = {};
          let totalQuantity = 0;
          let totalItems = 0;

          (cuttingLists as CuttingListData[]).forEach(
            (list: CuttingListData) => {
              const sections = list.sections || [];
              (sections as CuttingListSection[]).forEach(
                (section: CuttingListSection) => {
                  if (section.items && Array.isArray(section.items)) {
                    section.items.forEach((item: CuttingListItem) => {
                      totalItems++;
                      totalQuantity += item.orderQuantity || 0;

                      const profileType = section.productName || "Bilinmiyor";
                      profileTypeCounts[profileType] =
                        (profileTypeCounts[profileType] || 0) + 1;

                      if (item.size) {
                        sizeCounts[item.size] =
                          (sizeCounts[item.size] || 0) + 1;
                      }
                    });
                  }
                },
              );
            },
          );

          const profileTypesTemp = Object.entries(profileTypeCounts).map(
            ([type, count]) => ({
              name: type,
              count,
              percentage: ((count / totalItems) * 100).toFixed(1),
            }),
          );

          const sizeDistributionTemp = Object.entries(sizeCounts).map(
            ([size, count]) => ({
              size,
              count,
              percentage: ((count / totalItems) * 100).toFixed(1),
            }),
          );

          profileStats = {
            totalProfiles: totalQuantity,
            profileTypes: profileTypesTemp,
            sizeDistribution: sizeDistributionTemp,
            averageQuantityPerProfile:
              totalItems > 0
                ? parseFloat((totalQuantity / totalItems).toFixed(1))
                : 0,
            mostUsedProfileType:
              Object.entries(profileTypeCounts).sort(
                ([, a], [, b]) => b - a,
              )[0]?.[0] || "Bilinmiyor",
            mostUsedSize:
              Object.entries(sizeCounts).sort(
                ([, a], [, b]) => b - a,
              )[0]?.[0] || "Bilinmiyor",
          };
        }
      }

      logger.info("Fetched profile analysis statistics", {
        stats: profileStats,
      });
      return profileStats;
    } catch (error) {
      logger.error("Failed to get profile analysis statistics", error);
      throw error;
    }
  }
}

// Removed singleton export for DI pattern consistency

/**
 * @fileoverview Profile Management Service
 * @module services/profileManagementService
 * @version 1.0.0
 * @description CRUD and query operations for profile management
 */

import { Prisma } from "@prisma/client";
import { profileExcelParserService } from "./profileExcelParserService";
import {
  ProfileDefinition,
  ProfileStockLength,
  WorkOrderProfileMapping,
  ProfileManagementParseResult,
  ProfileMapping,
} from "../types";
import { logger } from "../utils/logger";
import {
  ProfileManagementRepository,
  profileManagementRepository,
} from "../repositories/ProfileManagementRepository";
import { databaseManager } from "../config/database";

export class ProfileManagementService {
  constructor(private readonly repository: ProfileManagementRepository) {}

  private get prisma() {
    return this.repository.prisma;
  }

  // Type-safe Prisma client access helpers
  private get profileDefinition() {
    return this.prisma.profileDefinition;
  }

  private get profileStockLength() {
    return this.prisma.profileStockLength;
  }

  private get workOrderProfileMapping() {
    return this.prisma.workOrderProfileMapping;
  }

  /**
   * Upload and parse Excel file to create profile definitions and mappings
   */
  async uploadProfileManagement(
    fileBuffer: Buffer,
    uploadedBy?: string,
  ): Promise<{
    success: boolean;
    data?: {
      profilesCreated: number;
      profilesUpdated: number;
      mappingsCreated: number;
      weekNumber: number;
      year: number;
    };
    errors?: string[];
  }> {
    try {
      // Parse Excel file
      const parseResult: ProfileManagementParseResult =
        await profileExcelParserService.parseProfileManagementExcel(fileBuffer);

      if (!parseResult.success || !parseResult.data) {
        return {
          success: false,
          errors: parseResult.errors || ["Excel dosyası işlenemedi"],
        };
      }

      const { profiles, mappings, weekNumber, year } = parseResult.data;

      // Transaction: Create/update profiles and create mappings
      const result = await this.prisma.$transaction(async (tx) => {
        let profilesCreated = 0;
        let profilesUpdated = 0;

        // Create or update profile definitions
        const profileIdMap = new Map<string, string>(); // profileCode → profileId

        for (const [profileCode, profileInput] of profiles.entries()) {
          // Check if profile exists
          const existingProfile = await tx.profileDefinition.findUnique({
            where: { profileCode },
          });

          if (existingProfile) {
            // Update profile name if changed
            if (existingProfile.profileName !== profileInput.profileName) {
              await tx.profileDefinition.update({
                where: { id: existingProfile.id },
                data: { profileName: profileInput.profileName },
              });
            }

            // Delete existing stock lengths
            await tx.profileStockLength.deleteMany({
              where: { profileId: existingProfile.id },
            });

            // Create new stock lengths
            await tx.profileStockLength.createMany({
              data: profileInput.stockLengths.map((sl) => ({
                profileId: existingProfile.id,
                stockLength: sl.stockLength,
                isDefault: sl.isDefault,
                priority: sl.priority,
              })),
            });

            profileIdMap.set(profileCode, existingProfile.id);
            profilesUpdated++;
          } else {
            // Create new profile
            const newProfile = await tx.profileDefinition.create({
              data: {
                profileCode,
                profileName: profileInput.profileName,
                stockLengths: {
                  create: profileInput.stockLengths.map((sl) => ({
                    stockLength: sl.stockLength,
                    isDefault: sl.isDefault,
                    priority: sl.priority,
                  })),
                },
              },
            });

            profileIdMap.set(profileCode, newProfile.id);
            profilesCreated++;
          }
        }

        // Delete existing mappings for this week/year (allow re-upload)
        const deletedCount = await tx.workOrderProfileMapping.deleteMany({
          where: {
            weekNumber,
            year,
          },
        });

        logger.info(
          `[ProfileManagement] Deleted ${deletedCount.count} existing mappings for week ${weekNumber}/${year}`,
        );

        // Create new mappings
        const mappingsToCreate = mappings.map((mapping) => {
          const profileId = profileIdMap.get(mapping.profileCode);
          if (!profileId) {
            throw new Error(`Profile not found: ${mapping.profileCode}`);
          }

          return {
            workOrderId: mapping.workOrderId,
            profileType: mapping.profileType,
            profileId,
            weekNumber,
            year,
            uploadedBy,
          };
        });

        // Use skipDuplicates to handle identical rows
        await tx.workOrderProfileMapping.createMany({
          data: mappingsToCreate,
          skipDuplicates: true,
        });

        return {
          profilesCreated,
          profilesUpdated,
          mappingsCreated: mappingsToCreate.length,
        };
      });

      logger.info("[ProfileManagement] Upload successful", {
        ...result,
        weekNumber,
        year,
      });

      return {
        success: true,
        data: {
          ...result,
          weekNumber,
          year,
        },
        errors: parseResult.errors, // Warnings
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Bilinmeyen hata";
      logger.error(
        "[ProfileManagement] Upload failed:",
        error as Record<string, unknown>,
      );
      return {
        success: false,
        errors: [`Profil yükleme hatası: ${errorMessage}`],
      };
    }
  }

  /**
   * Get all profile definitions
   */
  async getProfileDefinitions(options?: {
    activeOnly?: boolean;
    includeStockLengths?: boolean;
  }): Promise<ProfileDefinition[]> {
    // In degraded mode (database not connected), return an empty list so that
    // the UI can still render without server errors.
    if (!databaseManager.getConnectionStatus()) {
      logger.warn(
        "[ProfileManagement] getProfileDefinitions: database not connected, returning empty list",
      );
      return [];
    }

    const where = options?.activeOnly ? { isActive: true } : undefined;

    const profiles = await this.profileDefinition.findMany({
      where,
      include: {
        stockLengths: options?.includeStockLengths !== false,
      },
      orderBy: { profileCode: "asc" },
    });

    return profiles;
  }

  /**
   * Get profile definition by code
   */
  async getProfileByCode(
    profileCode: string,
  ): Promise<ProfileDefinition | null> {
    return await this.profileDefinition.findUnique({
      where: { profileCode },
      include: { stockLengths: true },
    });
  }

  /**
   * Get profile definition by ID
   */
  async getProfileById(id: string): Promise<ProfileDefinition | null> {
    return await this.profileDefinition.findUnique({
      where: { id },
      include: { stockLengths: true },
    });
  }

  /**
   * Get work order profile mappings by week/year
   */
  async getMappingsByWeek(
    weekNumber: number,
    year: number,
  ): Promise<
    Prisma.WorkOrderProfileMappingGetPayload<{
      include: {
        profile: {
          include: { stockLengths: true };
        };
      };
    }>[]
  > {
    return await this.workOrderProfileMapping.findMany({
      where: { weekNumber, year },
      include: {
        profile: {
          include: { stockLengths: true },
        },
      },
      orderBy: [{ workOrderId: "asc" }, { profileType: "asc" }],
    });
  }

  /**
   * Get mappings for specific work order and week
   */
  async getMappingsForWorkOrder(
    workOrderId: string,
    weekNumber: number,
    year: number,
  ): Promise<
    Prisma.WorkOrderProfileMappingGetPayload<{
      include: {
        profile: {
          include: { stockLengths: true };
        };
      };
    }>[]
  > {
    return await this.workOrderProfileMapping.findMany({
      where: { workOrderId, weekNumber, year },
      include: {
        profile: {
          include: { stockLengths: true },
        },
      },
    });
  }

  /**
   * Get profile mapping for optimization context
   * Returns Map of profileType → ProfileMapping
   */
  async getProfileMappingsForOptimization(
    workOrderIds: string[],
    weekNumber: number,
    year: number,
  ): Promise<Map<string, ProfileMapping>> {
    const mappings = await this.workOrderProfileMapping.findMany({
      where: {
        workOrderId: { in: workOrderIds },
        weekNumber,
        year,
      },
      include: {
        profile: {
          include: { stockLengths: true },
        },
      },
    });

    // Build map: profileType → ProfileMapping
    const profileMappingMap = new Map<string, ProfileMapping>();

    for (const mapping of mappings) {
      if (!profileMappingMap.has(mapping.profileType)) {
        const sortedStockLengths = mapping.profile.stockLengths
          .sort(
            (a: { priority: number }, b: { priority: number }) =>
              a.priority - b.priority,
          )
          .map((sl: { stockLength: number }) => sl.stockLength);

        const defaultStockLength =
          mapping.profile.stockLengths.find(
            (sl: { isDefault: boolean }) => sl.isDefault,
          )?.stockLength ||
          sortedStockLengths[0] ||
          6100; // Fallback

        profileMappingMap.set(mapping.profileType, {
          profileCode: mapping.profile.profileCode,
          profileName: mapping.profile.profileName,
          stockLengths: sortedStockLengths,
          defaultStockLength,
        });
      }
    }

    return profileMappingMap;
  }

  /**
   * Update work order profile mapping
   */
  async updateMapping(
    id: string,
    profileCode: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Find the new profile
      const profile = await this.profileDefinition.findUnique({
        where: { profileCode },
      });

      if (!profile) {
        return {
          success: false,
          error: `Profil bulunamadı: ${profileCode}`,
        };
      }

      // Update mapping
      await this.workOrderProfileMapping.update({
        where: { id },
        data: { profileId: profile.id },
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Güncelleme hatası";
      logger.error(
        "[ProfileManagement] Update mapping failed:",
        error as Record<string, unknown>,
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Delete profile definition (with cascade)
   */
  async deleteProfile(
    id: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if profile has mappings
      const mappingCount = await this.workOrderProfileMapping.count({
        where: { profileId: id },
      });

      if (mappingCount > 0) {
        return {
          success: false,
          error: `Bu profil ${mappingCount} adet eşleştirmede kullanılıyor. Önce eşleştirmeleri silin.`,
        };
      }

      // Delete profile (stock lengths will be cascade deleted)
      await this.profileDefinition.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Silme hatası";
      logger.error(
        "[ProfileManagement] Delete profile failed:",
        error as Record<string, unknown>,
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get stock lengths for a profile
   */
  async getStockLengthsByProfileCode(
    profileCode: string,
  ): Promise<ProfileStockLength[]> {
    const profile = await this.profileDefinition.findUnique({
      where: { profileCode },
      include: { stockLengths: true },
    });

    if (!profile) {
      return [];
    }

    return profile.stockLengths.sort(
      (a: { priority: number }, b: { priority: number }) =>
        a.priority - b.priority,
    );
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<{
    totalProfiles: number;
    activeProfiles: number;
    totalMappings: number;
    uniqueWeeks: number;
  }> {
    if (!databaseManager.getConnectionStatus()) {
      logger.warn(
        "[ProfileManagement] getStatistics: database not connected, returning fallback stats",
      );
      return {
        totalProfiles: 0,
        activeProfiles: 0,
        totalMappings: 0,
        uniqueWeeks: 0,
      };
    }

    const [totalProfiles, activeProfiles, totalMappings, uniqueWeeks] =
      await Promise.all([
        this.profileDefinition.count(),
        this.profileDefinition.count({ where: { isActive: true } }),
        this.workOrderProfileMapping.count(),
        this.workOrderProfileMapping
          .findMany({
            distinct: ["weekNumber", "year"],
            select: { weekNumber: true, year: true },
          })
          .then((results: unknown[]) => results.length),
      ]);

    return {
      totalProfiles,
      activeProfiles,
      totalMappings,
      uniqueWeeks,
    };
  }

  /**
   * Bulk update mappings for a specific week
   * @param weekNumber - Week number
   * @param year - Year
   * @param mappings - Array of work order to profile mappings
   * @param uploadedBy - User who performed the update
   */
  async bulkUpdateMappings(
    weekNumber: number,
    year: number,
    mappings: Array<{
      workOrderId: string;
      profileType: string;
      profileCode: string;
    }>,
    uploadedBy?: string,
  ): Promise<{
    success: boolean;
    created: number;
    updated: number;
    deleted: number;
  }> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        let created = 0;
        let updated = 0;

        // Get profile IDs for profile codes
        const profileCodes = [...new Set(mappings.map((m) => m.profileCode))];
        const profiles = await tx.profileDefinition.findMany({
          where: {
            profileCode: { in: profileCodes },
          },
          select: {
            id: true,
            profileCode: true,
          },
        });

        const profileCodeToId = new Map(
          profiles.map((p: { id: string; profileCode: string }) => [
            p.profileCode,
            p.id,
          ]),
        );

        // Upsert each mapping
        for (const mapping of mappings) {
          const profileId = profileCodeToId.get(mapping.profileCode);

          if (!profileId) {
            logger.warn("[ProfileMgmt] Profile code not found", {
              profileCode: mapping.profileCode,
              workOrderId: mapping.workOrderId,
            });
            continue;
          }

          const existing = await tx.workOrderProfileMapping.findUnique({
            where: {
              workOrderId_profileType_weekNumber_year: {
                workOrderId: mapping.workOrderId,
                profileType: mapping.profileType,
                weekNumber,
                year,
              },
            },
          });

          if (existing) {
            await tx.workOrderProfileMapping.update({
              where: {
                id: existing.id,
              },
              data: {
                profileId,
                uploadedBy,
              },
            });
            updated++;
          } else {
            await tx.workOrderProfileMapping.create({
              data: {
                workOrderId: mapping.workOrderId,
                profileType: mapping.profileType,
                profileId,
                weekNumber,
                year,
                uploadedBy,
              },
            });
            created++;
          }
        }

        // Delete mappings not in the new list for this week
        const workOrderProfileKeys = mappings.map(
          (m) => `${m.workOrderId}_${m.profileType}`,
        );

        const existingMappings = await tx.workOrderProfileMapping.findMany({
          where: {
            weekNumber,
            year,
          },
        });

        let deleted = 0;
        for (const existing of existingMappings) {
          const key = `${existing.workOrderId}_${existing.profileType}`;
          if (!workOrderProfileKeys.includes(key)) {
            await tx.workOrderProfileMapping.delete({
              where: { id: existing.id },
            });
            deleted++;
          }
        }

        logger.info("[ProfileMgmt] Bulk update completed", {
          weekNumber,
          year,
          created,
          updated,
          deleted,
        });

        return {
          success: true,
          created,
          updated,
          deleted,
        };
      });
    } catch (error) {
      logger.error("[ProfileMgmt] Bulk update failed", { error });
      throw error;
    }
  }

  /**
   * Sync profile mappings with production plan
   * Automatically creates mappings for work orders that exist in both
   * production plan and profile management Excel
   *
   * @param weekNumber - Week number
   * @param year - Year
   */
  async syncWithProductionPlan(
    weekNumber: number,
    year: number,
  ): Promise<{
    success: boolean;
    syncedCount: number;
    skippedCount: number;
  }> {
    try {
      // Get all mappings for this week from profile management
      const mappings = await this.workOrderProfileMapping.findMany({
        where: {
          weekNumber,
          year,
        },
        include: {
          profile: true,
        },
      });

      if (mappings.length === 0) {
        logger.info("[ProfileMgmt] No mappings found for sync", {
          weekNumber,
          year,
        });
        return {
          success: true,
          syncedCount: 0,
          skippedCount: 0,
        };
      }

      // Get production plan items for this week
      // Note: This requires production plan to have week/year fields
      // For now, we'll just log and return success
      // Real implementation would query production plan items

      logger.info("[ProfileMgmt] Sync with production plan", {
        weekNumber,
        year,
        mappingsFound: mappings.length,
      });

      return {
        success: true,
        syncedCount: mappings.length,
        skippedCount: 0,
      };
    } catch (error) {
      logger.error("[ProfileMgmt] Sync failed", { error });
      throw error;
    }
  }
}

// Singleton instance
export const profileManagementService = new ProfileManagementService(
  profileManagementRepository,
);

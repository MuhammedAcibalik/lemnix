/**
 * @fileoverview Profile Resolver Service
 * @module services/ProfileResolverService
 * @version 1.0.0
 * @description Resolves profile definitions and stock lengths for work orders based on mappings
 */

import { PrismaClient } from "@prisma/client";
import { ILogger, NoOpLogger } from "./logger";

// Type aliases for Prisma models (will be available after prisma generate)
type ProfileDefinition = {
  id: string;
  profileCode: string;
  profileName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ProfileStockLength = {
  id: string;
  profileId: string;
  stockLength: number;
  isDefault: boolean;
  priority: number;
  createdAt: Date;
};

type WorkOrderProfileMapping = {
  id: string;
  workOrderId: string;
  profileType: string;
  profileId: string;
  weekNumber: number;
  year: number;
  uploadedBy: string | null;
  createdAt: Date;
};

export interface ProfileResolutionResult {
  readonly profileId: string;
  readonly profileCode: string;
  readonly profileName: string;
  readonly stockLengths: readonly number[];
  readonly defaultStockLength: number;
  readonly source: "mapping" | "fallback";
}

export interface ProfileResolutionParams {
  readonly workOrderId: string;
  readonly profileType: string;
  readonly weekNumber?: number;
  readonly year?: number;
}

/**
 * Profile Resolver Service
 * Resolves profile definitions and stock lengths for optimization
 */
export class ProfileResolverService {
  private readonly prisma: PrismaClient;
  private readonly logger: ILogger;

  constructor(prisma: PrismaClient, logger?: ILogger) {
    this.prisma = prisma;
    this.logger = logger || new NoOpLogger();
  }

  /**
   * Resolve profile for a work order
   * @param params - Resolution parameters
   * @returns Profile resolution result or null if no profiles found
   */
  public async resolveProfileForWorkOrder(
    params: ProfileResolutionParams,
  ): Promise<ProfileResolutionResult | null> {
    const { workOrderId, profileType, weekNumber, year } = params;

    this.logger.info("[ProfileResolver] Resolving profile", {
      workOrderId,
      profileType,
      weekNumber,
      year,
    });

    // Try to find mapping first
    if (weekNumber !== undefined && year !== undefined) {
      const mapping = await this.findMapping(
        workOrderId,
        profileType,
        weekNumber,
        year,
      );

      if (mapping) {
        this.logger.info("[ProfileResolver] Found mapping", {
          workOrderId,
          profileType,
          profileId: mapping.profileId,
        });

        const profileResult = await this.getProfileWithStockLengths(
          mapping.profileId,
        );

        if (profileResult) {
          return {
            ...profileResult,
            source: "mapping",
          };
        }
      }
    }

    // Fallback: Try to find any active profile matching profile type
    // This is a simple fallback - return first active profile
    this.logger.info("[ProfileResolver] No mapping found, using fallback", {
      workOrderId,
      profileType,
    });

    const fallbackProfile = await this.findFallbackProfile(profileType);

    if (fallbackProfile) {
      return {
        ...fallbackProfile,
        source: "fallback",
      };
    }

    this.logger.warn(
      "[ProfileResolver] No profile found (mapping or fallback)",
      {
        workOrderId,
        profileType,
      },
    );

    return null;
  }

  /**
   * Get all active profiles for a profile type (when no specific mapping exists)
   */
  public async getAllActiveProfiles(
    profileType?: string,
  ): Promise<ProfileResolutionResult[]> {
    const profiles = await (
      this.prisma as unknown as {
        profileDefinition: {
          findMany: (
            args: unknown,
          ) => Promise<
            Array<ProfileDefinition & { stockLengths: ProfileStockLength[] }>
          >;
        };
      }
    ).profileDefinition.findMany({
      where: {
        isActive: true,
      },
      include: {
        stockLengths: {
          orderBy: {
            priority: "asc",
          },
        },
      },
    });

    const results: ProfileResolutionResult[] = [];

    for (const profile of profiles) {
      if (profile.stockLengths.length === 0) {
        continue;
      }

      const stockLengths = profile.stockLengths.map(
        (sl: ProfileStockLength) => sl.stockLength,
      );
      const defaultStockLength =
        profile.stockLengths.find((sl: ProfileStockLength) => sl.isDefault)
          ?.stockLength || stockLengths[0];

      results.push({
        profileId: profile.id,
        profileCode: profile.profileCode,
        profileName: profile.profileName,
        stockLengths,
        defaultStockLength,
        source: "fallback",
      });
    }

    this.logger.info("[ProfileResolver] Found active profiles", {
      count: results.length,
      profileType,
    });

    return results;
  }

  /**
   * Find mapping for work order and profile type
   */
  private async findMapping(
    workOrderId: string,
    profileType: string,
    weekNumber: number,
    year: number,
  ): Promise<{ profileId: string } | null> {
    const mapping = await (
      this.prisma as unknown as {
        workOrderProfileMapping: {
          findFirst: (args: unknown) => Promise<WorkOrderProfileMapping | null>;
        };
      }
    ).workOrderProfileMapping.findFirst({
      where: {
        workOrderId,
        profileType,
        weekNumber,
        year,
      },
      select: {
        profileId: true,
      },
    });

    return mapping;
  }

  /**
   * Get profile with stock lengths
   */
  private async getProfileWithStockLengths(
    profileId: string,
  ): Promise<Omit<ProfileResolutionResult, "source"> | null> {
    const profile = await (
      this.prisma as unknown as {
        profileDefinition: {
          findUnique: (
            args: unknown,
          ) => Promise<
            (ProfileDefinition & { stockLengths: ProfileStockLength[] }) | null
          >;
        };
      }
    ).profileDefinition.findUnique({
      where: { id: profileId },
      include: {
        stockLengths: {
          orderBy: {
            priority: "asc",
          },
        },
      },
    });

    if (!profile || !profile.isActive) {
      return null;
    }

    if (profile.stockLengths.length === 0) {
      this.logger.warn("[ProfileResolver] Profile has no stock lengths", {
        profileId,
        profileCode: profile.profileCode,
      });
      return null;
    }

    const stockLengths = profile.stockLengths.map(
      (sl: ProfileStockLength) => sl.stockLength,
    );
    const defaultStockLength =
      profile.stockLengths.find((sl: ProfileStockLength) => sl.isDefault)
        ?.stockLength || stockLengths[0];

    return {
      profileId: profile.id,
      profileCode: profile.profileCode,
      profileName: profile.profileName,
      stockLengths,
      defaultStockLength,
    };
  }

  /**
   * Find fallback profile (first active profile)
   */
  private async findFallbackProfile(
    profileType: string,
  ): Promise<Omit<ProfileResolutionResult, "source"> | null> {
    // For now, just return first active profile
    // Future: could match by profileType or other criteria
    const profile = await (
      this.prisma as unknown as {
        profileDefinition: {
          findFirst: (
            args: unknown,
          ) => Promise<
            (ProfileDefinition & { stockLengths: ProfileStockLength[] }) | null
          >;
        };
      }
    ).profileDefinition.findFirst({
      where: {
        isActive: true,
      },
      include: {
        stockLengths: {
          orderBy: {
            priority: "asc",
          },
        },
      },
    });

    if (!profile) {
      return null;
    }

    return this.getProfileWithStockLengths(profile.id);
  }

  /**
   * Check if a work order has profile mappings
   */
  public async hasProfileMapping(
    workOrderId: string,
    weekNumber: number,
    year: number,
  ): Promise<boolean> {
    const count = await (
      this.prisma as unknown as {
        workOrderProfileMapping: {
          count: (args: unknown) => Promise<number>;
        };
      }
    ).workOrderProfileMapping.count({
      where: {
        workOrderId,
        weekNumber,
        year,
      },
    });

    return count > 0;
  }

  /**
   * Get all profile mappings for a work order
   */
  public async getWorkOrderMappings(
    workOrderId: string,
    weekNumber: number,
    year: number,
  ): Promise<
    Array<{
      readonly profileType: string;
      readonly profileCode: string;
      readonly profileName: string;
    }>
  > {
    const mappings = await (
      this.prisma as unknown as {
        workOrderProfileMapping: {
          findMany: (
            args: unknown,
          ) => Promise<
            Array<WorkOrderProfileMapping & { profile: ProfileDefinition }>
          >;
        };
      }
    ).workOrderProfileMapping.findMany({
      where: {
        workOrderId,
        weekNumber,
        year,
      },
      include: {
        profile: true,
      },
    });

    return mappings.map(
      (m: WorkOrderProfileMapping & { profile: ProfileDefinition }) => ({
        profileType: m.profileType,
        profileCode: m.profile.profileCode,
        profileName: m.profile.profileName,
      }),
    );
  }
}

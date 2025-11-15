import { MaterialProfileMapping, Prisma } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export class MaterialProfileMappingRepository extends BaseRepository {
  private static instance: MaterialProfileMappingRepository;

  private constructor() {
    super();
  }

  public static getInstance(): MaterialProfileMappingRepository {
    if (!MaterialProfileMappingRepository.instance) {
      MaterialProfileMappingRepository.instance =
        new MaterialProfileMappingRepository();
    }

    return MaterialProfileMappingRepository.instance;
  }

  public async findSuggestionsByMalzemeNo(
    malzemeNo: string,
  ): Promise<MaterialProfileMapping[]> {
    return this.prisma.materialProfileMapping.findMany({
      where: {
        malzemeNo: {
          contains: malzemeNo,
          mode: "insensitive",
        },
      },
      orderBy: [{ usageCount: "desc" }, { lastUsed: "desc" }],
      take: 10,
    });
  }

  public async upsertMapping(
    data: Prisma.MaterialProfileMappingUpsertArgs,
  ): Promise<MaterialProfileMapping> {
    return this.prisma.materialProfileMapping.upsert(data);
  }

  public async incrementUsageCount(
    where: Prisma.MaterialProfileMappingWhereInput,
  ): Promise<void> {
    await this.prisma.materialProfileMapping.updateMany({
      where,
      data: {
        usageCount: {
          increment: 1,
        },
        lastUsed: new Date(),
      },
    });
  }
}

export const materialProfileMappingRepository =
  MaterialProfileMappingRepository.getInstance();

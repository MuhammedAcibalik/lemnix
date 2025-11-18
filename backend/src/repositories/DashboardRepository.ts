import { Prisma } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export class DashboardRepository extends BaseRepository {
  private static instance: DashboardRepository;

  private constructor() {
    super();
  }

  public static getInstance(): DashboardRepository {
    if (!DashboardRepository.instance) {
      DashboardRepository.instance = new DashboardRepository();
    }

    return DashboardRepository.instance;
  }

  public countCuttingLists(where: Prisma.CuttingListWhereInput) {
    return this.prisma.cuttingList.count({ where });
  }

  public findDistinctProfileTypes() {
    return this.prisma.cuttingListItem.findMany({
      distinct: ["profileType"],
      select: { profileType: true },
    });
  }

  public aggregateOptimizationStatistics(
    args: Prisma.OptimizationStatisticsAggregateArgs,
  ) {
    return this.prisma.optimizationStatistics.aggregate(args);
  }

  public countActiveUsers(where: Prisma.UserWhereInput) {
    return this.prisma.user.count({ where });
  }

  public groupOptimizationStatistics(
    args: Prisma.OptimizationStatisticsGroupByArgs,
  ) {
    // Prisma 5 groupBy requires orderBy when using take/skip.
    // Our repository stays thin and delegates validation to service layer,
    // but we still satisfy the stricter type by asserting the args shape.
    return this.prisma.optimizationStatistics.groupBy(
      args as Parameters<
        (typeof this.prisma.optimizationStatistics)["groupBy"]
      >[0],
    );
  }

  public findOptimizations(args: Prisma.OptimizationFindManyArgs) {
    return this.prisma.optimization.findMany(args);
  }

  public findUserActivities(args: Prisma.UserActivityFindManyArgs) {
    return this.prisma.userActivity.findMany(args);
  }

  public findRecentCuttingLists(args: Prisma.CuttingListFindManyArgs) {
    return this.prisma.cuttingList.findMany(args);
  }
}

export const dashboardRepository = DashboardRepository.getInstance();

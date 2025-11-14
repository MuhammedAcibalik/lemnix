/**
 * @fileoverview Statistics Service for Production Plan Analytics
 * @module services/statisticsService
 * @version 1.0.0
 */

import {
  productionPlanService,
  ProductionPlanFilters,
} from "./productionPlanService";
import {
  ProductionPlanRepository,
  productionPlanRepository,
} from "../repositories/ProductionPlanRepository";

export interface ProductionPlanStatistics {
  overview: {
    totalPlans: number;
    totalItems: number;
    completedItems: number;
    completionRate: number;
    backorderCount: number;
  };
  departmentDistribution: Array<{
    department: string;
    total: number;
    completed: number;
  }>;
  priorityDistribution: Array<{
    priority: string;
    count: number;
  }>;
  weeklyTrends: Array<{
    week: number;
    year: number;
    itemCount: number;
    completionRate: number;
  }>;
  topBackorders: Array<{
    id: string;
    ad: string;
    siparis: string;
    planlananBitisTarihi: string;
    daysOverdue: number;
    riskLevel: "high" | "medium" | "low";
  }>;
}

export class StatisticsService {
  constructor(private readonly repository: ProductionPlanRepository) {}

  private get prisma() {
    return this.repository.prisma;
  }

  /**
   * Get comprehensive production plan statistics
   */
  async getStatistics(
    filters?: ProductionPlanFilters,
  ): Promise<ProductionPlanStatistics> {
    // Overview metrics
    const totalPlans = await this.prisma.productionPlan.count({
      where: filters?.status ? { status: filters.status } : {},
    });

    const totalItems = await this.prisma.productionPlanItem.count({
      where: this.buildItemWhereClause(filters),
    });

    const completedItems = await this.prisma.productionPlanItem.count({
      where: {
        ...this.buildItemWhereClause(filters),
        linkedCuttingListId: { not: null },
      },
    });

    const completionRate =
      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Backorder count
    const backorderItems =
      await productionPlanService.getBackorderItems(filters);
    const backorderCount = backorderItems.length;

    // Department distribution
    const departmentStats = await this.prisma.productionPlanItem.groupBy({
      by: ["bolum"],
      where: this.buildItemWhereClause(filters),
      _count: { id: true },
    });

    const departmentCompletedStats =
      await this.prisma.productionPlanItem.groupBy({
        by: ["bolum"],
        where: {
          ...this.buildItemWhereClause(filters),
          linkedCuttingListId: { not: null },
        },
        _count: { id: true },
      });

    const departmentDistribution = departmentStats.map((dept) => {
      const completed =
        departmentCompletedStats.find((c) => c.bolum === dept.bolum)?._count
          .id || 0;
      return {
        department: this.mapDepartmentName(dept.bolum),
        total: dept._count.id,
        completed,
      };
    });

    // Priority distribution
    const priorityStats = await this.prisma.productionPlanItem.groupBy({
      by: ["oncelik"],
      where: this.buildItemWhereClause(filters),
      _count: { id: true },
    });

    const priorityDistribution = priorityStats.map((priority) => ({
      priority: this.mapPriorityName(priority.oncelik),
      count: priority._count.id,
    }));

    // Weekly trends (last 12 weeks)
    const weeklyTrends = await this.getWeeklyTrends(filters);

    // Top backorders
    const topBackorders = await this.getTopBackorders(5, filters);

    return {
      overview: {
        totalPlans,
        totalItems,
        completedItems,
        completionRate: Math.round(completionRate * 100) / 100,
        backorderCount,
      },
      departmentDistribution,
      priorityDistribution,
      weeklyTrends,
      topBackorders,
    };
  }

  /**
   * Get weekly trends for the last 12 weeks
   */
  private async getWeeklyTrends(filters?: ProductionPlanFilters): Promise<
    Array<{
      week: number;
      year: number;
      itemCount: number;
      completionRate: number;
    }>
  > {
    const trends = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const weekDate = new Date(today);
      weekDate.setDate(today.getDate() - i * 7);

      const weekNumber = this.getWeekNumber(weekDate);
      const year = weekDate.getFullYear();

      const weekItems = await this.prisma.productionPlanItem.count({
        where: {
          ...this.buildItemWhereClause(filters),
          plan: {
            weekNumber,
            year,
          },
        },
      });

      const weekCompleted = await this.prisma.productionPlanItem.count({
        where: {
          ...this.buildItemWhereClause(filters),
          linkedCuttingListId: { not: null },
          plan: {
            weekNumber,
            year,
          },
        },
      });

      const completionRate =
        weekItems > 0 ? (weekCompleted / weekItems) * 100 : 0;

      trends.push({
        week: weekNumber,
        year,
        itemCount: weekItems,
        completionRate: Math.round(completionRate * 100) / 100,
      });
    }

    return trends;
  }

  /**
   * Get top backorder items
   */
  private async getTopBackorders(
    limit: number,
    filters?: ProductionPlanFilters,
  ): Promise<
    Array<{
      id: string;
      ad: string;
      siparis: string;
      planlananBitisTarihi: string;
      daysOverdue: number;
      riskLevel: "high" | "medium" | "low";
    }>
  > {
    const backorderItems =
      await productionPlanService.getBackorderItems(filters);

    return backorderItems.slice(0, limit).map((item) => {
      const daysOverdue = this.calculateDaysOverdue(item.planlananBitisTarihi);
      const riskLevel = this.calculateRiskLevel(daysOverdue);

      return {
        id: item.id,
        ad: item.ad,
        siparis: item.siparis,
        planlananBitisTarihi:
          typeof item.planlananBitisTarihi === "string"
            ? item.planlananBitisTarihi
            : item.planlananBitisTarihi.toISOString(),
        daysOverdue,
        riskLevel,
      };
    });
  }

  /**
   * Build where clause for item filters
   */
  private buildItemWhereClause(
    filters?: ProductionPlanFilters,
  ): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (filters?.bolum) {
      const bolumMapping: Record<string, string> = {
        MONTAJ: "1",
        HELEZON: "3",
        KAYNAK: "4",
        BOYA: "6",
      };
      const mappedBolum = bolumMapping[filters.bolum] || filters.bolum;
      where.bolum = mappedBolum;
    }

    if (filters?.oncelik) {
      const oncelikMapping: Record<string, string> = {
        yuksek: "1",
        orta: "2",
        dusuk: "2",
      };
      const mappedOncelik = oncelikMapping[filters.oncelik] || filters.oncelik;
      where.oncelik = mappedOncelik;
    }

    if (filters?.status) {
      where.plan = { status: filters.status };
    }

    return where;
  }

  /**
   * Map department number to name
   */
  private mapDepartmentName(bolum: string): string {
    const mapping: Record<string, string> = {
      "1": "MONTAJ",
      "3": "HELEZON",
      "4": "KAYNAK",
      "6": "BOYA",
    };
    return mapping[bolum] || bolum;
  }

  /**
   * Map priority number to name
   */
  private mapPriorityName(oncelik: string): string {
    const mapping: Record<string, string> = {
      "1": "Yüksek",
      "2": "Orta/Düşük",
    };
    return mapping[oncelik] || oncelik;
  }

  /**
   * Calculate days overdue
   */
  private calculateDaysOverdue(planlananBitisTarihi: string | Date): number {
    const plannedDate =
      typeof planlananBitisTarihi === "string"
        ? new Date(planlananBitisTarihi)
        : planlananBitisTarihi;
    const today = new Date();
    const diffTime = today.getTime() - plannedDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate risk level based on days overdue
   */
  private calculateRiskLevel(daysOverdue: number): "high" | "medium" | "low" {
    if (daysOverdue >= 15) return "high";
    if (daysOverdue >= 7) return "medium";
    return "low";
  }

  /**
   * Get week number for a date
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}

export const statisticsService = new StatisticsService(
  productionPlanRepository,
);

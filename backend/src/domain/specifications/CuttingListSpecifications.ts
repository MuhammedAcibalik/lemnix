/**
 * Cutting List Specifications
 *
 * Business rules for querying cutting lists
 *
 * @module domain/specifications/CuttingListSpecifications
 * @version 1.0.0
 */

import { BaseSpecification } from "./BaseSpecification";
import { CuttingList } from "../entities/CuttingList";
import { CuttingListStatus } from "@prisma/client";
import { WeekNumber } from "../valueObjects/WeekNumber";

/**
 * Specification for cutting list by user
 */
export class CuttingListByUserSpecification extends BaseSpecification<CuttingList> {
  constructor(private readonly userId: string) {
    super();
  }

  public isSatisfiedBy(entity: CuttingList): boolean {
    return entity.userId === this.userId;
  }

  public toPrismaWhere(): Record<string, unknown> {
    return {
      userId: this.userId,
    };
  }
}

/**
 * Specification for cutting list by status
 */
export class CuttingListByStatusSpecification extends BaseSpecification<CuttingList> {
  constructor(private readonly status: CuttingListStatus) {
    super();
  }

  public isSatisfiedBy(entity: CuttingList): boolean {
    return entity.status === this.status;
  }

  public toPrismaWhere(): Record<string, unknown> {
    return {
      status: this.status,
    };
  }
}

/**
 * Specification for cutting list by week number
 */
export class CuttingListByWeekNumberSpecification extends BaseSpecification<CuttingList> {
  constructor(private readonly weekNumber: WeekNumber | null) {
    super();
  }

  public isSatisfiedBy(entity: CuttingList): boolean {
    if (this.weekNumber === null) {
      return entity.weekNumber === null || entity.weekNumber === undefined;
    }
    return entity.weekNumber?.equals(this.weekNumber) ?? false;
  }

  public toPrismaWhere(): Record<string, unknown> {
    if (this.weekNumber === null) {
      return {
        weekNumber: null,
      };
    }
    return {
      weekNumber: this.weekNumber.getValue(),
    };
  }
}

/**
 * Specification for cutting list by user and week number
 */
export class CuttingListByUserAndWeekSpecification extends BaseSpecification<CuttingList> {
  constructor(
    private readonly userId: string,
    private readonly weekNumber: WeekNumber | null,
  ) {
    super();
  }

  public isSatisfiedBy(entity: CuttingList): boolean {
    if (entity.userId !== this.userId) {
      return false;
    }
    if (this.weekNumber === null) {
      return entity.weekNumber === null || entity.weekNumber === undefined;
    }
    return entity.weekNumber?.equals(this.weekNumber) ?? false;
  }

  public toPrismaWhere(): Record<string, unknown> {
    const where: Record<string, unknown> = {
      userId: this.userId,
    };
    if (this.weekNumber === null) {
      where.weekNumber = null;
    } else {
      where.weekNumber = this.weekNumber.getValue();
    }
    return where;
  }
}

/**
 * Specification for cutting list search
 */
export class CuttingListSearchSpecification extends BaseSpecification<CuttingList> {
  constructor(private readonly searchTerm: string) {
    super();
  }

  public isSatisfiedBy(entity: CuttingList): boolean {
    const term = this.searchTerm.toLowerCase();
    return (
      entity.name.toLowerCase().includes(term) ||
      (entity.description?.toLowerCase().includes(term) ?? false)
    );
  }

  public toPrismaWhere(): Record<string, unknown> {
    return {
      OR: [
        {
          name: {
            contains: this.searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: this.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    };
  }
}

/**
 * Base Specification Implementation
 *
 * Base class for specifications
 *
 * @module domain/specifications/BaseSpecification
 * @version 1.0.0
 */

import { ISpecification } from "./ISpecification";

/**
 * Base specification implementation
 */
export abstract class BaseSpecification<T> implements ISpecification<T> {
  /**
   * Check if entity satisfies specification
   */
  public abstract isSatisfiedBy(entity: T): boolean;

  /**
   * Convert to Prisma where clause
   */
  public abstract toPrismaWhere(): Record<string, unknown>;

  /**
   * Combine with another specification (AND)
   */
  public and(other: ISpecification<T>): ISpecification<T> {
    return new AndSpecification(this, other);
  }

  /**
   * Combine with another specification (OR)
   */
  public or(other: ISpecification<T>): ISpecification<T> {
    return new OrSpecification(this, other);
  }

  /**
   * Negate specification (NOT)
   */
  public not(): ISpecification<T> {
    return new NotSpecification(this);
  }
}

/**
 * AND specification
 */
class AndSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly left: ISpecification<T>,
    private readonly right: ISpecification<T>,
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) && this.right.isSatisfiedBy(entity);
  }

  public toPrismaWhere(): Record<string, unknown> {
    return {
      AND: [this.left.toPrismaWhere(), this.right.toPrismaWhere()],
    };
  }
}

/**
 * OR specification
 */
class OrSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly left: ISpecification<T>,
    private readonly right: ISpecification<T>,
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) || this.right.isSatisfiedBy(entity);
  }

  public toPrismaWhere(): Record<string, unknown> {
    return {
      OR: [this.left.toPrismaWhere(), this.right.toPrismaWhere()],
    };
  }
}

/**
 * NOT specification
 */
class NotSpecification<T> extends BaseSpecification<T> {
  constructor(private readonly specification: ISpecification<T>) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    return !this.specification.isSatisfiedBy(entity);
  }

  public toPrismaWhere(): Record<string, unknown> {
    return {
      NOT: this.specification.toPrismaWhere(),
    };
  }
}

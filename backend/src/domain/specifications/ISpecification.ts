/**
 * Specification Pattern Interface
 *
 * Encapsulates business rules for querying
 *
 * @module domain/specifications/ISpecification
 * @version 1.0.0
 */

/**
 * Specification interface for query building
 */
export interface ISpecification<T> {
  /**
   * Check if entity satisfies specification
   */
  isSatisfiedBy(entity: T): boolean;

  /**
   * Convert to Prisma where clause
   */
  toPrismaWhere(): Record<string, unknown>;

  /**
   * Combine with another specification (AND)
   */
  and(other: ISpecification<T>): ISpecification<T>;

  /**
   * Combine with another specification (OR)
   */
  or(other: ISpecification<T>): ISpecification<T>;

  /**
   * Negate specification (NOT)
   */
  not(): ISpecification<T>;
}

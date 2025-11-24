/**
 * Week Number Value Object
 *
 * Represents a week number (1-53) with validation
 *
 * @module domain/valueObjects/WeekNumber
 * @version 1.0.0
 */

export class WeekNumber {
  private constructor(private readonly value: number) {
    if (!Number.isInteger(value)) {
      throw new Error("Week number must be an integer");
    }
    if (value < 1 || value > 53) {
      throw new Error("Week number must be between 1 and 53");
    }
  }

  /**
   * Create a WeekNumber from a number
   */
  public static create(value: number): WeekNumber {
    return new WeekNumber(value);
  }

  /**
   * Create a WeekNumber from a nullable number
   */
  public static fromNullable(
    value: number | null | undefined,
  ): WeekNumber | null {
    if (value === null || value === undefined) {
      return null;
    }
    return new WeekNumber(value);
  }

  /**
   * Get the numeric value
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * Check equality
   */
  public equals(other: WeekNumber | null | undefined): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Convert to string
   */
  public toString(): string {
    return this.value.toString();
  }
}

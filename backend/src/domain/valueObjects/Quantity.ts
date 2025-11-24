/**
 * Quantity Value Object
 *
 * Represents a quantity (positive integer) with validation
 *
 * @module domain/valueObjects/Quantity
 * @version 1.0.0
 */

export class Quantity {
  private constructor(private readonly value: number) {
    if (!Number.isInteger(value)) {
      throw new Error("Quantity must be an integer");
    }
    if (value <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
  }

  /**
   * Create a Quantity from a number
   */
  public static create(value: number): Quantity {
    return new Quantity(value);
  }

  /**
   * Create a Quantity from a nullable number
   */
  public static fromNullable(
    value: number | null | undefined,
  ): Quantity | null {
    if (value === null || value === undefined) {
      return null;
    }
    return new Quantity(value);
  }

  /**
   * Get the numeric value
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * Add quantities
   */
  public add(other: Quantity): Quantity {
    return new Quantity(this.value + other.value);
  }

  /**
   * Subtract quantities
   */
  public subtract(other: Quantity): Quantity {
    const result = this.value - other.value;
    if (result <= 0) {
      throw new Error("Quantity cannot be negative");
    }
    return new Quantity(result);
  }

  /**
   * Multiply quantity
   */
  public multiply(factor: number): Quantity {
    if (factor <= 0 || !Number.isInteger(factor)) {
      throw new Error("Factor must be a positive integer");
    }
    return new Quantity(this.value * factor);
  }

  /**
   * Check equality
   */
  public equals(other: Quantity | null | undefined): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Check if greater than
   */
  public isGreaterThan(other: Quantity): boolean {
    return this.value > other.value;
  }

  /**
   * Check if less than
   */
  public isLessThan(other: Quantity): boolean {
    return this.value < other.value;
  }

  /**
   * Convert to string
   */
  public toString(): string {
    return this.value.toString();
  }
}

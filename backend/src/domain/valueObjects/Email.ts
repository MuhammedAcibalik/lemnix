/**
 * Email Value Object
 *
 * Represents an email address with validation
 *
 * @module domain/valueObjects/Email
 * @version 1.0.0
 */

export class Email {
  private constructor(private readonly value: string) {
    if (!value || typeof value !== "string") {
      throw new Error("Email must be a non-empty string");
    }
    if (value.length > 255) {
      throw new Error("Email must be 255 characters or less");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error("Invalid email format");
    }
  }

  /**
   * Create an Email from a string
   */
  public static create(value: string): Email {
    return new Email(value.toLowerCase().trim());
  }

  /**
   * Get the string value
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Check equality
   */
  public equals(other: Email | null | undefined): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Convert to string
   */
  public toString(): string {
    return this.value;
  }
}

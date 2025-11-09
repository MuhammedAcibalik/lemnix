/**
 * LEMNİX Shared Common Types
 * Domain-agnostic common types
 *
 * @module shared/types
 * @version 1.0.0 - FSD Compliant
 */

/**
 * Brand type for nominal typing
 */
type Brand<K, T> = K & { __brand: T };

/**
 * Unique identifier (UUID or similar)
 */
export type ID = Brand<string, "ID">;

/**
 * ISO 8601 timestamp string
 */
export type Timestamp = Brand<string, "Timestamp">;

/**
 * Email address
 */
export type Email = Brand<string, "Email">;

/**
 * URL string
 */
export type URL = Brand<string, "URL">;

/**
 * Generic metadata object
 */
export interface Metadata {
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly createdBy?: ID;
  readonly updatedBy?: ID;
  readonly version?: number;
}

/**
 * Entity with ID and metadata
 */
export interface Entity {
  readonly id: ID;
  readonly metadata: Metadata;
}

/**
 * Loadable state for async operations
 */
export type LoadableState<T, E = Error> =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "success"; readonly data: T }
  | { readonly status: "error"; readonly error: E };

/**
 * Result type for operations
 */
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * Option type for nullable values
 */
export type Option<T> = T | null | undefined;

/**
 * Non-empty array
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Coordinates (for maps, charts)
 */
export interface Coordinates {
  readonly x: number;
  readonly y: number;
}

/**
 * Dimensions
 */
export interface Dimensions {
  readonly width: number;
  readonly height: number;
}

/**
 * Range
 */
export interface Range {
  readonly min: number;
  readonly max: number;
}

/**
 * Color (hex string)
 */
export type Color = Brand<string, "Color">;

/**
 * Percentage (0-100)
 */
export type Percentage = Brand<number, "Percentage">;

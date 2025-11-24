/**
 * @fileoverview Cutting List Type Definitions
 * @module types/cuttingList
 * @version 1.0.0
 * @description Shared type definitions for cutting list domain
 */

import type { CuttingListStatus, ItemPriority } from "./index";

/**
 * Profile item interface
 */
export interface ProfileItem {
  readonly id: string;
  readonly profile?: string;
  readonly measurement: string;
  readonly quantity: number;
}

/**
 * Cutting list item interface
 * ✅ ALIGNED with frontend WorkOrderItem type
 */
export interface CuttingListItem {
  readonly id: string;
  readonly workOrderId: string;
  readonly date: string;
  readonly version: string;
  readonly color: string;
  readonly note?: string;
  readonly orderQuantity: number;
  readonly size: string;
  readonly profiles: ReadonlyArray<ProfileItem>;
  readonly status?: "draft" | "ready" | "processing" | "completed";
  readonly priority?: "low" | "medium" | "high" | "urgent";
  readonly createdAt?: string; // ISO timestamp
  readonly updatedAt?: string; // ISO timestamp
}

/**
 * Product section interface
 */
export interface ProductSection {
  readonly id: string;
  readonly productName: string;
  readonly items: ReadonlyArray<CuttingListItem>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Cutting list interface
 */
export interface CuttingList {
  readonly id: string;
  readonly title: string;
  readonly weekNumber: number;
  readonly sections: ReadonlyArray<ProductSection>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Work order template interface
 */
export interface WorkOrderTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly profiles: ReadonlyArray<ProfileTemplate>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Profile template interface
 */
export interface ProfileTemplate {
  readonly id: string;
  readonly profile: string;
  readonly measurement: string;
  readonly quantity: number;
}

/**
 * Normalized priority type
 */
export type NormalizedPriority = "low" | "medium" | "high" | "urgent";

/**
 * Normalize item priority to standard format
 */
export const normalizeItemPriority = (
  priority: string | null | undefined,
): NormalizedPriority => {
  const normalized = priority?.toString().toLowerCase();
  switch (normalized) {
    case "low":
    case "medium":
    case "high":
    case "urgent":
      return normalized;
    default:
      return "medium";
  }
};

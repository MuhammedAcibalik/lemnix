/**
 * LEMNİX Cutting List Entity Types
 * Domain types for cutting list operations
 *
 * @module entities/cutting-list/model
 * @version 1.0.0 - FSD Compliant
 */

// Type aliases
type ID = string;
type Timestamp = string;

/**
 * Profile item
 */
export interface ProfileItem {
  readonly id: ID;
  readonly profile?: string;
  readonly measurement: string;
  readonly quantity: number;
}

/**
 * Cutting list item (aligned with backend WorkOrderItem)
 */
export interface CuttingListItem {
  readonly id: ID;
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
  readonly createdAt?: Timestamp;
  readonly updatedAt?: Timestamp;
}

/**
 * Product section
 */
export interface ProductSection {
  readonly id: ID;
  readonly productName: string;
  readonly items: ReadonlyArray<CuttingListItem>;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

/**
 * Cutting list
 */
export interface CuttingList {
  readonly id: ID;
  readonly title: string;
  readonly weekNumber: number;
  readonly sections: ReadonlyArray<ProductSection>;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

/**
 * Create cutting list request
 */
export interface CreateCuttingListRequest {
  readonly name: string; // Backend expects 'name', not 'title'
  readonly weekNumber: number;
}

/**
 * Add product section request
 */
export interface AddProductSectionRequest {
  readonly productName: string;
}

/**
 * Add item request
 */
export interface AddItemRequest {
  readonly workOrderId: string;
  readonly date: string;
  readonly version: string;
  readonly color: string;
  readonly note?: string;
  readonly orderQuantity: number;
  readonly size: string;
  readonly profiles: ReadonlyArray<ProfileItem>;
  readonly priority?: "low" | "medium" | "high" | "urgent";
}

/**
 * Update item request
 */
export interface UpdateItemRequest extends Partial<AddItemRequest> {
  // Allows partial updates
}

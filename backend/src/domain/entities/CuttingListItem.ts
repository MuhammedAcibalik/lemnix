/**
 * Cutting List Item Domain Entity
 *
 * Represents a single item in a cutting list
 *
 * @module domain/entities/CuttingListItem
 * @version 1.0.0
 */

import { Quantity } from "../valueObjects/Quantity";
import { CuttingListStatus, ItemPriority } from "@prisma/client";

export interface CuttingListItemProps {
  readonly id: string;
  readonly workOrderId: string;
  readonly date?: string;
  readonly color: string;
  readonly version: string;
  readonly size: string;
  readonly profileType: string;
  readonly length: number; // mm
  readonly quantity: Quantity;
  readonly orderQuantity?: Quantity;
  readonly cuttingPattern?: string;
  readonly notes?: string;
  readonly priority: ItemPriority;
  readonly status: CuttingListStatus;
  readonly cuttingListId: string;
  readonly materialDescription?: string;
  readonly materialNumber?: string;
  readonly productionPlanItemId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Cutting List Item Domain Entity
 */
export class CuttingListItem {
  private constructor(private readonly props: CuttingListItemProps) {
    this.validate();
  }

  /**
   * Create a new CuttingListItem
   */
  public static create(
    props: Omit<CuttingListItemProps, "createdAt" | "updatedAt">,
  ): CuttingListItem {
    return new CuttingListItem({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Reconstruct from persistence
   */
  public static fromPersistence(props: CuttingListItemProps): CuttingListItem {
    return new CuttingListItem(props);
  }

  /**
   * Validate entity invariants
   */
  private validate(): void {
    if (!this.props.id || this.props.id.trim().length === 0) {
      throw new Error("CuttingListItem id is required");
    }
    if (!this.props.workOrderId || this.props.workOrderId.trim().length === 0) {
      throw new Error("CuttingListItem workOrderId is required");
    }
    if (
      !this.props.cuttingListId ||
      this.props.cuttingListId.trim().length === 0
    ) {
      throw new Error("CuttingListItem cuttingListId is required");
    }
    if (this.props.length <= 0) {
      throw new Error("CuttingListItem length must be greater than 0");
    }
    if (this.props.workOrderId.length > 100) {
      throw new Error(
        "CuttingListItem workOrderId must be 100 characters or less",
      );
    }
    if (this.props.profileType.length > 100) {
      throw new Error(
        "CuttingListItem profileType must be 100 characters or less",
      );
    }
  }

  // Getters
  public get id(): string {
    return this.props.id;
  }

  public get workOrderId(): string {
    return this.props.workOrderId;
  }

  public get date(): string | undefined {
    return this.props.date;
  }

  public get color(): string {
    return this.props.color;
  }

  public get version(): string {
    return this.props.version;
  }

  public get size(): string {
    return this.props.size;
  }

  public get profileType(): string {
    return this.props.profileType;
  }

  public get length(): number {
    return this.props.length;
  }

  public get quantity(): Quantity {
    return this.props.quantity;
  }

  public get orderQuantity(): Quantity | undefined {
    return this.props.orderQuantity;
  }

  public get cuttingPattern(): string | undefined {
    return this.props.cuttingPattern;
  }

  public get notes(): string | undefined {
    return this.props.notes;
  }

  public get priority(): ItemPriority {
    return this.props.priority;
  }

  public get status(): CuttingListStatus {
    return this.props.status;
  }

  public get cuttingListId(): string {
    return this.props.cuttingListId;
  }

  public get materialDescription(): string | undefined {
    return this.props.materialDescription;
  }

  public get materialNumber(): string | undefined {
    return this.props.materialNumber;
  }

  public get productionPlanItemId(): string | undefined {
    return this.props.productionPlanItemId;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Update quantity
   */
  public updateQuantity(quantity: Quantity): CuttingListItem {
    return new CuttingListItem({
      ...this.props,
      quantity,
      updatedAt: new Date(),
    });
  }

  /**
   * Update status
   */
  public updateStatus(status: CuttingListStatus): CuttingListItem {
    return new CuttingListItem({
      ...this.props,
      status,
      updatedAt: new Date(),
    });
  }

  /**
   * Update priority
   */
  public updatePriority(priority: ItemPriority): CuttingListItem {
    return new CuttingListItem({
      ...this.props,
      priority,
      updatedAt: new Date(),
    });
  }

  /**
   * Calculate total length
   */
  public getTotalLength(): number {
    return this.props.length * this.props.quantity.getValue();
  }
}

/**
 * @fileoverview Work Order Template Service
 * @module WorkOrderTemplateService
 * @version 1.0.0
 * @description Handles work order template management and duplication
 */

interface ProfileTemplate {
  readonly id: string;
  readonly profile: string;
  readonly measurement: string;
  readonly quantity: number;
}

interface WorkOrderTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly profiles: readonly ProfileTemplate[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface WorkOrderItem {
  readonly id: string;
  readonly workOrderId: string;
  readonly date: string;
  readonly version: string;
  readonly color: string;
  readonly note?: string;
  readonly orderQuantity: number;
  readonly size: string;
  readonly profiles: readonly ProfileTemplate[];
}

/**
 * Service for managing work order templates
 * Follows Single Responsibility Principle (SRP)
 */
export class WorkOrderTemplateService {
  private templates: Map<string, WorkOrderTemplate>;

  constructor() {
    this.templates = new Map();
    // Initialize with empty templates
    // In future, this could load from database
  }

  /**
   * Get all work order templates
   */
  public getTemplates(limit: number = 20): WorkOrderTemplate[] {
    const allTemplates = Array.from(this.templates.values());
    return allTemplates.slice(0, limit);
  }

  /**
   * Get a specific template by ID
   */
  public getTemplateById(id: string): WorkOrderTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Create a new template
   */
  public createTemplate(template: WorkOrderTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Duplicate a work order with smart modifications
   */
  public duplicateWorkOrder(
    workOrderId: string,
    sourceWorkOrder?: WorkOrderItem,
  ): WorkOrderItem {
    const now = new Date().toISOString();
    const dateStr = now.split("T")[0];

    // If source work order is provided, use its data
    if (sourceWorkOrder) {
      return {
        id: `duplicate-${workOrderId}-${Date.now()}`,
        workOrderId: `DUP-${workOrderId}`,
        date: dateStr,
        version: "1.0",
        color: sourceWorkOrder.color,
        note: `Duplicated from ${workOrderId}`,
        orderQuantity: sourceWorkOrder.orderQuantity,
        size: sourceWorkOrder.size,
        profiles: sourceWorkOrder.profiles.map((p) => ({
          ...p,
          id: `dup-${p.id}`,
        })),
      };
    }

    // Otherwise create a basic duplicate
    return {
      id: `duplicate-${workOrderId}-${Date.now()}`,
      workOrderId: `DUP-${workOrderId}`,
      date: dateStr,
      version: "1.0",
      color: "Duplicated",
      note: "Duplicated work order",
      orderQuantity: 1,
      size: "Standard",
      profiles: [],
    };
  }

  /**
   * Get available sizes for work orders
   */
  public getAvailableSizes(): string[] {
    // This could be loaded from configuration or database
    return [
      "60x60",
      "70x70",
      "80x80",
      "90x90",
      "100x100",
      "50x100",
      "60x120",
      "Custom",
    ];
  }
}

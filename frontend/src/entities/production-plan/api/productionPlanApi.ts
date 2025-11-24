/**
 * @fileoverview Production Plan API Client
 * @module entities/production-plan/api
 * @version 1.0.0
 */

import { api } from "@/shared/api/client";
import type {
  ProductionPlan,
  ProductionPlanItem,
  ProductionPlanFilters,
  ProductionPlanMetrics,
  UploadProductionPlanResponse,
  ProductionPlanListResponse,
  ProductionPlanMetricsResponse,
  BackorderItem,
  ProductionPlanStatistics,
} from "../model/types";

type ProductionPlanResponse = {
  success: boolean;
  data: ProductionPlan | null;
};

type ProductionPlanItemsResponse = {
  success: boolean;
  data: ProductionPlan["items"] | null;
};

export class ProductionPlanApi {
  private readonly baseUrl = "/production-plan";

  /**
   * Upload Excel file and create production plan
   */
  async uploadProductionPlan(
    file: File,
  ): Promise<UploadProductionPlanResponse> {
    const formData = new FormData();
    formData.append("file", file); // Field name MUST be 'file'

    // Log for debugging
    console.log("[API] Uploading file:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const response = await api.post<UploadProductionPlanResponse>(
      `${this.baseUrl}/upload`,
      formData,
    );

    if (!response.success || !response.data) {
      throw new Error("Failed to upload production plan");
    }

    return response.data;
  }

  /**
   * Get production plans with filters - ALWAYS from database only
   */
  async getProductionPlans(
    filters: ProductionPlanFilters = {},
  ): Promise<ProductionPlanListResponse> {
    const params = new URLSearchParams();

    if (filters.weekNumber)
      params.append("weekNumber", filters.weekNumber.toString());
    if (filters.year) params.append("year", filters.year.toString());
    if (filters.status) params.append("status", filters.status);
    if (filters.bolum) params.append("bolum", filters.bolum);
    if (filters.oncelik) params.append("oncelik", filters.oncelik);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    // Force fresh data from database - bypass all cache
    const response = await api.get<ProductionPlanListResponse>(
      `${this.baseUrl}?${params.toString()}`,
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );

    if (!response.success || !response.data) {
      throw new Error("Failed to fetch production plans");
    }

    console.log("📊 [API] Data fetched from database:", {
      success: response.success,
      dataLength: response.data.data?.length || 0,
      pagination: response.data.pagination,
      source: "database-only",
    });

    return response.data;
  }

  /**
   * Get single production plan by ID
   */
  async getProductionPlanById(id: string): Promise<ProductionPlan> {
    const response = await api.get<ProductionPlanResponse>(
      `${this.baseUrl}/${id}`,
    );

    if (!response.success || !response.data) {
      throw new Error("Production plan not found");
    }

    return response.data as unknown as ProductionPlan;
  }

  /**
   * Get production plan by week and year
   */
  async getProductionPlanByWeek(
    weekNumber: number,
    year: number,
  ): Promise<ProductionPlan> {
    const response = await api.get<ProductionPlanResponse>(
      `${this.baseUrl}/week/${weekNumber}/${year}`,
    );

    if (!response.success || !response.data) {
      throw new Error("Production plan not found");
    }

    return response.data as unknown as ProductionPlan;
  }

  /**
   * Delete production plan (soft delete)
   */
  async deleteProductionPlan(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`${this.baseUrl}/${id}`);

    if (!response.success) {
      throw new Error("Failed to delete production plan");
    }

    return {
      success: response.data.success,
      message: response.data.message,
    };
  }

  async deleteAllProductionPlans(): Promise<{
    success: boolean;
    message: string;
    count: number;
  }> {
    const response = await api.delete<{
      success: boolean;
      message: string;
      count: number;
    }>(this.baseUrl);

    if (!response.success || !response.data) {
      throw new Error("Failed to delete all production plans");
    }

    return {
      success: response.data.success,
      message: response.data.message,
      count: response.data.count,
    };
  }

  /**
   * Get production plan metrics
   */
  async getProductionPlanMetrics(
    filters: Pick<ProductionPlanFilters, "weekNumber" | "year" | "status"> = {},
  ): Promise<ProductionPlanMetrics> {
    const params = new URLSearchParams();

    if (filters.weekNumber)
      params.append("weekNumber", filters.weekNumber.toString());
    if (filters.year) params.append("year", filters.year.toString());
    if (filters.status) params.append("status", filters.status);

    const response = await api.get<ProductionPlanMetricsResponse>(
      `${this.baseUrl}/metrics?${params.toString()}`,
    );

    if (!response.success || !response.data) {
      throw new Error("Failed to fetch metrics");
    }

    return (response.data as unknown as ProductionPlanMetricsResponse).data;
  }

  /**
   * Get production plan items by work order ID
   */
  async getProductionPlanItemsByWorkOrder(
    workOrderId: string,
  ): Promise<ProductionPlan["items"]> {
    const response = await api.get<ProductionPlanItemsResponse>(
      `${this.baseUrl}/items/work-order/${workOrderId}`,
    );

    if (!response.success || !response.data) {
      throw new Error("Production plan items not found");
    }

    return response.data.data ?? [];
  }

  /**
   * Plan itemlarından kesim listesi oluştur
   */
  async createCuttingListFromPlan(request: {
    productionPlanItems: Array<{
      planItemId: string;
      profileType: string;
      length: number;
      quantity: number;
    }>;
    cuttingListMetadata: {
      name: string;
      description?: string;
    };
  }): Promise<{
    success: boolean;
    data?: {
      cuttingListId: string;
      name: string;
      itemCount: number;
      linkedPlanItems: string[];
    };
    error?: string;
  }> {
    const response = await api.post<{
      success: boolean;
      data?: {
        cuttingListId: string;
        name: string;
        itemCount: number;
        linkedPlanItems: string[];
      };
      error?: string;
    }>(`${this.baseUrl}/create-cutting-list`, request);

    if (!response.success || !response.data) {
      throw new Error(response.data?.error || "Failed to create cutting list");
    }

    return response.data;
  }

  /**
   * Kesim listesi ile bağlantılı plan itemlarını getir
   */
  async getLinkedPlanItems(
    cuttingListId: string,
  ): Promise<ProductionPlanItem[]> {
    const response = await api.get<{
      success: boolean;
      data: ProductionPlanItem[];
      error?: string;
    }>(`${this.baseUrl}/cutting-list/${cuttingListId}/plan-items`);

    if (!response.success || !response.data) {
      const errorMessage = (response.data as { error?: string })?.error;
      throw new Error(errorMessage || "Linked plan items not found");
    }

    return response.data.data;
  }

  /**
   * Plan item ile kesim listesi arasındaki linki kaldır
   */
  async unlinkPlanItemFromCuttingList(planItemId: string): Promise<void> {
    const response = await api.delete<{
      success: boolean;
      message?: string;
      error?: string;
    }>(`${this.baseUrl}/plan-item/${planItemId}/unlink`);

    if (!response.success) {
      const errorMessage = (response.data as { error?: string })?.error;
      throw new Error(errorMessage || "Failed to unlink plan item");
    }
  }

  /**
   * Get backorder items
   */
  async getBackorderItems(
    filters: ProductionPlanFilters = {},
  ): Promise<BackorderItem[]> {
    const params = new URLSearchParams();
    if (filters.bolum) params.append("bolum", filters.bolum);
    if (filters.oncelik) params.append("oncelik", filters.oncelik);
    if (filters.status) params.append("status", filters.status);

    const response = await api.get<{
      success: boolean;
      data: BackorderItem[];
    }>(`${this.baseUrl}/backorder?${params.toString()}`);

    if (!response.success || !response.data) {
      throw new Error("Failed to fetch backorder items");
    }

    return response.data.data;
  }

  /**
   * Get production plan statistics
   */
  async getStatistics(
    filters: ProductionPlanFilters = {},
  ): Promise<ProductionPlanStatistics> {
    const params = new URLSearchParams();
    if (filters.bolum) params.append("bolum", filters.bolum);
    if (filters.oncelik) params.append("oncelik", filters.oncelik);
    if (filters.status) params.append("status", filters.status);

    const response = await api.get<{
      success: boolean;
      data: ProductionPlanStatistics;
    }>(`${this.baseUrl}/statistics?${params.toString()}`);

    if (!response.success || !response.data) {
      throw new Error("Failed to fetch statistics");
    }

    return response.data.data;
  }
}

export const productionPlanApi = new ProductionPlanApi();

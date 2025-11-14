import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/shared/api/client";
import { ProductionPlanApi } from "../productionPlanApi";

vi.mock("@/shared/api/client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api, { deep: true });
const productionPlanApi = new ProductionPlanApi();

describe("ProductionPlanApi", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
    mockedApi.delete.mockReset();

    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it("uses circuit-protected helper to fetch production plans", async () => {
    mockedApi.get.mockResolvedValue({
      success: true,
      data: {
        success: true,
        data: [],
        pagination: { page: 1, limit: 25, total: 0 },
      },
    });

    const result = await productionPlanApi.getProductionPlans({
      status: "active",
    });

    expect(mockedApi.get).toHaveBeenCalledWith(
      "/production-plan?status=active",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }),
      }),
    );
    expect(result).toEqual({
      success: true,
      data: [],
      pagination: { page: 1, limit: 25, total: 0 },
    });
  });

  it("throws when a production plan cannot be found", async () => {
    mockedApi.get.mockResolvedValue({
      success: true,
      data: {
        success: false,
        data: undefined,
      },
    });

    await expect(
      productionPlanApi.getProductionPlanById("missing-plan"),
    ).rejects.toThrow("Production plan not found");
  });

  it("throws when unlinking plan item fails", async () => {
    mockedApi.delete.mockResolvedValue({
      success: true,
      data: {
        success: false,
        error: "Breaker prevented unlink",
      },
    });

    await expect(
      productionPlanApi.unlinkPlanItemFromCuttingList("item-1"),
    ).rejects.toThrow("Breaker prevented unlink");
    expect(mockedApi.delete).toHaveBeenCalledWith(
      "/production-plan/plan-item/item-1/unlink",
    );
  });

  it("propagates circuit breaker errors from helper", async () => {
    const breakerError = new Error("Circuit OPEN: api-backend");
    mockedApi.get.mockRejectedValue(breakerError);

    await expect(productionPlanApi.getProductionPlans()).rejects.toThrow(
      breakerError,
    );
  });
});

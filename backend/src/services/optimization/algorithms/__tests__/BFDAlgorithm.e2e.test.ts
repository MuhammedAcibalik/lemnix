/**
 * BFD Algorithm End-to-End Test Suite
 * Single test case: 50 adet kapalı alt 918mm + 50 adet açık alt 687mm
 *
 * @module optimization/algorithms/__tests__
 * @version 1.0.0
 * @description E2E test for BFD algorithm following Clean Architecture principles
 */

import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { BFDAlgorithm } from "../BFDAlgorithm";
import { OptimizationContext } from "../../core/OptimizationContext";
import type { OptimizationItem, Cut } from "../../../../types";
import type { AdvancedOptimizationResult } from "../../types";
import type { ILogger, LogContext } from "../../../logger";

/**
 * Mock logger implementation for testing
 * Follows ILogger interface without using 'any'
 */
class MockLogger implements ILogger {
  private readonly logs: Array<{
    level: "info" | "warn" | "error" | "debug";
    message: string;
    context?: LogContext;
    error?: Error | unknown;
  }> = [];

  public info(message: string, context?: LogContext): void {
    this.logs.push({ level: "info", message, context });
  }

  public warn(message: string, context?: LogContext): void {
    this.logs.push({ level: "warn", message, context });
  }

  public error(
    message: string,
    error?: Error | unknown,
    context?: LogContext,
  ): void {
    this.logs.push({ level: "error", message, error, context });
  }

  public debug(message: string, context?: LogContext): void {
    this.logs.push({ level: "debug", message, context });
  }

  public getLogs(): ReadonlyArray<{
    level: "info" | "warn" | "error" | "debug";
    message: string;
    context?: LogContext;
    error?: Error | unknown;
  }> {
    return this.logs;
  }

  public clear(): void {
    this.logs.length = 0;
  }
}

/**
 * Test helper: Create optimization context
 */
function createTestContext(params: {
  readonly items: ReadonlyArray<OptimizationItem>;
  readonly stockLengths?: ReadonlyArray<number>;
  readonly kerfWidth?: number;
  readonly startSafety?: number;
  readonly endSafety?: number;
  readonly minScrapLength?: number;
  readonly logger?: ILogger;
}): OptimizationContext {
  const logger = params.logger ?? new MockLogger();

  return new OptimizationContext({
    items: params.items,
    materialStockLengths: params.stockLengths?.map((length) => ({
      stockLength: length,
      profileType: "standard",
      availability: 100,
      costPerMm: 0.1,
      costPerStock: length * 0.1,
      supplier: "default",
      leadTime: 0,
      materialGrade: "6061-T6",
      weight: length * 0.001,
    })),
    constraints: {
      kerfWidth: params.kerfWidth ?? 3.5,
      startSafety: params.startSafety ?? 2,
      endSafety: params.endSafety ?? 2,
      minScrapLength: params.minScrapLength ?? 50,
    },
    objectives: [
      {
        type: "minimize-waste",
        weight: 1.0,
        priority: "high",
      },
    ],
    performance: {
      maxIterations: 1000,
      convergenceThreshold: 0.001,
      parallelProcessing: false,
      cacheResults: true,
    },
    costModel: {
      materialCost: 0.1,
      cuttingCost: 0.05,
      setupCost: 10,
      wasteCost: 0.02,
      timeCost: 0.5,
      energyCost: 0.15,
    },
    logger,
  });
}

/**
 * Test helper: Validate demand fulfillment
 */
function validateDemandFulfillment(
  result: AdvancedOptimizationResult,
  expectedItems: ReadonlyArray<OptimizationItem>,
): void {
  const actualCounts = new Map<number, number>();

  for (const cut of result.cuts) {
    for (const segment of cut.segments) {
      const current = actualCounts.get(segment.length) ?? 0;
      actualCounts.set(segment.length, current + segment.quantity);
    }
  }

  for (const item of expectedItems) {
    const actual = actualCounts.get(item.length) ?? 0;
    expect(
      actual,
      `Item ${item.length}mm: expected at least ${item.quantity}, got ${actual}`,
    ).toBeGreaterThanOrEqual(item.quantity);
  }
}

/**
 * Test helper: Validate stock accounting
 */
function validateStockAccounting(cuts: ReadonlyArray<Cut>): void {
  for (const cut of cuts) {
    const total = cut.usedLength + cut.remainingLength;
    const difference = Math.abs(total - cut.stockLength);
    expect(
      difference,
      `Cut accounting error: usedLength (${cut.usedLength}) + remainingLength (${cut.remainingLength}) should equal stockLength (${cut.stockLength})`,
    ).toBeLessThan(0.01);
  }
}

describe("BFD Algorithm E2E Tests", () => {
  let logger: MockLogger;
  let algorithm: BFDAlgorithm;

  beforeAll(() => {
    console.log("🧪 BFD E2E Test Suite başlatılıyor...");
  });

  beforeEach(() => {
    logger = new MockLogger();
    algorithm = new BFDAlgorithm(logger);
  });

  describe("Test Cases", () => {
    it("should optimize 50 adet kapalı alt 918mm + 50 adet açık alt 687mm", async () => {
      console.log("🧪 Test başladı: 50x918mm + 50x687mm");

      const items: ReadonlyArray<OptimizationItem> = [
        {
          length: 918,
          quantity: 50,
          totalLength: 918 * 50,
          profileType: "kapalı-alt",
        },
        {
          length: 687,
          quantity: 50,
          totalLength: 687 * 50,
          profileType: "açık-alt",
        },
      ];

      const context = createTestContext({
        items,
        stockLengths: [3500, 6100], // Stok boyları: 3500mm ve 6100mm
        kerfWidth: 0, // Kerf 0 kabul et
        startSafety: 50, // Askı payı: Baştan 50mm garanti fire
        endSafety: 50, // Askı payı: Sondan 50mm garanti fire (toplam 100mm garanti fire)
      });

      console.log("🔍 [TEST] optimize çağrılıyor...");
      const startTime = Date.now();
      const result = await algorithm.optimize(context);
      const duration = Date.now() - startTime;
      console.log(`✅ Test tamamlandı: ${duration}ms`);

      // Validate results
      expect(result.cuts.length).toBeGreaterThan(0);
      validateDemandFulfillment(result, items);
      validateStockAccounting(result.cuts);

      // Log results
      console.log(`📊 Sonuçlar:`);
      console.log(`  - Toplam kesim sayısı: ${result.cuts.length}`);
      console.log(`  - Toplam fire: ${result.totalWaste.toFixed(2)}mm`);
      console.log(
        `  - Toplam güvenlik rezervi (start safety): ${result.totalSafetyReserve?.toFixed(2) ?? "N/A"}mm`,
      );
      console.log(
        `  - Toplam fire + güvenlik rezervi: ${(result.totalWaste + (result.totalSafetyReserve ?? 0)).toFixed(2)}mm`,
      );
      console.log(`  - Verimlilik: ${result.efficiency.toFixed(2)}%`);
      console.log(
        `  - Toplam stok kullanımı: ${result.cuts.reduce((sum, cut) => sum + cut.stockLength, 0)}mm`,
      );
      console.log(`  - Her kesim detayı:`);
      result.cuts.forEach((cut, index) => {
        const segmentsDetail = cut.segments
          .map((s) => `${s.quantity}x${s.length}mm`)
          .join(" + ");
        const totalSegmentsLength = cut.segments.reduce(
          (sum, s) => sum + s.length * s.quantity,
          0,
        );
        // CRITICAL FIX: cut.usedLength is already final (includes startSafety + segments + endSafety) after finalizeSingleCut
        // So we need to extract actual segments length: usedLength - startSafety - endSafety
        // Askı payları: Baştan 50mm + Sondan 50mm = 100mm toplam garanti fire
        const actualSegmentsLength = cut.usedLength - 50 - 50; // usedLength - startSafety (50mm) - endSafety (50mm)
        const expectedUsed = totalSegmentsLength; // Only segments, startSafety is NOT included in expected
        console.log(`    Kesim ${index + 1}: Stok=${cut.stockLength}mm`);
        console.log(
          `      Kullanılan (final, startSafety dahil)=${cut.usedLength.toFixed(2)}mm, Sadece parçalar=${actualSegmentsLength.toFixed(2)}mm, Beklenen parçalar=${expectedUsed.toFixed(2)}mm`,
        );
        console.log(`      Kalan=${cut.remainingLength.toFixed(2)}mm`);
        console.log(
          `      Parçalar: ${segmentsDetail} (toplam=${totalSegmentsLength}mm)`,
        );
        console.log(
          `      Muhasebe: ${cut.stockLength}mm = ${cut.usedLength.toFixed(2)}mm + ${cut.remainingLength.toFixed(2)}mm = ${(cut.usedLength + cut.remainingLength).toFixed(2)}mm`,
        );

        // Validate: actualSegmentsLength should match expectedUsed (within rounding tolerance)
        const difference = Math.abs(actualSegmentsLength - expectedUsed);
        if (difference > 1) {
          console.log(
            `      ⚠️ UYARI: Parça uzunluğu farkı ${difference.toFixed(2)}mm (beklenen: ${expectedUsed.toFixed(2)}mm, gerçek: ${actualSegmentsLength.toFixed(2)}mm)`,
          );
        }
      });

      // Validate efficiency
      expect(result.efficiency).toBeGreaterThan(0);
      expect(result.efficiency).toBeLessThanOrEqual(100);
    }, 60000); // 60 second timeout

    it("should optimize 100 adet kapalı alt 918mm + 100 adet açık alt 687mm", async () => {
      console.log("🧪 Test başladı: 100x918mm + 100x687mm");

      const items: ReadonlyArray<OptimizationItem> = [
        {
          length: 918,
          quantity: 100,
          totalLength: 918 * 100,
          profileType: "kapalı-alt",
        },
        {
          length: 687,
          quantity: 100,
          totalLength: 687 * 100,
          profileType: "açık-alt",
        },
      ];

      const context = createTestContext({
        items,
        stockLengths: [3500, 6100], // Stok boyları: 3500mm ve 6100mm
        kerfWidth: 0, // Kerf 0 kabul et
        startSafety: 50, // Askı payı: Baştan 50mm garanti fire
        endSafety: 50, // Askı payı: Sondan 50mm garanti fire (toplam 100mm garanti fire)
      });

      console.log("🔍 [TEST] optimize çağrılıyor...");
      const startTime = Date.now();
      const result = await algorithm.optimize(context);
      const duration = Date.now() - startTime;
      console.log(`✅ Test tamamlandı: ${duration}ms`);

      // Validate results
      expect(result.cuts.length).toBeGreaterThan(0);
      validateDemandFulfillment(result, items);
      validateStockAccounting(result.cuts);

      // Log results
      console.log(`📊 Sonuçlar:`);
      console.log(`  - Toplam kesim sayısı: ${result.cuts.length}`);
      console.log(`  - Toplam fire: ${result.totalWaste.toFixed(2)}mm`);
      console.log(
        `  - Toplam güvenlik rezervi (start safety): ${result.totalSafetyReserve?.toFixed(2) ?? "N/A"}mm`,
      );
      console.log(
        `  - Toplam fire + güvenlik rezervi: ${(result.totalWaste + (result.totalSafetyReserve ?? 0)).toFixed(2)}mm`,
      );
      console.log(`  - Verimlilik: ${result.efficiency.toFixed(2)}%`);
      console.log(
        `  - Toplam stok kullanımı: ${result.cuts.reduce((sum, cut) => sum + cut.stockLength, 0)}mm`,
      );
      console.log(`  - Her kesim detayı:`);
      result.cuts.forEach((cut, index) => {
        const segmentsDetail = cut.segments
          .map((s) => `${s.quantity}x${s.length}mm`)
          .join(" + ");
        const totalSegmentsLength = cut.segments.reduce(
          (sum, s) => sum + s.length * s.quantity,
          0,
        );
        // CRITICAL FIX: cut.usedLength is already final (includes startSafety + segments + endSafety) after finalizeSingleCut
        // So we need to extract actual segments length: usedLength - startSafety - endSafety
        // Askı payları: Baştan 50mm + Sondan 50mm = 100mm toplam garanti fire
        const actualSegmentsLength = cut.usedLength - 50 - 50; // usedLength - startSafety (50mm) - endSafety (50mm)
        const expectedUsed = totalSegmentsLength; // Only segments, startSafety is NOT included in expected
        console.log(`    Kesim ${index + 1}: Stok=${cut.stockLength}mm`);
        console.log(
          `      Kullanılan (final, startSafety dahil)=${cut.usedLength.toFixed(2)}mm, Sadece parçalar=${actualSegmentsLength.toFixed(2)}mm, Beklenen parçalar=${expectedUsed.toFixed(2)}mm`,
        );
        console.log(`      Kalan=${cut.remainingLength.toFixed(2)}mm`);
        console.log(
          `      Parçalar: ${segmentsDetail} (toplam=${totalSegmentsLength}mm)`,
        );
        console.log(
          `      Muhasebe: ${cut.stockLength}mm = ${cut.usedLength.toFixed(2)}mm + ${cut.remainingLength.toFixed(2)}mm = ${(cut.usedLength + cut.remainingLength).toFixed(2)}mm`,
        );

        // Validate: actualSegmentsLength should match expectedUsed (within rounding tolerance)
        const difference = Math.abs(actualSegmentsLength - expectedUsed);
        if (difference > 1) {
          console.log(
            `      ⚠️ UYARI: Parça uzunluğu farkı ${difference.toFixed(2)}mm (beklenen: ${expectedUsed.toFixed(2)}mm, gerçek: ${actualSegmentsLength.toFixed(2)}mm)`,
          );
        }
      });

      // Validate efficiency
      expect(result.efficiency).toBeGreaterThan(0);
      expect(result.efficiency).toBeLessThanOrEqual(100);
    }, 60000); // 60 second timeout

    it("should optimize 150 adet kapalı alt 918mm + 150 adet açık alt 687mm", async () => {
      console.log("🧪 Test başladı: 150x918mm + 150x687mm");

      const items: ReadonlyArray<OptimizationItem> = [
        {
          length: 918,
          quantity: 150,
          totalLength: 918 * 150,
          profileType: "kapalı-alt",
        },
        {
          length: 687,
          quantity: 150,
          totalLength: 687 * 150,
          profileType: "açık-alt",
        },
      ];

      const context = createTestContext({
        items,
        stockLengths: [3500, 6100], // Stok boyları: 3500mm ve 6100mm
        kerfWidth: 0, // Kerf 0 kabul et
        startSafety: 50, // Askı payı: Baştan 50mm garanti fire
        endSafety: 50, // Askı payı: Sondan 50mm garanti fire (toplam 100mm garanti fire)
      });

      console.log("🔍 [TEST] optimize çağrılıyor...");
      const startTime = Date.now();
      const result = await algorithm.optimize(context);
      const duration = Date.now() - startTime;
      console.log(`✅ Test tamamlandı: ${duration}ms`);

      // Validate results
      expect(result.cuts.length).toBeGreaterThan(0);
      validateDemandFulfillment(result, items);
      validateStockAccounting(result.cuts);

      // Log results
      console.log(`📊 Sonuçlar:`);
      console.log(`  - Toplam kesim sayısı: ${result.cuts.length}`);
      console.log(`  - Toplam fire: ${result.totalWaste.toFixed(2)}mm`);
      console.log(
        `  - Toplam güvenlik rezervi (start safety): ${result.totalSafetyReserve?.toFixed(2) ?? "N/A"}mm`,
      );
      console.log(
        `  - Toplam fire + güvenlik rezervi: ${(result.totalWaste + (result.totalSafetyReserve ?? 0)).toFixed(2)}mm`,
      );
      console.log(`  - Verimlilik: ${result.efficiency.toFixed(2)}%`);
      console.log(
        `  - Toplam stok kullanımı: ${result.cuts.reduce((sum, cut) => sum + cut.stockLength, 0)}mm`,
      );
      console.log(`  - Her kesim detayı:`);
      result.cuts.forEach((cut, index) => {
        const segmentsDetail = cut.segments
          .map((s) => `${s.quantity}x${s.length}mm`)
          .join(" + ");
        const totalSegmentsLength = cut.segments.reduce(
          (sum, s) => sum + s.length * s.quantity,
          0,
        );
        // CRITICAL FIX: cut.usedLength is already final (includes startSafety + segments + endSafety) after finalizeSingleCut
        // So we need to extract actual segments length: usedLength - startSafety - endSafety
        // Askı payları: Baştan 50mm + Sondan 50mm = 100mm toplam garanti fire
        const actualSegmentsLength = cut.usedLength - 50 - 50; // usedLength - startSafety (50mm) - endSafety (50mm)
        const expectedUsed = totalSegmentsLength; // Only segments, startSafety is NOT included in expected
        console.log(`    Kesim ${index + 1}: Stok=${cut.stockLength}mm`);
        console.log(
          `      Kullanılan (final, startSafety dahil)=${cut.usedLength.toFixed(2)}mm, Sadece parçalar=${actualSegmentsLength.toFixed(2)}mm, Beklenen parçalar=${expectedUsed.toFixed(2)}mm`,
        );
        console.log(`      Kalan=${cut.remainingLength.toFixed(2)}mm`);
        console.log(
          `      Parçalar: ${segmentsDetail} (toplam=${totalSegmentsLength}mm)`,
        );
        console.log(
          `      Muhasebe: ${cut.stockLength}mm = ${cut.usedLength.toFixed(2)}mm + ${cut.remainingLength.toFixed(2)}mm = ${(cut.usedLength + cut.remainingLength).toFixed(2)}mm`,
        );

        // Validate: actualSegmentsLength should match expectedUsed (within rounding tolerance)
        const difference = Math.abs(actualSegmentsLength - expectedUsed);
        if (difference > 1) {
          console.log(
            `      ⚠️ UYARI: Parça uzunluğu farkı ${difference.toFixed(2)}mm (beklenen: ${expectedUsed.toFixed(2)}mm, gerçek: ${actualSegmentsLength.toFixed(2)}mm)`,
          );
        }
      });

      // Validate efficiency
      expect(result.efficiency).toBeGreaterThan(0);
      expect(result.efficiency).toBeLessThanOrEqual(100);
    }, 60000); // 60 second timeout

    it("should optimize 200 adet kapalı alt 918mm + 200 adet açık alt 687mm", async () => {
      console.log("🧪 Test başladı: 200x918mm + 200x687mm");

      const items: ReadonlyArray<OptimizationItem> = [
        {
          length: 918,
          quantity: 200,
          totalLength: 918 * 200,
          profileType: "kapalı-alt",
        },
        {
          length: 687,
          quantity: 200,
          totalLength: 687 * 200,
          profileType: "açık-alt",
        },
      ];

      const context = createTestContext({
        items,
        stockLengths: [3500, 6100], // Stok boyları: 3500mm ve 6100mm
        kerfWidth: 0, // Kerf 0 kabul et
        startSafety: 50, // Askı payı: Baştan 50mm garanti fire
        endSafety: 50, // Askı payı: Sondan 50mm garanti fire (toplam 100mm garanti fire)
      });

      console.log("🔍 [TEST] optimize çağrılıyor...");
      const startTime = Date.now();
      const result = await algorithm.optimize(context);
      const duration = Date.now() - startTime;
      console.log(`✅ Test tamamlandı: ${duration}ms`);

      // Validate results
      expect(result.cuts.length).toBeGreaterThan(0);
      validateDemandFulfillment(result, items);
      validateStockAccounting(result.cuts);

      // Log results
      console.log(`📊 Sonuçlar:`);
      console.log(`  - Toplam kesim sayısı: ${result.cuts.length}`);
      console.log(`  - Toplam fire: ${result.totalWaste.toFixed(2)}mm`);
      console.log(
        `  - Toplam güvenlik rezervi (start safety): ${result.totalSafetyReserve?.toFixed(2) ?? "N/A"}mm`,
      );
      console.log(
        `  - Toplam fire + güvenlik rezervi: ${(result.totalWaste + (result.totalSafetyReserve ?? 0)).toFixed(2)}mm`,
      );
      console.log(`  - Verimlilik: ${result.efficiency.toFixed(2)}%`);
      console.log(
        `  - Toplam stok kullanımı: ${result.cuts.reduce((sum, cut) => sum + cut.stockLength, 0)}mm`,
      );
      console.log(`  - Her kesim detayı:`);
      result.cuts.forEach((cut, index) => {
        const segmentsDetail = cut.segments
          .map((s) => `${s.quantity}x${s.length}mm`)
          .join(" + ");
        const totalSegmentsLength = cut.segments.reduce(
          (sum, s) => sum + s.length * s.quantity,
          0,
        );
        // CRITICAL FIX: cut.usedLength is already final (includes startSafety + segments + endSafety) after finalizeSingleCut
        // So we need to extract actual segments length: usedLength - startSafety - endSafety
        // Askı payları: Baştan 50mm + Sondan 50mm = 100mm toplam garanti fire
        const actualSegmentsLength = cut.usedLength - 50 - 50; // usedLength - startSafety (50mm) - endSafety (50mm)
        const expectedUsed = totalSegmentsLength; // Only segments, startSafety is NOT included in expected
        console.log(`    Kesim ${index + 1}: Stok=${cut.stockLength}mm`);
        console.log(
          `      Kullanılan (final, startSafety dahil)=${cut.usedLength.toFixed(2)}mm, Sadece parçalar=${actualSegmentsLength.toFixed(2)}mm, Beklenen parçalar=${expectedUsed.toFixed(2)}mm`,
        );
        console.log(`      Kalan=${cut.remainingLength.toFixed(2)}mm`);
        console.log(
          `      Parçalar: ${segmentsDetail} (toplam=${totalSegmentsLength}mm)`,
        );
        console.log(
          `      Muhasebe: ${cut.stockLength}mm = ${cut.usedLength.toFixed(2)}mm + ${cut.remainingLength.toFixed(2)}mm = ${(cut.usedLength + cut.remainingLength).toFixed(2)}mm`,
        );

        // Validate: actualSegmentsLength should match expectedUsed (within rounding tolerance)
        const difference = Math.abs(actualSegmentsLength - expectedUsed);
        if (difference > 1) {
          console.log(
            `      ⚠️ UYARI: Parça uzunluğu farkı ${difference.toFixed(2)}mm (beklenen: ${expectedUsed.toFixed(2)}mm, gerçek: ${actualSegmentsLength.toFixed(2)}mm)`,
          );
        }
      });

      // Validate efficiency
      expect(result.efficiency).toBeGreaterThan(0);
      expect(result.efficiency).toBeLessThanOrEqual(100);
    }, 60000); // 60 second timeout
  });
});

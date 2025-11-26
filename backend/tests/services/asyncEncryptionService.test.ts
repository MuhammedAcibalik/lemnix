import { describe, expect, it } from "vitest";
import { AsyncEncryptionService } from "../../src/services/asyncEncryptionService";

const createService = () => new AsyncEncryptionService();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("AsyncEncryptionService - processWithConcurrency", () => {
  it("limits simultaneously running tasks to the provided concurrency", async () => {
    const service = createService();
    const observedConcurrency: number[] = [];
    let activeTasks = 0;

    const tasks = Array.from({ length: 10 }, (_, index) => async () => {
      activeTasks += 1;
      observedConcurrency.push(activeTasks);
      await delay(5);
      activeTasks -= 1;
      return index;
    });

    const results = await (service as unknown as {
      processWithConcurrency: <T>(
        taskFactories: Array<() => Promise<T>>,
        concurrency: number,
      ) => Promise<T[]>;
    }).processWithConcurrency(tasks, 3);

    expect(results).toEqual(
      Array.from({ length: tasks.length }, (_, index) => index),
    );
    expect(Math.max(...observedConcurrency)).toBeLessThanOrEqual(3);
  });

  it("preserves result ordering even when tasks resolve out of order", async () => {
    const service = createService();

    const tasks = [
      async () => {
        await delay(10);
        return "first";
      },
      async () => "second",
      async () => {
        await delay(5);
        return "third";
      },
    ];

    const results = await (service as unknown as {
      processWithConcurrency: <T>(
        taskFactories: Array<() => Promise<T>>,
        concurrency: number,
      ) => Promise<T[]>;
    }).processWithConcurrency(tasks, 2);

    expect(results).toEqual(["first", "second", "third"]);
  });
});

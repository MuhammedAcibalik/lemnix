import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type Redis from "ioredis";
import RedisMock from "ioredis-mock";

import { SessionManager } from "../../src/middleware/authentication";
import { RedisSessionStore } from "../../src/middleware/sessionStore";
import { UserRole } from "../../src/middleware/authorization";

describe("SessionManager persistence", () => {
  let redis: RedisMock;

  beforeEach(() => {
    redis = new RedisMock();
  });

  afterEach(async () => {
    await redis.flushall();
    await redis.quit();
  });

  it("validates sessions across manager instances using Redis store", async () => {
    const storeA = new RedisSessionStore(redis as unknown as Redis);
    const managerA = new SessionManager(storeA);

    const sessionId = await managerA.createSession("user-123", UserRole.ADMIN);
    const firstValidation = await managerA.validateSession(sessionId, "token-initial");
    expect(firstValidation).toBe(true);

    const storeB = new RedisSessionStore(redis as unknown as Redis);
    const managerB = new SessionManager(storeB);
    const crossInstanceValidation = await managerB.validateSession(
      sessionId,
      "token-cross-instance",
    );
    expect(crossInstanceValidation).toBe(true);

    await managerA.invalidateSession(sessionId);
    const validationAfterInvalidation = await managerB.validateSession(
      sessionId,
      "token-after-invalidation",
    );
    expect(validationAfterInvalidation).toBe(false);
  });
});

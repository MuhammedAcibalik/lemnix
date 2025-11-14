import { describe, expect, it } from "vitest";

import { Permission, UserRole, getMockUser } from "./usePermissions";

describe("getMockUser", () => {
  it("matches the backend development token shape", () => {
    const user = getMockUser();

    expect(user.userId).toBe("dev-user");
    expect(user.role).toBe(UserRole.PLANNER);
    expect(user.permissions).toEqual([
      Permission.VIEW_CUTTING_PLANS,
      Permission.VIEW_OPTIMIZATION_RESULTS,
    ]);
  });
});

import { describe, it, expect } from "vitest";
import { AuthorityGuard } from "../../src/security/AuthorityGuard";
import { AgentContext } from "../../src/domain/AgentContext";

describe("AuthorityGuard - override attack", () => {
  it("strips forbidden override fields", () => {
    const guard = new AuthorityGuard();
    const payload = { data: 1, overrideScore: 99, newBudget: 500 };
    const result = guard.sanitize(payload);
    expect(result.rejected).toEqual(expect.arrayContaining(["overrideScore", "newBudget"]));
    expect(result.sanitized).not.toHaveProperty("overrideScore");
    expect(result.sanitized).not.toHaveProperty("newBudget");
  });

  it("enforces tier whitelist", () => {
    const guard = new AuthorityGuard();
    const ctx: AgentContext = { agentId: "a", tenantId: "t1", userTier: "free", skill: "plan" };
    expect(() => guard.enforceTier(ctx)).toThrow(/not allowed/);
  });
});

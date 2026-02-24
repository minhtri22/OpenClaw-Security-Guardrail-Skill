import { describe, it, expect } from "vitest";
import { AuthorityGuard } from "../../src/security/AuthorityGuard";
import { AgentContext } from "../../src/domain/AgentContext";

describe("AuthorityGuard - cross-tenant leak", () => {
  it("rejects payload that leaks another tenant", () => {
    const guard = new AuthorityGuard();
    const ctx: AgentContext = { agentId: "agent-1", tenantId: "tenant-A", userTier: "pro", skill: "scan" };
    const payload = { tenantId: "tenant-B", data: "something" };

    expect(() => guard.enforceTenant(payload, ctx)).toThrow(/cross-tenant/);
  });
});

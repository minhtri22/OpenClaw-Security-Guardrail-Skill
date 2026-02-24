import { describe, it, expect } from "vitest";
import { z } from "zod";
import { SchemaGuard } from "../../src/security/SchemaGuard";

describe("SchemaGuard - byzantine output", () => {
  it("rejects output that fails schema", () => {
    const guard = new SchemaGuard();
    const schema = z.object({
      tenantId: z.string(),
      result: z.string(),
    });

    const payload = { tenantId: "t1", result: "ok", unexpected: "hack" };

    expect(() => guard.validate(payload, schema)).toThrow();
  });

  it("rejects payload with sensitive fields", () => {
    const guard = new SchemaGuard();
    const schema = z.object({ value: z.string() });
    const payload = { apiKey: "secret", value: "x" };
    expect(() => guard.validate(payload, schema)).toThrow(/sensitive field/);
  });
});

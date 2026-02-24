import { describe, it, expect } from "vitest";
import { SandboxWrapper } from "../../src/security/SandboxWrapper";

describe("SandboxWrapper - resource exhaustion", () => {
  it("terminates long-running task via timeout", async () => {
    const sandbox = new SandboxWrapper();

    const task = () =>
      sandbox.execute(
        async (signal) => {
          while (true) {
            if (signal.aborted) {
              throw new DOMException("Aborted", "AbortError");
            }
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
        },
        { timeoutMs: 100 }
      );

    await expect(task()).rejects.toThrow(/timed out|aborted/);
  });
});

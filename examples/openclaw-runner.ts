import { createSecurityGuardrail } from "../src";
import { z } from "zod";

async function main() {
  const guardrail = createSecurityGuardrail(".data-security");
  await guardrail.trust.load();

  const context = { agentId: "agent-demo", tenantId: "tenant-1", userTier: "pro", skill: "scan" };
  guardrail.authority.enforceTier(context);

  const result = await guardrail.sandbox.execute(async (signal) => {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    return { tenantId: "tenant-1", result: "ok" };
  });

  const schema = z.object({ tenantId: z.string(), result: z.string() });
  const validated = guardrail.schema.validate(result, schema);
  guardrail.authority.enforceTenant(validated, context);

  await guardrail.trust.recordResult(context.agentId, true);
  console.log("Validated result", validated);
}

main().catch((err) => {
  console.error("Guardrail blocked run:", err.message);
  process.exit(1);
});

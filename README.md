# OpenClaw Security Guardrail

Zero-Trust security sandbox for OpenClaw agents. Every agent output is treated as hostile; validation and sandboxing are deterministic and local-first.

## Quick Start
- `npm install`
- `npm run build`
- `npm run test`
- Use `createSecurityGuardrail()` to get `authority`, `schema`, `sandbox`, `trust`.

```ts
import { createSecurityGuardrail } from "openclaw-security-guardrail";
import { z } from "zod";

const guardrail = createSecurityGuardrail();
await guardrail.trust.load();

const context = { agentId: "a1", tenantId: "t1", userTier: "pro", skill: "scan" };
guardrail.authority.enforceTier(context);

const safe = guardrail.authority.sanitize({ result: "ok", overrideScore: 99 }).sanitized;
const schema = z.object({ result: z.string(), tenantId: z.string() });
guardrail.schema.validate({ result: "ok", tenantId: "t1" }, schema);

await guardrail.sandbox.execute(async (signal) => {
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  return "done";
});
```

## Security Policies
- **Skill whitelist** per tier is configured in `src/config/security.config.ts`.
- **Resource limits** (timeout 30s, 512MB RAM, 50% CPU best-effort, max payload 2MB).
- **Forbidden overrides**: `overrideScore`, `userTier`, `eligibility`, `newBudget` are stripped.
- **Schema enforcement**: strict JSON validation with payload size limit and sensitive-field detection.

## Developer Guide
1. Always pass `AgentContext` with `tenantId`, `userTier`, `skill`.
2. Wrap every agent call with `guardLlmCall` or manually chain:
   - `authority.enforceTier(context)`
   - `authority.sanitize(output)`
   - `schema.validate(output, schema)`
   - `sandbox.execute(fn, limits)` for skill execution
   - `trust.recordResult(agentId, success)`
3. Add per-model pricing or trust weights in config as needed.

## Folder Layout
- `src/security`: `AuthorityGuard`, `SchemaGuard`, `SandboxWrapper`, `TrustEngine`
- `src/domain`: `SecurityPolicy`, `AgentContext`
- `src/config`: `security.config.ts`
- `tests/adversarial`: override, cross-tenant, resource exhaustion, schema rejection
- `tests/unit`: trust engine persistence

## Notes
- Local-first: uses JSON files for trust store, no external infra required.
- Deterministic: no AI heuristics; all checks are rule-based.

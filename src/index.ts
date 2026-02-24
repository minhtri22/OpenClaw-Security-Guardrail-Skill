import { AuthorityGuard } from "./security/AuthorityGuard";
import { SchemaGuard } from "./security/SchemaGuard";
import { SandboxWrapper } from "./security/SandboxWrapper";
import { TrustEngine } from "./security/TrustEngine";
import { securityConfig } from "./config/security.config";
import { AgentContext } from "./domain/AgentContext";
import { SecurityPolicy } from "./domain/SecurityPolicy";

export {
  AuthorityGuard,
  SchemaGuard,
  SandboxWrapper,
  TrustEngine,
  securityConfig,
  AgentContext,
  SecurityPolicy,
};

export function createSecurityGuardrail(baseDir: string = "data") {
  const authority = new AuthorityGuard();
  const schema = new SchemaGuard();
  const sandbox = new SandboxWrapper();
  const trust = new TrustEngine(baseDir);
  return { authority, schema, sandbox, trust, config: securityConfig };
}

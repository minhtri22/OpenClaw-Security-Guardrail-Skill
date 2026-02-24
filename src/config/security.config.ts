import { SecurityPolicy } from "../domain/SecurityPolicy";

export const securityConfig: SecurityPolicy = {
  skillWhitelist: {
    free: ["scan", "summarize"],
    pro: ["scan", "summarize", "enrich", "plan"],
    enterprise: ["scan", "summarize", "enrich", "plan", "distribute"],
  },
  resourceLimits: {
    timeoutMs: 30_000,
    maxMemoryMb: 512,
    maxCpuPct: 50,
    maxPayloadBytes: 2 * 1024 * 1024,
  },
  maxPayloadBytes: 2 * 1024 * 1024,
};

export interface SkillWhitelist {
  [tier: string]: string[];
}

export interface ResourceLimits {
  timeoutMs: number;
  maxMemoryMb: number;
  maxCpuPct: number;
  maxPayloadBytes: number;
}

export interface SecurityPolicy {
  skillWhitelist: SkillWhitelist;
  resourceLimits: ResourceLimits;
  maxPayloadBytes?: number;
}

import { AgentContext } from "../domain/AgentContext";
import { securityConfig } from "../config/security.config";

export interface AuthorityGuardResult<T> {
  sanitized: T;
  rejected: string[];
}

const FORBIDDEN_FIELDS = ["overrideScore", "userTier", "eligibility", "newBudget"];

export class AuthorityGuard {
  sanitize<T extends Record<string, unknown>>(output: T): AuthorityGuardResult<T> {
    const clone: Record<string, unknown> = { ...output };
    const rejected: string[] = [];

    for (const field of FORBIDDEN_FIELDS) {
      if (field in clone) {
        delete clone[field];
        rejected.push(field);
      }
    }

    return { sanitized: clone as T, rejected };
  }

  enforceTier(context: AgentContext): void {
    const allowedSkills = securityConfig.skillWhitelist[context.userTier] || [];
    if (!allowedSkills.includes(context.skill)) {
      throw new Error(`AuthorityGuard: skill ${context.skill} not allowed for tier ${context.userTier}`);
    }
  }

  enforceTenant<T extends Record<string, unknown>>(output: T, context: AgentContext): void {
    const tenantId = (output as Record<string, unknown>).tenantId;
    if (tenantId && tenantId !== context.tenantId) {
      throw new Error("AuthorityGuard: cross-tenant data leak detected");
    }
  }
}

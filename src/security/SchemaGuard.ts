import { ZodSchema } from "zod";
import { securityConfig } from "../config/security.config";

const SENSITIVE_FIELD_REGEX = /(api|key|secret|token|password|credential)/i;

export interface SchemaGuardOptions {
  maxBytes?: number;
}

export class SchemaGuard {
  private sizeLimit(bytes: number | undefined): number {
    return bytes ?? securityConfig.maxPayloadBytes ?? securityConfig.resourceLimits.maxPayloadBytes;
  }

  validate<T>(payload: unknown, schema: ZodSchema<T>, options: SchemaGuardOptions = {}): T {
    const json = JSON.stringify(payload);
    if (Buffer.byteLength(json, "utf-8") > this.sizeLimit(options.maxBytes)) {
      throw new Error("SchemaGuard: payload exceeds maximum size");
    }

    this.assertNoSensitiveFields(payload);

    const strictSchema = (schema as unknown as { strict?: () => typeof schema }).strict
      ? (schema as unknown as { strict: () => typeof schema }).strict()
      : schema;

    const result = strictSchema.parse(payload);
    return result;
  }

  private assertNoSensitiveFields(payload: unknown): void {
    if (payload && typeof payload === "object") {
      const entries = Object.entries(payload as Record<string, unknown>);
      for (const [key, value] of entries) {
        if (SENSITIVE_FIELD_REGEX.test(key)) {
          throw new Error(`SchemaGuard: sensitive field detected (${key})`);
        }
        if (typeof value === "object" && value !== null) {
          this.assertNoSensitiveFields(value);
        }
      }
    }
  }
}

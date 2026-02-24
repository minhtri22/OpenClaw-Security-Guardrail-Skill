import { securityConfig } from "../config/security.config";

export interface SandboxOptions {
  timeoutMs?: number;
  maxMemoryMb?: number;
}

export class SandboxWrapper {
  async execute<T>(fn: (signal: AbortSignal) => Promise<T>, options: SandboxOptions = {}): Promise<T> {
    const timeoutMs = options.timeoutMs ?? securityConfig.resourceLimits.timeoutMs;
    const maxMemoryMb = options.maxMemoryMb ?? securityConfig.resourceLimits.maxMemoryMb;

    const controller = new AbortController();
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const memoryPoll = setInterval(() => {
      const rssMb = process.memoryUsage().rss / (1024 * 1024);
      if (rssMb > maxMemoryMb) {
        controller.abort();
      }
    }, 200);

    try {
      const result = await fn(controller.signal);
      if (timedOut) {
        throw new Error("Sandbox: execution timed out");
      }
      return result;
    } catch (err) {
      if (timedOut) {
        throw new Error("Sandbox: execution timed out");
      }
      if ((err as Error).name === "AbortError") {
        throw new Error("Sandbox: aborted due to resource limits");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
      clearInterval(memoryPoll);
    }
  }
}

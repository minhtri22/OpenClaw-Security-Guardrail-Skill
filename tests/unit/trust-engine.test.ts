import { describe, it, expect, beforeEach } from "vitest";
import { TrustEngine } from "../../src/security/TrustEngine";
import { promises as fs } from "fs";
import path from "path";

const baseDir = path.join(process.cwd(), ".tmp-trust");

beforeEach(async () => {
  await fs.rm(baseDir, { recursive: true, force: true });
});

describe("TrustEngine", () => {
  it("updates score based on successes and failures", async () => {
    const trust = new TrustEngine(baseDir);
    await trust.load();
    await trust.recordResult("a1", true);
    await trust.recordResult("a1", false);
    const score = trust.getScore("a1");
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it("persists scores to disk", async () => {
    const trust = new TrustEngine(baseDir);
    await trust.load();
    await trust.recordResult("a2", true);

    const trust2 = new TrustEngine(baseDir);
    await trust2.load();
    expect(trust2.getScore("a2")).toBeGreaterThan(0.5);
  });
});

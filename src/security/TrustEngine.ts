import { promises as fs } from "fs";
import path from "path";

interface AgentTrustRecord {
  agentId: string;
  success: number;
  failure: number;
  lastUpdated: number;
  score: number;
}

interface TrustStore {
  [agentId: string]: AgentTrustRecord;
}

export class TrustEngine {
  private store: TrustStore = {};
  constructor(private readonly baseDir: string = "data") {}

  private get filePath(): string {
    return path.join(this.baseDir, "trust-store.json");
  }

  async load(): Promise<void> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      this.store = JSON.parse(raw) as TrustStore;
    } catch {
      this.store = {};
    }
  }

  async save(): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(this.store, null, 2), "utf-8");
  }

  getScore(agentId: string): number {
    const record = this.store[agentId];
    if (!record) return 0.5; // neutral
    return record.score;
  }

  weightedScore(agentId: string, weight: number): number {
    return this.getScore(agentId) * weight;
  }

  async recordResult(agentId: string, success: boolean): Promise<number> {
    const rec = this.store[agentId] ?? {
      agentId,
      success: 0,
      failure: 0,
      lastUpdated: Date.now(),
      score: 0.5,
    };

    if (success) {
      rec.success += 1;
    } else {
      rec.failure += 1;
    }
    rec.lastUpdated = Date.now();
    const total = rec.success + rec.failure;
    rec.score = total > 0 ? rec.success / total : 0.5;

    this.store[agentId] = rec;
    await this.save();
    return rec.score;
  }
}

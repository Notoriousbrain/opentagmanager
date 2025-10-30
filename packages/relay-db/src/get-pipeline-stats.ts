import os from "node:os";

let stats = {
  batchesInserted: 0,
  batchesFailed: 0,
  totalEvents: 0,
  lastInsertMs: 0,
  lastError: null as string | null,
};

export function recordBatchSuccess(count: number, duration: number) {
  stats.batchesInserted++;
  stats.totalEvents += count;
  stats.lastInsertMs = duration;
}

export function recordBatchFailure(error?: unknown) {
  stats.batchesFailed++;
  stats.lastError = error instanceof Error ? error.message : String(error);
}

export function getPipelineStats() {
  return {
    ...stats,
    uptimeSec: Math.round(process.uptime()),
    memoryMB: Math.round(os.totalmem() / 1024 / 1024),
  };
}

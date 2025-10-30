export const metrics = {
  eventsProcessed: 0,
  batchesFlushed: 0,
  failedBatches: 0,
  lastFlushDurationMs: 0,
  lastFlushTime: 0,
};

export function recordBatchSuccess(count: number, durationMs: number) {
  metrics.eventsProcessed += count;
  metrics.batchesFlushed++;
  metrics.lastFlushDurationMs = durationMs;
  metrics.lastFlushTime = Date.now();
}

export function recordBatchFailure() {
  metrics.failedBatches++;
}

export function getMetrics() {
  return {
    ...metrics,
    uptimeMs: process.uptime() * 1000,
  };
}

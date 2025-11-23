import { getMetrics } from "../../relay-consumer/src/metrics";
import { logger } from "./logger";

let lastSnapshot: Record<string, unknown> | null = null;

export async function collectTelemetry() {
  const metrics = getMetrics();

  const snapshot = {
    ts: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    ...metrics,
  };

  lastSnapshot = snapshot;
  return snapshot;
}

export function getLastTelemetrySnapshot() {
  return lastSnapshot;
}

export async function emitTelemetryLog(intervalMs = 30000) {
  setInterval(async () => {
    const snap = await collectTelemetry();
    logger.info("Telemetry snapshot", snap);
  }, intervalMs);
}

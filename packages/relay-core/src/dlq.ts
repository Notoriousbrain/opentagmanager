import { mkdirSync, appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { RelayError } from "./errors";
import { logger } from "./logger";
import { traceScope } from "./trace";

// 🧩 import metrics from relay-hono (keep it optional)
let metrics: any;
try {
  // avoid circular import breaking builds — use dynamic require
  metrics = (await import("@otm/relay-hono")).metrics;
} catch {
  metrics = null;
}

interface DLQRecord {
  projectId: string;
  count: number;
  reason: string;
  kind: string;
  timestamp: string;
  events: unknown[];
}

const DLQ_DIR = join(process.cwd(), "dlq");

export function writeToDLQ(
  projectId: string,
  events: unknown[],
  err: unknown
): void {
  try {
    if (!existsSync(DLQ_DIR)) mkdirSync(DLQ_DIR, { recursive: true });

    const fileName = join(
      DLQ_DIR,
      `${new Date().toISOString().slice(0, 10)}.ndjson`
    );

    const record: DLQRecord = {
      projectId,
      count: events.length,
      reason:
        err instanceof RelayError
          ? err.code
          : ((err as Error).name ?? "UnknownError"),
      kind: err instanceof RelayError ? err.kind : "UNKNOWN",
      timestamp: new Date().toISOString(),
      events,
    };

    appendFileSync(fileName, JSON.stringify(record) + "\n");

    const first = (events as any[])[0];
    const traceId = first?.traceId ?? "no-trace";

    logger.warn(
      "DLQ write",
      traceScope(traceId, {
        projectId: record.projectId,
        count: record.count,
        reason: record.reason,
      })
    );

    if (metrics && typeof metrics.dlqWrites === "number") {
      metrics.dlqWrites += 1;
    }
  } catch (dlqErr) {
    logger.error("DLQ write failed", { error: (dlqErr as Error).message });
  }
}

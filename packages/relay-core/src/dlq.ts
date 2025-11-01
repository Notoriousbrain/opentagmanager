import { mkdirSync, appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { RelayError } from "./errors";

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
        err instanceof RelayError ? err.code : (err as Error).name ?? "UnknownError",
      kind: err instanceof RelayError ? err.kind : "UNKNOWN",
      timestamp: new Date().toISOString(),
      events,
    };

    appendFileSync(fileName, JSON.stringify(record) + "\n");

    console.warn(
      `⚠️  DLQ → Saved ${record.count} events for project ${record.projectId} (${record.reason})`
    );
  } catch (dlqErr) {
    console.error("❌ Failed to write to DLQ:", dlqErr);
  }
}

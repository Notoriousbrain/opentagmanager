import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { insertBatchToClickhouse } from "@otm/relay-consumer";
import type { NormalizedEvent } from "./types";

const DLQ_DIR = join(process.cwd(), "dlq");

export async function replayAllDLQ(): Promise<{
  files: number;
  total: number;
}> {
  const files = readdirSync(DLQ_DIR).filter((f) => f.endsWith(".ndjson"));
  let total = 0;

  for (const file of files) {
    const fullPath = join(DLQ_DIR, file);
    const lines = readFileSync(fullPath, "utf8").split("\n").filter(Boolean);

    for (const line of lines) {
      try {
        const record = JSON.parse(line);
        const events: NormalizedEvent[] = Array.isArray(record.events)
          ? record.events
          : [record];
        await insertBatchToClickhouse(events);
        total += events.length;
      } catch (err) {
        console.error(`⚠️ Failed to replay line in ${file}:`, err);
      }
    }
  }

  console.log(`🔁 Replayed ${total} events from ${files.length} DLQ files`);
  return { files: files.length, total };
}

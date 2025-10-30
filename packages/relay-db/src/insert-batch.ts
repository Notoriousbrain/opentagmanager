import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { getClickhouseClient } from "./client";
import { retryWithBackoff } from "@otm/core";

export interface InsertResult {
  filePath: string;
  rowsInserted: number;
  durationMs: number;
}

export async function insertBatchFromFile(
  filePath: string,
  table = "events_raw"
): Promise<InsertResult> {
  const client = getClickhouseClient();
  const start = Date.now();

  const rows: Record<string, unknown>[] = [];
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const evt = JSON.parse(line);
      rows.push(evt);
    } catch {
      console.error(`⚠️ Skipped invalid JSON line in ${filePath}`);
    }
  }

  if (rows.length === 0) {
    console.log(`⚠️ No valid rows found in ${filePath}`);
    return { filePath, rowsInserted: 0, durationMs: Date.now() - start };
  }

  await retryWithBackoff(async () => {
    await client.insert({
      table,
      values: rows,
      format: "JSONEachRow",
    });
  }, { attempts: 3, baseDelayMs: 1000 });

  const durationMs = Date.now() - start;
  console.log(`✅ Inserted ${rows.length} rows from ${filePath} in ${durationMs}ms`);

  return { filePath, rowsInserted: rows.length, durationMs };
}

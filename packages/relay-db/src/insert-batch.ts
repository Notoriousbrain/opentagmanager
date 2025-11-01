import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { getClickhouseClient } from "./client";
import {
  writeToDLQ,
  UpstreamUnavailableError,
  retryIfRetryable,
} from "@otm/relay-core";

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
  try {
    await retryIfRetryable(
      async () => {
        try {
          await client.insert({
            table,
            values: rows,
            format: "JSONEachRow",
          });
        } catch (err) {
          throw new UpstreamUnavailableError("ClickHouse bulk insert failed", {
            cause: err,
            detail: { filePath, rowCount: rows.length },
          });
        }
      },
      { attempts: 3, baseDelayMs: 1000 }
    );
  } catch (err) {
    console.error(
      `⚠️ Failed to insert ${rows.length} rows from ${filePath}:`,
      err
    );
    const projectId =
      typeof rows[0]?.project_id === "string"
        ? rows[0].project_id
        : "unknown_project";
    writeToDLQ(projectId, rows, err);
  }

  const durationMs = Date.now() - start;
  console.log(
    `✅ Inserted ${rows.length} rows from ${filePath} in ${durationMs}ms`
  );

  return { filePath, rowsInserted: rows.length, durationMs };
}

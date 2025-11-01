import { readdirSync, readFileSync, statSync } from "node:fs";
import * as path from "node:path";
import { getClickhouseClient } from "../packages/relay-db/src/client";
import { insertBatchToClickhouse } from "../packages/relay-consumer/src/insert-batch-to-clickhouse";
import type { NormalizedEvent } from "../packages/relay-core/src";

const DLQ_DIR = path.resolve(".dlq");

const client = getClickhouseClient();

async function eventExists(
  eventId: string,
  projectId: string
): Promise<boolean> {
  const query = `
    SELECT count() 
    FROM osstag.events_raw 
    WHERE event_id = {event_id:String} AND project_id = {project_id:String}
  `;
  const result = await client.query({
    query,
    format: "JSONEachRow",
    query_params: { event_id: eventId, project_id: projectId },
  });
  const rows = (await result.json()) as Array<{ count?: number }>;
  return (rows[0]?.count ?? 0) > 0;
}

async function replayAll() {
  const walk = (dir: string): string[] => {
    const entries = readdirSync(dir);
    const files: string[] = [];
    for (const e of entries) {
      const full = path.join(dir, e);
      const st = statSync(full);
      if (st.isDirectory()) files.push(...walk(full));
      else if (e.endsWith(".ndjson")) files.push(full);
    }
    return files;
  };

  const ndjsonFiles = walk(DLQ_DIR);
  console.log(`📂 Found ${ndjsonFiles.length} DLQ files`);

  for (const fullPath of ndjsonFiles) {
    console.log(`📥 Replaying ${fullPath}...`);
    const lines = readFileSync(fullPath, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean);
    const events: NormalizedEvent[] = lines.map((l) => JSON.parse(l));

    // 🔍 Deduplicate by checking existing event_ids
    const uniqueEvents: NormalizedEvent[] = [];
    for (const e of events) {
      const exists = await eventExists(e.eventId, e.projectId);
      if (!exists) uniqueEvents.push(e);
      else console.log(`⚠️ Skipping duplicate event_id=${e.eventId}`);
    }

    if (uniqueEvents.length > 0) {
      await insertBatchToClickhouse(uniqueEvents);
      console.log(`✅ Inserted ${uniqueEvents.length} unique events`);
    } else {
      console.log(`ℹ️ No unique events to insert from ${fullPath}`);
    }
  }

  console.log("✅ DLQ replay complete");
}

replayAll().catch((err) => {
  console.error("❌ Replay failed:", err);
});

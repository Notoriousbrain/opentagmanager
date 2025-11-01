import { readdirSync, statSync, rmSync } from "node:fs";
import * as path from "node:path";

const DLQ_DIR = path.resolve(".dlq");
const TTL_DAYS = Number(process.env.DLQ_TTL_DAYS ?? 7);
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

export function cleanOldDLQFiles() {
  const now = Date.now();
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

  const files = walk(DLQ_DIR);
  let removed = 0;

  for (const f of files) {
    const age = now - statSync(f).mtimeMs;
    if (age > TTL_MS) {
      rmSync(f);
      removed++;
    }
  }

  if (removed > 0)
    console.log(`🧹 Cleaned ${removed} DLQ files older than ${TTL_DAYS} days`);
}

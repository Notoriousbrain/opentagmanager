import { existsSync, mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const LOG_DIR = join(process.cwd(), "logs");
const LOG_FILE = join(LOG_DIR, "relay.log");

export function writeLogLine(obj: Record<string, unknown>) {
  const line = JSON.stringify({
    time: new Date().toISOString(),
    ...obj,
  });
  console.log(line);

  if (process.env.LOG_TO_FILE === "true") {
    if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
    appendFileSync(LOG_FILE, line + "\n");
  }
}

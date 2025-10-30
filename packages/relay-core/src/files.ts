import { join } from "node:path";

export const DEFAULT_FILE_LIMIT_BYTES = 10 * 1024 * 1024;

export function getRotatedFilename(base: string, dir = "/tmp") {
  return join(dir, `${base}-${Date.now()}.ndjson`);
}

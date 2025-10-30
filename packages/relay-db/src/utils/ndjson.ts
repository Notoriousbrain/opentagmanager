import { createInterface } from "node:readline";
import type { Readable } from "node:stream";

export async function* parseNDJSONStream(
  stream: Readable
): AsyncGenerator<any> {
  const rl = createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      yield JSON.parse(trimmed);
    } catch {
      console.error("⚠️ Skipped invalid JSON line:", trimmed);
    }
  }
}

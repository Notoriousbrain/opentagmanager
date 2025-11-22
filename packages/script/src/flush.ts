import { buildBatch } from "./batching/build-batch";
import { sendBatch } from "./transport";
import { getBackoffDelay } from "./batching/backoff";
import type { BatchPayload } from "@otm/types";
import { getState } from "./bootstrap/state";

const INGEST_URL = "/api/ingest";

async function trySend(batch: BatchPayload): Promise<boolean> {
  const body = JSON.stringify(batch);
  return sendBatch(INGEST_URL, body);
}

export async function flush(): Promise<void> {
  const batch = buildBatch();
  if (!batch) return;

  const { config } = getState();
  const url = config.ingestUrl;

  for (let attempt = 0; attempt < 5; attempt++) {
    const ok = await sendBatch(url, JSON.stringify(batch));
    if (ok) return;

    const delay = getBackoffDelay(attempt);
    await new Promise((r) => setTimeout(r, delay));
  }

  console.warn("[osstag] failed to send batch after retries");
}

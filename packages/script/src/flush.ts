import { sendBatch } from "./transport";
import { getBackoffDelay } from "./batching/backoff";
import { buildBatchBase } from "@otm/web";
import type { RawEvent } from "@otm/web";
import { getState } from "./bootstrap/state";
import { clearQueue, getQueue } from "./queue";
import { BatchPayload, Event } from "@otm/types";

function transformToEvent(raw: RawEvent): Event {
  return {
    ...raw,
    id: crypto.randomUUID(),
    url: location.href,
    referrer: document.referrer || null,
    props: raw.properties,

    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },

    region: null,

    context: {
      framework: "html",
    },
  } as Event;
}

export async function flush(): Promise<void> {
  const queue = getQueue();
  if (queue.length === 0) return;

  const { projectId, clientId, sessionId, config } = getState();

  const rawBatch = buildBatchBase({
    projectId,
    clientId,
    sessionId,
    events: queue,
  });

  const finalBatch: BatchPayload = {
    ...rawBatch,
    events: rawBatch.events.map(transformToEvent),
  };

  clearQueue();

  const url = config.ingestUrl;

  for (let attempt = 0; attempt < 5; attempt++) {
    const ok = await sendBatch(url, JSON.stringify(finalBatch));
    if (ok) return;

    const delay = getBackoffDelay(attempt);
    await new Promise((r) => setTimeout(r, delay));
  }

  console.warn("[osstag] failed to send batch after retries");
}

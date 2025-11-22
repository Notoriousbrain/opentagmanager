import type { BatchPayload } from "@otm/types";
import { getQueue, clearQueue } from "../queue";
import { getState } from "../bootstrap/state";

export function buildBatch(): BatchPayload | null {
  const events = getQueue();
  if (events.length === 0) return null;

  const { projectId, clientId, sessionId } = getState();

  const batch: BatchPayload = {
    projectId,
    clientId,
    sessionId,
    sentAt: new Date().toISOString(),
    events: [...events],
  };

  clearQueue();
  return batch;
}

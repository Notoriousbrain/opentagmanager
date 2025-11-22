import type { RawEvent } from "@otm/sdk";
import { getState } from "./bootstrap/state";
import { MAX_QUEUE_SIZE } from "./batching/constants";
import {
  loadQueueFromStorage,
  saveQueueToStorage,
} from "./persistance/storage";

const queue: RawEvent[] = loadQueueFromStorage();

export function enqueue(
  name: string,
  properties: Record<string, unknown> = {}
): void {
  const { clientId, sessionId } = getState();

  // Enforce queue max size
  if (queue.length >= MAX_QUEUE_SIZE) {
    queue.shift();
  }

  const evt: RawEvent = {
    name,
    properties,
    timestamp: new Date().toISOString(),
    clientId,
    sessionId,
    // NOTE: userId optional — added only via identify()
    // browser script's identify() should set state.userId
    ...(getState().userId ? { userId: getState().userId } : {}),
  };

  queue.push(evt);

  saveQueueToStorage(queue);
}

export function getQueue(): RawEvent[] {
  return queue;
}

export function clearQueue(): void {
  queue.length = 0;
  saveQueueToStorage(queue);
}

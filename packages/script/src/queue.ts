import { getState } from "./bootstrap/state";
import { MAX_QUEUE_SIZE } from "./batching/constants";
import {
  loadQueueFromStorage,
  saveQueueToStorage,
} from "./persistance/storage";
import { RawEvent } from "@otm/types";

const queue: RawEvent[] = loadQueueFromStorage();

export function enqueue(
  name: string,
  properties: Record<string, unknown> = {}
): void {
  const { clientId, sessionId } = getState();

  if (queue.length >= MAX_QUEUE_SIZE) {
    queue.shift();
  }

  const evt: RawEvent = {
    name,
    properties,
    timestamp: new Date().toISOString(),
    clientId,
    sessionId,
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

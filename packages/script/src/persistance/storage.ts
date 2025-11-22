import { storage } from "../bootstrap/storage";
import { MAX_QUEUE_SIZE } from "../batching/constants";
import { pruneOldEvents } from "./prune";
import { RawEvent } from "@otm/sdk";

const KEY = "__osstag_queue_v1";

export function saveQueueToStorage(queue: RawEvent[]): void {
  try {
    const serialized = JSON.stringify(queue);
    storage.set(KEY, serialized);
  } catch {}
}

export function loadQueueFromStorage(): RawEvent[] {
  try {
    const raw = storage.get(KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as RawEvent[];
    const pruned = pruneOldEvents(parsed);

    return pruned.slice(0, MAX_QUEUE_SIZE);
  } catch {
    return [];
  }
}

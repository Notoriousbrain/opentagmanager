import { storage } from "../bootstrap/storage";
import type { Event } from "@otm/types";
import { MAX_QUEUE_SIZE } from "../batching/constants";
import { pruneOldEvents } from "./prune";

const KEY = "__osstag_queue_v1";

export function saveQueueToStorage(queue: Event[]): void {
  try {
    const serialized = JSON.stringify(queue);
    storage.set(KEY, serialized);
  } catch {}
}

export function loadQueueFromStorage(): Event[] {
  try {
    const raw = storage.get(KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Event[];
    const pruned = pruneOldEvents(parsed);

    return pruned.slice(0, MAX_QUEUE_SIZE);
  } catch {
    return [];
  }
}

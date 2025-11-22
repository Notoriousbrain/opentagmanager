import type { EventProps, Event } from "@otm/types";
import { getState } from "./bootstrap/state";
import { MAX_QUEUE_SIZE } from "./batching/constants";

const queue: Event[] = [];

export function enqueue<T extends EventProps>(name: string, props: T): void {
  const { clientId, sessionId } = getState();

  if (queue.length >= MAX_QUEUE_SIZE) {
    queue.shift();
  }

  const evt: Event<T> = {
    id: crypto.randomUUID(),
    name,
    props,
    clientId,
    sessionId,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    referrer: document.referrer || null,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    region: null,
    context: {
      framework: "html",
    },
  };

  queue.push(evt);
}

export function getQueue(): Event[] {
  return queue;
}

export function clearQueue(): void {
  queue.length = 0;
}

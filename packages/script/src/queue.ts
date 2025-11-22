import type { EventProps, Event } from "@otm/types";
import { getState } from "./bootstrap/state";

const queue: Event[] = [];

export function enqueue<T extends EventProps>(name: string, props: T): void {
  const { clientId, sessionId } = getState();

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

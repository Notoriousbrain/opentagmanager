import { RawEvent } from "@otm/web";

export function pruneOldEvents(events: RawEvent[]): RawEvent[] {
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;

  return events.filter((e) => {
    const ts = new Date(e.timestamp).getTime();
    return !isNaN(ts) && ts > cutoff;
  });
}

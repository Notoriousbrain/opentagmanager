import type { Event } from "@otm/types";

export interface PruneConfig {
  pruneAfterMs: number;
}

export const DEFAULT_PRUNE_CONFIG: PruneConfig = {
  pruneAfterMs: 48 * 60 * 60 * 1000,
};

export function pruneOldEvents(
  events: Event[],
  config: PruneConfig = DEFAULT_PRUNE_CONFIG
): Event[] {
  const cutoff = Date.now() - config.pruneAfterMs;

  return events.filter((e) => {
    const ts = new Date(e.timestamp).getTime();
    return !isNaN(ts) && ts > cutoff;
  });
}

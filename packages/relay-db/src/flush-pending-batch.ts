import { retryWithBackoff } from "@otm/core";
import { insertBatchToClickhouse } from "@otm/relay-consumer";
import type { NormalizedEvent } from "@otm/relay-core";

let pending: NormalizedEvent[] = [];

export function queueForFlush(events: NormalizedEvent[]) {
  pending.push(...events);
}

export async function flushPendingBatch(force = false) {
  if (pending.length === 0 && !force) return;

  const batch = pending.splice(0, pending.length);
  console.log(`🌀 Flushing ${batch.length} pending events to ClickHouse...`);

  await retryWithBackoff(() => insertBatchToClickhouse(batch), {
    attempts: 3,
    baseDelayMs: 1500,
  });

  console.log(`✅ Pending flush complete`);
}

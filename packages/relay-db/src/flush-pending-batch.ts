import { insertBatchToClickhouse } from "@otm/relay-consumer";
import {
  retryIfRetryable,
  UpstreamUnavailableError,
  writeToDLQ,
  type NormalizedEvent,
} from "@otm/relay-core";

let pending: NormalizedEvent[] = [];

export function queueForFlush(events: NormalizedEvent[]) {
  pending.push(...events);
}

export async function flushPendingBatch(force = false) {
  if (pending.length === 0 && !force) return;

  const batch = pending.splice(0, pending.length);
  console.log(`🌀 Flushing ${batch.length} pending events to ClickHouse...`);

  try {
    await retryIfRetryable(
      async () => {
        try {
          await insertBatchToClickhouse(batch);
        } catch (err) {
          throw new UpstreamUnavailableError("ClickHouse flush failed", {
            cause: err,
            detail: { count: batch.length },
          });
        }
      },
      { attempts: 3, baseDelayMs: 1500 }
    );
    console.log(`✅ Pending flush complete`);
  } catch (err) {
    console.error(`⚠️ Flush failed after retries:`, err);
    const projectId = batch[0]?.projectId ?? "unknown_project";
    writeToDLQ(projectId, batch, err);
  }

  console.log(`✅ Pending flush complete`);
}

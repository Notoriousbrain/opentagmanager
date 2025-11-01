import { getClickhouseClient } from "@otm/relay-db";
import { UpstreamUnavailableError, type NormalizedEvent } from "@otm/relay-core";
import { retryIfRetryable } from "@otm/relay-core";

export async function insertBatchToClickhouse(
  events: NormalizedEvent[]
): Promise<void> {
  if (!events.length) return;

  const client = getClickhouseClient();

  const rows = events.map((e) => ({
    event_id: e.eventId,
    project_id: e.projectId,
    tenant_id: e.tenantId ?? null,
    type: e.type,
    data: e.data ?? {},
    occurred_at: new Date(e.occurredAt ?? Date.now())
      .toISOString()
      .replace("T", " ")
      .replace("Z", ""),
    received_at: new Date(e.receivedAt)
      .toISOString()
      .replace("T", " ")
      .replace("Z", ""),
    _ingested_at: new Date().toISOString().replace("T", " ").replace("Z", ""),
    ip: e.ip ?? null,
    ua: e.ua ?? null,
    request_id: e.requestId,
  }));

  await retryIfRetryable(
    async () => {
      try {
        await client.insert({
          table: "events_raw",
          values: rows,
          format: "JSONEachRow",
        });
      } catch (err) {
        throw new UpstreamUnavailableError("ClickHouse insert failed", {
          cause: err,
          detail: { count: rows.length },
        });
      }
    },
    {
      attempts: 3,
      baseDelayMs: 500,
      onRetry: (err, i, delay) => {
        console.warn(
          `⚠️ ClickHouse retry #${i} after ${delay}ms → ${(err as Error).message}`
        );
      },
    }
  );

  console.log(`📊 Inserted ${rows.length} events into ClickHouse`);
}

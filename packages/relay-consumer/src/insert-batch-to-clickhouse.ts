import { getClickhouseClient } from "@otm/relay-db";
import type { NormalizedEvent } from "@otm/relay-core";
import { retryWithBackoff } from "@otm/core";

export async function insertBatchToClickhouse(events: NormalizedEvent[]): Promise<void> {
  if (!events.length) return;
  const client = getClickhouseClient();

  const rows = events.map(e => ({
    event_id: e.eventId,
    project_id: e.projectId,
    tenant_id: e.tenantId ?? null,
    type: e.type,
    data: JSON.stringify(e.data ?? {}),
    occurred_at: new Date(e.occurredAt ?? Date.now()).toISOString(),
    received_at: new Date(e.receivedAt).toISOString(),
    ip: e.ip ?? null,
    ua: e.ua ?? null,
    request_id: e.requestId,
  }));

  await retryWithBackoff(async () => {
    await client.insert({
      table: "events_raw",
      values: rows,
      format: "JSONEachRow",
    });
  }, { attempts: 3, baseDelayMs: 1000 });

  console.log(`📊 Inserted ${rows.length} events into ClickHouse`);
}

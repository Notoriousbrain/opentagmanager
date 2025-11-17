import { getClickhouseClient } from "@otm/relay-db";
import {
  logger,
  UpstreamUnavailableError,
  type NormalizedEvent,
} from "@otm/relay-core";
import { retryIfRetryable } from "@otm/relay-core";
import { env } from "@otm/env";

export async function insertBatchToClickhouse(
  events: NormalizedEvent[]
): Promise<void> {
  if (!events.length) return;

  if (!env.CLICKHOUSE_URL || !env.CLICKHOUSE_DB) {
    logger.warn("⚠️ ClickHouse config missing — skipping insert");
    return;
  }

  const client = getClickhouseClient();
  if (!client) {
    logger.warn("⚠️ ClickHouse client unavailable — skipping insert");
    return;
  }

  const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime())
      ? new Date().toISOString().replace("T", " ").replace("Z", "")
      : d.toISOString().replace("T", " ").replace("Z", "");
  };

  const rows = events.map((e) => ({
    event_id: e.eventId,
    project_id: e.projectId,
    tenant_id: e.tenantId ?? null,
    type: e.type,

    data: JSON.stringify({
      name: e.type,
      props: e.props,
      userId: e.userId ?? null,
    }),

    occurred_at: safeDate(e.occurredAt ?? Date.now()),
    received_at: safeDate(e.receivedAt ?? Date.now()),
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
        logger.warn("ClickHouse retry", {
          attempt: i,
          delay,
          error: (err as Error).message,
        });
      },
    }
  );

  logger.info("Inserted events into ClickHouse", { count: rows.length });
}

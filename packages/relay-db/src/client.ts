import { createClient, type ClickHouseClient } from "@clickhouse/client";
import { env } from "@otm/env";

let client: ClickHouseClient | null = null;

export function getClickhouseClient(): ClickHouseClient {
  if (client) return client;

  client = createClient({
    url: env.CLICKHOUSE_URL ?? "http://localhost:8123",
    username: env.CLICKHOUSE_USER ?? "default",
    password: env.CLICKHOUSE_PASSWORD ?? "",
    database: env.CLICKHOUSE_DB ?? "osstag",
  });

  return client;
}

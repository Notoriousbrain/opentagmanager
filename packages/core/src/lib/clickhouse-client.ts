import { createClient } from "@clickhouse/client";
import { env } from "@otm/env";

const client = createClient({
  url: env.CLICKHOUSE_URL,
  database: env.CLICKHOUSE_DB,
  username: env.CLICKHOUSE_USER,
  password: env.CLICKHOUSE_PASSWORD,
});

export async function queryClickHouse<T = Record<string, unknown>>(
  sql: string,
  params?: Record<string, any>
): Promise<T[]> {
  const result = await client.query({
    query: sql,
    query_params: params ?? {},
    format: "JSONEachRow",
  });
  return (await result.json()) as unknown as T[];
}

export async function insertClickHouse<T extends Record<string, unknown>>(
  table: string,
  values: T[]
): Promise<void> {
  await client.insert({
    table,
    values,
    format: "JSONEachRow",
  });
}

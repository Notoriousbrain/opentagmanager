#!/usr/bin/env bun
import { Client as PgClient } from "pg";
import { createClient } from "@clickhouse/client";

function chNow() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

async function main() {
  console.log("🚀 OSSTag ClickHouse Bootstrap Starting…");

  const pg = new PgClient({
    connectionString: process.env.OTM_DATABASE_URL,
  });
  await pg.connect();
  console.log("🟢 Connected to Postgres");

  const { rows: projects } = await pg.query<{
    id: string;
    name: string;
  }>("SELECT id, name FROM project ORDER BY id;");
  console.log(`📦 Loaded ${projects.length} project(s)`);

  const ch = createClient({
    url: process.env.CLICKHOUSE_URL ?? "http://localhost:8123",
    username: process.env.CLICKHOUSE_USER ?? "default",
    password: process.env.CLICKHOUSE_PASSWORD ?? "",
    database: process.env.CLICKHOUSE_DB ?? "osstag",
  });
  console.log("🟢 Connected to ClickHouse");

  console.log("🛠️ Ensuring database exists…");
  await ch.exec({ query: `CREATE DATABASE IF NOT EXISTS osstag` });

  console.log("🛠️ Ensuring events_raw table exists…");

  await ch.exec({
    query: `
    CREATE TABLE IF NOT EXISTS osstag.events_raw
    (
      project_id String,
      tenant_id Nullable(String),
      event_id String,
      type String,
      data String,
      occurred_at DateTime64(3, 'UTC'),
      received_at DateTime64(3, 'UTC'),
      ip Nullable(String),
      ua Nullable(String),
      request_id String
    )
    ENGINE = MergeTree
    ORDER BY (project_id, occurred_at)
  `,
  });

  console.log("✔️ events_raw table ensured");

  console.log("🧹 Dropping old minute tables if they exist…");

  await ch.exec({
    query: `DROP TABLE IF EXISTS osstag.events_minute_mv SYNC`,
  });

  await ch.exec({
    query: `DROP TABLE IF EXISTS osstag.events_minute SYNC`,
  });

  console.log("🛠️ Ensuring events_minute table exists…");

  await ch.exec({
    query: `
    CREATE TABLE IF NOT EXISTS osstag.events_minute
    (
      project_id String,
      minute DateTime,
      event_type String,
      region String,
      total_events AggregateFunction(sum, UInt64),
      unique_users AggregateFunction(uniq, String),
      last_event_at AggregateFunction(max, DateTime64(3))
    )
    ENGINE = AggregatingMergeTree()
    PARTITION BY toDate(minute)
    ORDER BY (project_id, minute, event_type, region)
  `,
  });

  console.log("🛠️ Ensuring events_minute_mv materialized view exists…");

  await ch.exec({
    query: `
    CREATE MATERIALIZED VIEW osstag.events_minute_mv
    TO osstag.events_minute
    AS
    SELECT
      project_id,
      toStartOfMinute(occurred_at) AS minute,
      JSONExtractString(data, 'name') AS event_type,
      JSONExtractString(JSONExtractRaw(data, 'props'), 'region') AS region,
      sumState(toUInt64(1)) AS total_events,
      uniqState(JSONExtractString(data, 'userId')) AS unique_users,
      maxState(occurred_at) AS last_event_at
    FROM osstag.events_raw
    GROUP BY project_id, minute, event_type, region
  `,
  });

  console.log("🛠️ Ensuring project_lookup table exists…");

  await ch.exec({
    query: `
      CREATE TABLE IF NOT EXISTS osstag.project_lookup
      (
        project_id String,
        project_name String,
        updated_at DateTime DEFAULT now()
      )
      ENGINE = MergeTree
      ORDER BY project_id
    `,
  });

  console.log("✔️ project_lookup table ensured");

  for (const p of projects) {
    console.log(`➡️ Syncing project: ${p.id} (${p.name})`);

    await ch.exec({
      query: `
        ALTER TABLE osstag.project_lookup
        DELETE WHERE project_id = {id:String}
      `,
      query_params: { id: p.id },
    });

    await ch.insert({
      table: "osstag.project_lookup",
      values: [
        {
          project_id: p.id,
          project_name: p.name,
          updated_at: chNow(),
        },
      ],
      format: "JSONEachRow",
    });
  }

  console.log(`✅ Synced ${projects.length} project(s)`);

  await pg.end();
  console.log("🔌 Postgres connection closed");

  console.log("🎉 ClickHouse Bootstrap Complete");
}

main().catch((err) => {
  console.error("❌ Bootstrap failed");
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env bun
/**
 * Sync all projects from Postgres → ClickHouse
 * Auto-creates project_lookup table if missing.
 */

import { Client as PgClient } from "pg";
import { createClient } from "@clickhouse/client";

function chNow() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

async function main() {
  console.log("🔄 Syncing projects from Postgres → ClickHouse...");

  const pg = new PgClient({
    connectionString: process.env.OTM_DATABASE_URL,
  });
  await pg.connect();

  const { rows: projects } = await pg.query<{
    id: string;
    name: string;
  }>("SELECT id, name FROM project ORDER BY id;");

  console.log(`📦 Loaded ${projects.length} projects from Postgres`);

  const ch = createClient({
    url: process.env.CLICKHOUSE_URL ?? "http://localhost:8123",
    username: process.env.CLICKHOUSE_USER ?? "default",
    password: process.env.CLICKHOUSE_PASSWORD ?? "",
    database: process.env.CLICKHOUSE_DB ?? "osstag",
  });

  console.log("🛠️ Ensuring ClickHouse database exists...");
  await ch.exec({
    query: `CREATE DATABASE IF NOT EXISTS osstag`,
  });

  console.log("🛠️ Ensuring project_lookup table exists...");
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

  for (const p of projects) {
    console.log(`➡️  Syncing project: ${p.id} (${p.name})`);

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

  console.log(`✅ Synced ${projects.length} project(s) into ClickHouse`);

  await pg.end();
  console.log("🔌 Postgres connection closed");
  console.log("✨ Sync complete (self-healing mode)");
}

main().catch((err) => {
  console.error("❌ Sync failed");
  console.error(err);
  process.exit(1);
});

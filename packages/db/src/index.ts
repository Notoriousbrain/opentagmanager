import { drizzle } from "drizzle-orm/postgres-js";
import "server-only";
import * as schema from "./schema";

import { upstashCache } from "drizzle-orm/cache/upstash";
import { env } from "@otm/env/server";
import postgres from "postgres";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL, { prepare: false });
if (env.VERCEL_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, {
  schema,
  cache: upstashCache({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  }),
});
export type DB = typeof db;

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { env } from "@otm/env/server";

const globalForDb = globalThis as unknown as { conn?: postgres.Sql };

const conn =
  globalForDb.conn ?? postgres(env.OTM_DATABASE_URL, { prepare: true });

if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
export type DB = typeof db;

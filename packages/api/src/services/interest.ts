import { db, schema } from "@otm/db";
import { sql } from "drizzle-orm";
import { INTEREST_COUNTER_KEY } from "@otm/core";

const UPSTASH_URL = process.env.OSSTAG_UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.OSSTAG_UPSTASH_REDIS_REST_TOKEN;
const COUNTER_KEY = INTEREST_COUNTER_KEY;

function upstashHeaders() {
  return { Authorization: `Bearer ${UPSTASH_TOKEN!}` };
}

export async function bumpInterestCounter(): Promise<void> {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    await fetch(`${UPSTASH_URL}/incr/${encodeURIComponent(COUNTER_KEY)}`, {
      method: "POST",
      headers: upstashHeaders(),
      cache: "no-store",
    }).catch(() => {});
    return;
  }
}

export async function getInterestCount(): Promise<number> {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const res = await fetch(
        `${UPSTASH_URL}/get/${encodeURIComponent(COUNTER_KEY)}`,
        {
          method: "GET",
          headers: upstashHeaders(),
          cache: "no-store",
        }
      );
      if (res.ok) {
        const text = await res.text();
        const n = Number(text);
        if (!Number.isNaN(n)) return n;
      }
    } catch {}
  }

  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.interest);
  return rows[0]?.count ?? 0;
}

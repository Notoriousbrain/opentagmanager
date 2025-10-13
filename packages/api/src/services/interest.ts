import { db, schema } from "@otm/db";
import { count } from "drizzle-orm";
import { getUpstashClient, INTEREST_COUNTER_KEY } from "@otm/core";

export async function getInterestCount(): Promise<number> {
  const redis = getUpstashClient();

  if (redis) {
    const cached = await redis.get<string | number | null>(
      INTEREST_COUNTER_KEY
    );
    if (cached != null) return Number(cached);
  }

  const rows: { c: number }[] = await db
    .select({ c: count() })
    .from(schema.interest);

  const countNum = Number(rows[0]?.c ?? 0);

  if (redis) {
    await redis.set(INTEREST_COUNTER_KEY, String(countNum), { ex: 60 });
  }

  return countNum;
}

export async function bumpInterestCounter(): Promise<void> {
  const redis = getUpstashClient();
  if (!redis) return;
  await redis.incr(INTEREST_COUNTER_KEY);
}

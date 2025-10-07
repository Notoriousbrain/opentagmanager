import { Redis } from "@upstash/redis";

import { env } from "@otm/env";
import type { Cache } from "../cache";

export function createUpstashCache(): Cache {
  if (!env.OTM_UPSTASH_REDIS_REST_URL || !env.OTM_UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("Upstash Redis config missing required env vars.");
  }
  const client = new Redis({
    url: env.OTM_UPSTASH_REDIS_REST_URL!,
    token: env.OTM_UPSTASH_REDIS_REST_TOKEN!,
  });

  return {
    async get<T = unknown>(key: string): Promise<T | null> {
      const v = await client.get<T>(key);
      return (v ?? null) as T | null;
    },
    async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
      const opts = ttlSeconds ? { ex: ttlSeconds } : undefined;
      await client.set(key, value, opts);
    },
    async del(key: string): Promise<void> {
      await client.del(key);
    },
  };
}

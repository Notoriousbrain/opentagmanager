import { env } from "@otm/env";

export type Cache = {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
};

const store = new Map<string, { value: unknown; exp?: number }>();
const now = (): number => Date.now();

function createMemoryCache(): Cache {
  return {
    async get<T = unknown>(key: string): Promise<T | null> {
      const item = store.get(key);
      if (!item) return null;
      if (item.exp && item.exp < now()) {
        store.delete(key);
        return null;
      }
      return item.value as T;
    },
    async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
      const exp = ttlSeconds ? now() + ttlSeconds * 1000 : undefined;
      store.set(key, { value, exp });
    },
    async del(key: string): Promise<void> {
      store.delete(key);
    },
  };
}

function makeCache(): Cache {
  const enabled: boolean = env.OTM_REDIS_ENABLED === "true";
  const hasUpstash: boolean =
    Boolean(env.OTM_UPSTASH_REDIS_REST_URL) &&
    Boolean(env.OTM_UPSTASH_REDIS_REST_TOKEN);

  if (enabled && hasUpstash) {
    const { createUpstashCache } = require("./providers/upstash") as {
      createUpstashCache: () => Cache;
    };
    console.info("✅ OTM cache: Upstash (REST)");
    return createUpstashCache();
  }

  console.info("⚙️ OTM cache: in-memory");
  return createMemoryCache();
}

export const cache: Cache = makeCache();

import { env } from "../../../env/src";

export interface Cache {
  get: <T = unknown>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown, ttlSeconds?: number) => Promise<void>;
  del: (key: string) => Promise<void>;
}

/** In-memory fallback with TTL */
function createMemoryCache(): Cache {
  const store = new Map<string, { value: unknown; exp?: number }>();
  const now = () => Date.now();

  return {
    async get<T>(key) {
      const hit = store.get(key);
      if (!hit) return null;
      if (hit.exp && hit.exp < now()) {
        store.delete(key);
        return null;
      }
      return hit.value as T;
    },
    async set(key, value, ttl) {
      const exp = ttl ? now() + ttl * 1000 : undefined;
      store.set(key, { value, exp });
    },
    async del(key) {
      store.delete(key);
    },
  };
}

/** Upstash (HTTP/REST) provider */
function createUpstashCache(): Cache {
  // Lazy import so the package isn’t required if unused
  // @ts-ignore
  const { Redis } = require("@upstash/redis");
  const client = new Redis({
    url: env.server.OTM_UPSTASH_REDIS_REST_URL!,
    token: env.server.OTM_UPSTASH_REDIS_REST_TOKEN!,
  });

  return {
    async get<T>(key) {
      const val = await client.get(key);
      return (val ?? null) as T | null;
    },
    async set(key, value, ttlSeconds) {
      const opts = ttlSeconds ? { ex: ttlSeconds } : undefined;
      await client.set(key, value, opts);
    },
    async del(key) {
      await client.del(key);
    },
  };
}

/** Local Docker Redis (RESP) provider */
function createLocalRedisCache(): Cache {
  // Lazy import; only needed if you use Docker Redis
  // @ts-ignore
  const { createClient } = require("redis");
  const client = createClient({ url: env.server.OTM_LOCAL_REDIS_URL! });
  client.connect();

  return {
    async get<T>(key) {
      const raw = await client.get(key);
      if (raw == null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        // If something else stored plain strings
        return raw as unknown as T;
      }
    },
    async set(key, value, ttlSeconds) {
      const data = typeof value === "string" ? value : JSON.stringify(value);
      if (ttlSeconds) {
        await client.set(key, data, { EX: ttlSeconds });
      } else {
        await client.set(key, data);
      }
    },
    async del(key) {
      await client.del(key);
    },
  };
}

/** Factory: choose provider by env */
function selectCache(): Cache {
  if (env.server.OTM_REDIS_ENABLED !== "true") {
    console.info("⚙️ OTM cache disabled — using in-memory fallback");
    return createMemoryCache();
  }

  if (
    env.server.OTM_UPSTASH_REDIS_REST_URL &&
    env.server.OTM_UPSTASH_REDIS_REST_TOKEN
  ) {
    console.info("✅ Using Upstash Redis (REST)");
    return createUpstashCache();
  }

  if (env.server.OTM_LOCAL_REDIS_URL) {
    console.info("✅ Using local Redis (RESP)");
    return createLocalRedisCache();
  }

  console.warn(
    "⚠️ OTM_REDIS_ENABLED=true but no provider configured — falling back to memory"
  );
  return createMemoryCache();
}

export const cache: Cache = selectCache();

const store = new Map<string, { value: unknown; exp?: number }>();
const now = () => Date.now();

export type Cache = {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
};

const memoryCache: Cache = {
  async get<T>(key) {
    const item = store.get(key);
    if (!item) return null;
    if (item.exp && item.exp < now()) {
      store.delete(key);
      return null;
    }
    return item.value as T;
  },

  async set(key, value, ttlSeconds) {
    const exp = ttlSeconds ? now() + ttlSeconds * 1000 : undefined;
    store.set(key, { value, exp });
  },

  async del(key) {
    store.delete(key);
  },
};

export const cache: Cache = memoryCache;

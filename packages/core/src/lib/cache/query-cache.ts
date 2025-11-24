import { cache } from "../cache";

export async function cachedQuery<T>(
  key: string,
  ttlSeconds: number,
  queryFn: () => Promise<T>
): Promise<T> {
  const cached = await cache.get<T>(key);
  if (cached) return cached;

  const result = await queryFn();

  cache.set(key, result, ttlSeconds).catch(() => {});

  return result;
}

import { getUpstashClient } from "./redis-client";

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

export function createIpRateLimiter(opts: {
  prefix: string;
  windowSeconds: number;
  max: number;
}) {
  const { prefix, windowSeconds, max } = opts;
  const redis = getUpstashClient();

  return async function limit(ip: string | null | undefined) {
    if (!ip) return;
    const key = `rl:${prefix}:${ip}`;

    if (redis) {
      const n = await redis.incr(key);
      if (n === 1) {
        await redis.expire(key, windowSeconds);
      }
      if (n > max) {
        throw new Error("RATE_LIMIT");
      }
      return;
    }

    const now = Date.now();
    const bucket = memoryBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      memoryBuckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return;
    }
    bucket.count += 1;
    if (bucket.count > max) throw new Error("RATE_LIMIT");
  };
}

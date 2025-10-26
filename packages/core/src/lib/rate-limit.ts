// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@otm/env";

const redis = new Redis({
  url: env.OTM_UPSTASH_REDIS_REST_URL,
  token: env.OTM_UPSTASH_REDIS_REST_TOKEN,
});

export const baseRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "rate-limit",
});

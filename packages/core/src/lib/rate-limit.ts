import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@otm/env";

const hasUpstash =
  !!env.OTM_UPSTASH_REDIS_REST_URL && !!env.OTM_UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;

if (hasUpstash) {
  redis = new Redis({
    url: env.OTM_UPSTASH_REDIS_REST_URL,
    token: env.OTM_UPSTASH_REDIS_REST_TOKEN,
  });
}

const noOpLimiter = {
  limit: async () => ({ success: true }),
};

export const baseRateLimit = hasUpstash
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "rate-limit",
    })
  : noOpLimiter;

export const interestRateLimit = hasUpstash
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(1, "1 m"),
      analytics: true,
      prefix: "rl:interest",
    })
  : noOpLimiter;

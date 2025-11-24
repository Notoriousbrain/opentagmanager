import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@otm/env";

const hasUpstash =
  !!env.OTM_UPSTASH_REDIS_REST_URL && !!env.OTM_UPSTASH_REDIS_REST_TOKEN;

export const redis = new Redis({
  url: hasUpstash ? env.OTM_UPSTASH_REDIS_REST_URL! : "https://fake.upstash.io",
  token: hasUpstash ? env.OTM_UPSTASH_REDIS_REST_TOKEN! : "FAKE_TOKEN",
});

const noOpLimiter = {
  limit: async () => ({ success: true }),
};

export const interestRateLimit = hasUpstash
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(1, "1 m"),
      prefix: "rl:interest",
      analytics: true,
    })
  : noOpLimiter;

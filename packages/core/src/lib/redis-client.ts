import { Redis } from "@upstash/redis";
import { env } from "@otm/env";

export function getUpstashClient() {
  const url = env.OTM_UPSTASH_REDIS_REST_URL;
  const token = env.OTM_UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  return new Redis({ url, token });
}

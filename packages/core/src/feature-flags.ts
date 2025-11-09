export const FEATURES = {
  REDIS_ENABLED:
    process.env.OSSTAG_REDIS_ENABLED === "true" &&
    !!process.env.OSSTAG_UPSTASH_REDIS_REST_URL &&
    !!process.env.OSSTAG_UPSTASH_REDIS_REST_TOKEN,

  EVENTS_ENABLED:
    process.env.NEXT_PUBLIC_EVENTS_ENABLED === "true" ||
    process.env.OSSTAG_EVENTS_ENABLED === "true",
} as const;

export type FeatureFlag = keyof typeof FEATURES;

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    OTM_PROJECT_URL: z.string().min(1),
    OTM_DATABASE_URL: z.string().url(),

    OTM_UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    OTM_UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    OTM_REDIS_ENABLED: z.enum(["true", "false"]).default("false"),

    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),

    GITHUB_TOKEN: z.string().min(1),

    BETTER_AUTH_SECRET: z.string().min(32, {
      message: "BETTER_AUTH_SECRET must be at least 32 characters long.",
    }),
  },
  experimental__runtimeEnv: process.env,
  skipValidation: process.env.NODE_ENV !== "production",
});

if (
  env.OTM_REDIS_ENABLED === "true" &&
  (!env.OTM_UPSTASH_REDIS_REST_URL || !env.OTM_UPSTASH_REDIS_REST_TOKEN)
) {
  throw new Error(
    "OTM_REDIS_ENABLED=true requires OTM_UPSTASH_REDIS_REST_URL and OTM_UPSTASH_REDIS_REST_TOKEN"
  );
}

export type ServerEnv = typeof env;

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

const isProd = process.env.NODE_ENV === "production";

const runtimeEnv =
  typeof Bun !== "undefined" && Bun.env ? Bun.env : process.env;

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    OTM_PROJECT_URL: z.string().min(1),
    OTM_DATABASE_URL: z.string().url(),

    OTM_UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    OTM_UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    OTM_API_KEY_PEPPER: z.string().min(8),

    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),

    GITHUB_TOKEN: z.string().min(1),

    KAFKA_BROKERS: z.string().min(1),
    KAFKA_TOPIC_INGEST: z.string().default("osstag.ingest"),
    KAFKA_SASL_USERNAME: z.string().optional(),
    KAFKA_SASL_PASSWORD: z.string().optional(),
    KAFKA_SECURITY_PROTOCOL: z.string().optional(),

    S3_REGION: isProd ? z.string().min(1) : z.string().optional(),
    S3_BUCKET: isProd ? z.string().min(1) : z.string().optional(),
    S3_ACCESS_KEY_ID: isProd ? z.string().min(1) : z.string().optional(),
    S3_SECRET_ACCESS_KEY: isProd ? z.string().min(1) : z.string().optional(),
    S3_ENDPOINT: z.string().url().optional(),

    RELAY_MAX_BODY_KB: z.coerce.number().int().positive().default(64),
    RELAY_MAX_EVENTS: z.coerce.number().int().positive().default(50),
    RELAY_SKEW_MS: z.coerce.number().int().nonnegative().default(300_000),
    RELAY_RPS_PER_KEY_IP: z.coerce.number().int().positive().default(120),

    CLICKHOUSE_URL: z.string().url().default("http://localhost:8123"),
    CLICKHOUSE_USER: z.string().default("default"),
    CLICKHOUSE_PASSWORD: z.string().optional(),
    CLICKHOUSE_DB: z.string().default("osstag"),

    BETTER_AUTH_SECRET: z.string().min(32, {
      message: "BETTER_AUTH_SECRET must be at least 32 characters long.",
    }),
  },
  experimental__runtimeEnv: runtimeEnv,
  skipValidation: process.env.NODE_ENV !== "production",
});

export type ServerEnv = typeof env;

import { defineConfig } from "drizzle-kit";

import { config as loadEnv } from "dotenv";
import { resolve } from "path";

loadEnv({ path: resolve(process.cwd(), "../../.env") });

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/schema/events.ts",
  dbCredentials: { url: process.env.OTM_DATABASE_URL! },
});

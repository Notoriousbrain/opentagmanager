import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/schema/events.ts",
  dbCredentials: { url: process.env.OTM_DATABASE_URL! },
});

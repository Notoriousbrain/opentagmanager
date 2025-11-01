import { relayApp } from "@otm/relay-hono";
import { serve } from "@hono/node-server";
import process from "node:process";

const server = serve({ fetch: relayApp.fetch, port: 4000 });
console.log("Ingest relay running on http://localhost:4000");

process.on("SIGINT", async () => {
  console.log("\n🛑 Graceful shutdown: closing server...");
  server.close?.();
  console.log("✅ Server stopped cleanly.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Graceful shutdown: closing server...");
  server.close?.();
  console.log("✅ Server stopped cleanly.");
  process.exit(0);
});

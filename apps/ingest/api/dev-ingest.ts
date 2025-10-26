import { relayApp } from "@otm/relay-hono";
import { serve } from "@hono/node-server";

serve({ fetch: relayApp.fetch, port: 4000 });
console.log("Ingest relay running on http://localhost:4000");

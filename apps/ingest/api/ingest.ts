import { relayApp } from "@otm/relay-hono";
import { handle } from "hono/vercel";

export const runtime = "nodejs22.x";

export const fetch = handle(relayApp);

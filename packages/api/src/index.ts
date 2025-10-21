export * from "./trpc";
export * from "./root";
export * from "./cors";
import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(
  _req: IncomingMessage,
  res: ServerResponse
) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true, route: "trpc-root" }));
}

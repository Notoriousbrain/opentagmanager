import type { IncomingMessage, ServerResponse } from "http";

export default function health(_req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (_req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  res.end(JSON.stringify({ ok: true, ts: Date.now() }));
}

// packages/api/src/index.ts
import type { IncomingMessage, ServerResponse } from "http";
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";

function setCors(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "false");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Vary", "Origin");
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  // derive the tRPC path from the request URL
  const url = new URL(req.url ?? "/", "http://localhost");
  const path = url.pathname.replace(/^\/api\/trpc\/?/, "");

  return nodeHTTPRequestHandler({
    req,
    res,
    path, // e.g. "account.me" or "interest.add"
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError({ error, path }) {
      console.error("[tRPC error]", { path, error: error.message });
    },
  });
}
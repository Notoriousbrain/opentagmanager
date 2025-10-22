// packages/api/src/index.ts
import type { IncomingMessage, ServerResponse } from "http";
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";
import { applyCors, ensureCorsOnWriteHead, handlePreflight } from "./cors";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  applyCors(req, res);
  ensureCorsOnWriteHead(req, res);
  res.setHeader("X-Handler", "api:index.ts v2");

  if (handlePreflight(req, res)) return;

  const url = new URL(req.url ?? "/", "http://localhost");
  const path = url.pathname.replace(/^\/api\/trpc\/?/, "");

  return nodeHTTPRequestHandler({
    req,
    res,
    path,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError({ error, path }) {
      console.error("[tRPC error]", { path, message: error.message });
    },
  });
}

export * from "./root";
export * from "./trpc";

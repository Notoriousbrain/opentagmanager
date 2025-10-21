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

function toWhatwgHeaders(req: IncomingMessage): Headers {
  const h = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) h.set(k, v.join(","));
    else if (typeof v === "string") h.set(k, v);
  }
  return h;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (req.method === "OPTIONS") {
    setCors(res);
    res.statusCode = 204;
    res.end();
    return;
  }

  await nodeHTTPRequestHandler({
    req,
    res,
    path: "/api/trpc",
    router: appRouter,
    createContext: () => createTRPCContext({ headers: toWhatwgHeaders(req) }),
    onError({ error, path }) {
      console.error("tRPC error at", path, error);
    },
  });

  setCors(res);
}
export * from "./root"
export * from "./trpc"
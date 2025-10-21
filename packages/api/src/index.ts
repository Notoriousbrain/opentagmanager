// packages/api/src/index.ts
import type { IncomingMessage, ServerResponse } from "http";
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";

function allowedOrigin(origin: string | undefined) {
  const ALLOW = new Set(["http://localhost:3000", "https://osstag.vercel.app", "https://osstag.com"]);
  return origin && ALLOW.has(origin) ? origin : "";
}

function setCors(req: IncomingMessage, res: ServerResponse) {
  const origin =
    typeof req.headers.origin === "string" ? req.headers.origin : "";
  const allow = allowedOrigin(origin);

  if (allow) {
    res.setHeader("Access-Control-Allow-Origin", allow);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

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
  setCors(req, res);

  if (req.method === "OPTIONS") {
    setCors(req, res);
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    const path = url.pathname.replace(/^\/api\/trpc\/?/, "");

    return nodeHTTPRequestHandler({
      req,
      res,
      path,
      router: appRouter,
      createContext: () => createTRPCContext({ headers: req.headers }),
      onError({ error, path }) {
        console.log("DB URL present?", !!process.env.OSSTAG_DATABASE_URL);
        console.error("[tRPC error]", {
          path,
          message: error.message,
          stack: error.stack,
          cause: (error as any).cause,
        });
      },
    });
  } finally {
    setCors(req, res);
  }
}

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";

const ALLOW_ORIGIN =
  process.env.OSSTAG_DASHBOARD_ORIGIN ?? "http://localhost:3000";

function cors(res: any) {
  res.setHeader("Access-Control-Allow-Origin", ALLOW_ORIGIN);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

export default async function handler(req: any, res: any) {
  cors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const request = new Request(url, {
    method: req.method,
    headers: new Headers(
      Object.entries(req.headers).map(([k, v]) =>
        [k, Array.isArray(v) ? v.join(",") : String(v ?? "")] as [string, string]
      )
    ),
    body:
      req.method === "GET" || req.method === "HEAD" ? undefined : (req as any),
  });

  const response = await fetchRequestHandler({
    endpoint: "/trpc",
    req: request,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: request.headers }),
    onError({ error, path }) {
      console.error("tRPC error at", path, error);
    },
  });

  res.status(response.status);
  response.headers.forEach((val, key) => res.setHeader(key, val));
  const text = await response.text();
  return res.send(text);
}

export * from "./trpc";
export * from "./root";
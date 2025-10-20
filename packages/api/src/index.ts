import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";

const ALLOW = (origin?: string) => {
  if (!origin) return false;
  try {
    const { hostname } = new URL(origin);
    if (hostname === "osstag.vercel.app") return true;
    if (hostname.endsWith(".vercel.app")) return true;
    return false;
  } catch {
    return false;
  }
};

function cors(req: any, res: any) {
  const origin = req.headers.origin as string | undefined;
  if (ALLOW(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

export default async function handler(req: any, res: any) {
  cors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const request = new Request(url, {
    method: req.method,
    headers: new Headers(
      Object.entries(req.headers).map(
        ([k, v]) =>
          [k, Array.isArray(v) ? v.join(",") : String(v ?? "")] as [
            string,
            string,
          ]
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

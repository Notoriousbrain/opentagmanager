import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";

const ALLOW_ORIGINS = (process.env.OSSTAG_DASHBOARD_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowed(origin?: string) {
  if (!origin) return false;
  if (ALLOW_ORIGINS.includes(origin)) return true;
  try {
    const u = new URL(origin);
    if (u.hostname.endsWith(".vercel.app")) return true;
  } catch {}
  return false;
}

function setCors(req: any, res: any) {
  const origin = req.headers.origin as string | undefined;
  if (isAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  const reqHeaders =
    (req.headers["access-control-request-headers"] as string | undefined) ??
    "content-type, authorization";
  res.setHeader("Access-Control-Allow-Headers", reqHeaders);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

export default async function handler(req: any, res: any) {
  try {
    setCors(req, res);
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    const host = req.headers.host || "osstag-api.vercel.app"; // fallback
    const url = new URL(req.url ?? "/", `https://${host}`);
    const request = new Request(url, {
      method: req.method,
      headers: new Headers(
        Object.entries(req.headers).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.join(",") : String(v ?? ""),
        ])
      ),
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : (req as any),
    });

    const response = await fetchRequestHandler({
      endpoint: "/trpc",
      req: request,
      router: appRouter,
      createContext: () => createTRPCContext({ headers: request.headers }),
      onError({ error, path }) {
        console.error("tRPC error at", path, {
          msg: error.message,
          code: (error as any).code,
          cause: (error as any).cause?.message,
        });
      },
    });

    res.status(response.status);
    response.headers.forEach((val, key) => res.setHeader(key, val));
    setCors(req, res);

    const text = await response.text();
    return res.send(text);
  } catch (err: any) {
    console.error("API handler crashed:", err?.message, err?.stack);
    setCors(req, res);
    return res.status(500).send("Internal Server Error");
  }
}

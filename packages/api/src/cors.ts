import type { IncomingMessage, ServerResponse } from "http";

const ALLOW_EXACT = new Set<string>([
  "http://localhost:3000",
  "https://osstag.vercel.app",
  "https://osstag.com",
  "https://www.osstag.com",
]);

const ALLOW_WILDCARD = [".vercel.app"];

function isAllowedOrigin(origin?: string): string | "" {
  if (!origin) return "";
  try {
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    const normalized = `${u.protocol}//${u.host}`;

    if (ALLOW_EXACT.has(normalized)) return normalized;
    if (ALLOW_WILDCARD.some((suffix) => host.endsWith(suffix))) return origin;
    if (host === "localhost") return origin;

    return "";
  } catch {
    return "";
  }
}

export function applyCors(req: IncomingMessage, res: ServerResponse) {
  const origin =
    typeof req.headers.origin === "string"
      ? (req.headers.origin as string)
      : "";

  const allowOrigin = isAllowedOrigin(origin);
  if (allowOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
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

export function handlePreflight(
  req: IncomingMessage,
  res: ServerResponse
): boolean {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

export function ensureCorsOnWriteHead(
  req: IncomingMessage,
  res: ServerResponse
) {
  const origWriteHead = res.writeHead;
  res.writeHead = function patchedWriteHead(
    statusCode: number,
    statusMessage?: string | any,
    headers?: any
  ) {
    applyCors(req, res);
    // @ts-expect-error - we’re proxying Node's overloaded signature
    return origWriteHead.call(this, statusCode, statusMessage, headers);
  } as any;
}

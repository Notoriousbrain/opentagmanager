import type { IncomingMessage, ServerResponse } from "http";

export function applyCors(_req: IncomingMessage, res: ServerResponse) {
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
}

export function handlePreflight(
  req: IncomingMessage,
  res: ServerResponse
): boolean {
  if (req.method === "OPTIONS") {
    applyCors(req, res);
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
  const orig = res.writeHead;
  res.writeHead = function patched(
    statusCode: number,
    statusMessage?: string | any,
    headers?: any
  ) {
    applyCors(req, res);
    // @ts-ignore  — proxying Node’s overload
    return orig.call(this, statusCode, statusMessage, headers);
  } as any;
}

const ALLOWED_ORIGINS = [
  "https://osstag.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
] as const;

export function corsHeaders(origin: string | null): Headers {
  const isAllowed =
    origin !== null &&
    ALLOWED_ORIGINS.includes(origin as typeof ALLOWED_ORIGINS[number]);
  const allowed: string = isAllowed ? (origin as string) : ALLOWED_ORIGINS[0];

  const h = new Headers();
  h.set("Access-Control-Allow-Origin", allowed);
  h.set("Access-Control-Allow-Credentials", "true");
  h.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  h.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  h.set("Vary", "Origin");
  return h;
}

export function withCors(
  handler: (req: Request) => Promise<Response> | Response
) {
  return async (req: Request) => {
    const origin = req.headers.get("origin");

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const res = await handler(req);
    const merged = new Headers(res.headers);
    const cors = corsHeaders(origin);
    cors.forEach((v, k) => merged.set(k, v));
    return new Response(res.body, { status: res.status, headers: merged });
  };
}

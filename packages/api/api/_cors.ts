const ALLOWED_ORIGINS = ["https://osstag.vercel.app", "http://localhost:3000"];

export function corsHeaders(origin: string | null) {
  const allowed =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] ?? "";

  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    Vary: "Origin",
  };
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
    const headers = new Headers(res.headers);
    Object.entries(corsHeaders(origin)).forEach(([k, v]) =>
      headers.set(k, v as string)
    );
    return new Response(res.body, { status: res.status, headers });
  };
}

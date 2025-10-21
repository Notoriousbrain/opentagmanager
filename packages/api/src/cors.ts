export function corsHeaders(): Headers {
  const h = new Headers();
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Credentials", "false");
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
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const res = await handler(req);

    const merged = new Headers(res.headers);
    corsHeaders().forEach((v, k) => merged.set(k, v));

    return new Response(res.body, { status: res.status, headers: merged });
  };
}

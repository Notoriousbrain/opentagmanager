import { withCors } from "./_cors";

export default withCors((_req) => {
  return new Response(
    JSON.stringify({ ok: true, service: "api", ts: Date.now() }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});

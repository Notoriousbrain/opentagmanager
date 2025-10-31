import { serve } from "bun";
import { getMetrics } from "./metrics";

serve({
  port: 4100,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return new Response("ok", { status: 200 });
    }

    if (url.pathname === "/metrics") {
      return Response.json(getMetrics());
    }

    return new Response("not found", { status: 404 });
  },
});

setInterval(() => {
  const m = getMetrics();
  console.log(
    `📊 Consumer metrics → ${m.batchesFlushed} flushed | ${m.failedBatches} failed | ${m.eventsProcessed} events | last ${m.lastFlushDurationMs}ms`
  );
}, 30_000);

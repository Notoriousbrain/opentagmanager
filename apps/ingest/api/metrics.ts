import { Hono } from "hono";

export const runtime = "nodejs";

const metrics = {
  requests: 0,
  lastRequestAt: null as string | null,
};

const app = new Hono();

app.get("/metrics", (c) => {
  return c.json({
    uptimeSeconds: process.uptime(),
    requests: metrics.requests,
    lastRequestAt: metrics.lastRequestAt,
  });
});

export default app;

export const trackIngressMetric = () => {
  metrics.requests++;
  metrics.lastRequestAt = new Date().toISOString();
};

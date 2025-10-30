import { Hono } from "hono";
import { triggerReplayFromS3 } from "@otm/relay-db";
import { flushPendingBatch, getPipelineStats } from "@otm/relay-consumer";

export const adminRouter = new Hono();

adminRouter.get("/stats", (c) => {
  const stats = getPipelineStats();
  return c.json({ ok: true, stats });
});

adminRouter.post("/flush", async (c) => {
  await flushPendingBatch(true);
  return c.json({ ok: true, message: "Flush triggered" });
});

adminRouter.post("/replay", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const prefix = body.prefix ?? "ingest/";
  const result = await triggerReplayFromS3(prefix);
  return c.json({ ok: true, result });
});

import {
  assertActiveProject,
  enforceRateLimitOrThrow,
  handleIngestRequest,
  makeIngestBatchSchema,
  verifyIngressRequest,
  getLimitsFromEnv,
  toHttp,
  getSecretForKey as getSecretForKeyById,
  replayAllDLQ,
  logger,
  createTraceId,
  traceScope,
  collectTelemetry,
} from "@otm/relay-core";
import { Hono } from "hono";
import { adminRouter } from "./admin";
import { db, schema } from "@otm/db";
import { eq } from "drizzle-orm";
import { getRelayHealth } from "./health";
import { formatPrometheusMetrics } from "./metrics-prom";

export const metrics = {
  requests: 0,
  lastRequestAt: null as string | null,
  acceptedBatches: 0,
  acceptedEvents: 0,
  lastAcceptedAt: null as string | null,
  dlqWrites: 0,
  replays: 0,
  cleaned: 0,
  uptimeStart: Date.now(),
};

const LIMITS = getLimitsFromEnv();

export const relayApp = new Hono();

relayApp.get("/health", async (c) => {
  const health = await getRelayHealth();
  return c.json({ status: health.status });
});

relayApp.get("/status", async (c) => {
  const health = await getRelayHealth();
  return c.json(health);
});

relayApp.get("/metrics", (c) =>
  c.json({
    uptimeSeconds: process.uptime(),
    requests: metrics.requests,
    acceptedBatches: metrics.acceptedBatches,
    acceptedEvents: metrics.acceptedEvents,
    lastRequestAt: metrics.lastRequestAt,
    lastAcceptedAt: metrics.lastAcceptedAt,
    dlqWrites: metrics.dlqWrites,
    replays: metrics.replays,
    cleaned: metrics.cleaned,
  })
);

relayApp.get("/metrics/prom", (c) => {
  const body = formatPrometheusMetrics();
  c.header("content-type", "text/plain; version=0.0.4");
  return c.body(body);
});

relayApp.get("/admin/replay", async (c) => {
  const auth = c.req.header("x-admin-key");
  if (auth !== process.env.RELAY_ADMIN_KEY) {
    return c.json({ error: "unauthorized" }, 401);
  }

  try {
    const result = await replayAllDLQ();
    logger.info("DLQ replay completed", { result });
    return c.json({ status: "ok", ...result });
  } catch (err) {
    logger.error("DLQ replay failed", { error: (err as Error).message });
    return c.json(
      { error: "replay_failed", detail: (err as Error).message },
      500
    );
  }
});

relayApp.get("/telemetry", async (c) => {
  const snapshot = await collectTelemetry();
  return c.json(snapshot);
});

relayApp.get("/ping", (c) => c.text("pong 🏓"));

relayApp.post("/", async (c) => {
  try {
    const traceId = createTraceId();

    const rawBody = await c.req.text();
    const json = JSON.parse(rawBody);
    const ip = c.req.header("x-forwarded-for") ?? "unknown";

    logger.info(
      "Incoming ingest request",
      traceScope(traceId, {
        method: c.req.method,
        path: c.req.path,
        ip,
      })
    );

    const verifyResult = await verifyIngressRequest({
      method: c.req.method,
      path: c.req.path,
      body: rawBody,
      headers: Object.fromEntries(c.req.raw.headers),
      skewMs: LIMITS.maxSkewMs,
      getSecretForKey: (key) => getSecretForKeyById(key.id),
    });

    const apiKeyRecord = await db.query.apiKey.findFirst({
      where: eq(schema.apiKey.id, verifyResult.key.raw),
    });
    if (!apiKeyRecord) {
      throw new Error("API key not found");
    }

    const projectRecord = await db.query.project.findFirst({
      where: eq(schema.project.id, apiKeyRecord.projectId),
    });
    if (!projectRecord) {
      throw new Error("Project not found for API key");
    }

    const projectResolution = {
      ok: true,
      project: {
        projectId: projectRecord.id,
        tenantId: null,
        status:
          projectRecord.status === "archived"
            ? "revoked"
            : projectRecord.status,
      },
    } as const;

    assertActiveProject(projectResolution);

    await enforceRateLimitOrThrow({
      limiter: {
        async take() {
          return { ok: true, remaining: 99, resetMs: Date.now() + 60_000 };
        },
      },
      publicKeyId: verifyResult.key.id,
      ip,
    });

    const batchSchema = makeIngestBatchSchema({
      maxEventsPerBatch: LIMITS.maxEventsPerBatch,
      maxBodyKB: LIMITS.maxBodyKB,
      maxSkewMs: LIMITS.maxSkewMs,
    });
    const batch = batchSchema.parse(json);

    const result = await handleIngestRequest(batch, projectResolution.project);

    metrics.acceptedBatches++;
    metrics.acceptedEvents += result.eventsAccepted;
    metrics.lastAcceptedAt = new Date().toISOString();

    logger.info(
      "Accepted ingest batch",
      traceScope(traceId, {
        requestId: result.requestId,
        projectId: projectResolution.project.projectId,
        events: result.eventsAccepted,
      })
    );

    return c.json(
      {
        status: "accepted",
        requestId: result.requestId,
        eventsAccepted: result.eventsAccepted,
        receivedAt: result.receivedAt,
        ts: result.ts,
      },
      200
    );
  } catch (err) {
    logger.error("Ingress error", { error: (err as Error).message });
    const { status, body } = toHttp(err);
    return c.json(body, status);
  }
});

relayApp.route("/admin", adminRouter);

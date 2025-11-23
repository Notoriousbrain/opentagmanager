import { Hono } from "hono";

import { db, schema } from "@otm/db";
import { eq } from "drizzle-orm";

import { adminRouter } from "./admin";
import { metrics } from "./adapter";
import { getRelayHealth, getIngestStats } from "./health";
import { formatPrometheusMetrics } from "./metrics-prom";

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
  decodeFlexible,
} from "@otm/relay-core";

const LIMITS = getLimitsFromEnv();

export const relayApp = new Hono();

relayApp.get("/health", async (c) => {
  const h = await getRelayHealth();
  const ingest = await getIngestStats();

  const totalRequests = metrics.requests || 1;
  const http5xxRate = metrics.httpErrors5xx / totalRequests;

  const totalEvents = metrics.acceptedEvents || 1;
  const signatureMismatchRate = metrics.signatureMismatches / totalEvents;

  return c.json({
    relay: h.status === "healthy" ? "online" : "offline",
    version: "v0.1.0",

    dependencies: {
      kafka: h.subsystems.kafka === "ok" ? "online" : "offline",
      clickhouse: h.subsystems.clickhouse === "ok" ? "online" : "offline",
      s3: "offline",
    },

    ingest: {
      lastEventAt: ingest.lastEventAt,
      eventsPerMinute: ingest.eventsPerMinute,
      dlqSize: h.subsystems.dlqFiles,
    },

    errors: {
      http5xxRate,
      signatureMismatchRate,
    },
  });
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

relayApp.get("/telemetry", async (c) => {
  const health = await getRelayHealth();
  const core = await collectTelemetry();

  return c.json({
    ...core,
    clickhouseHealthy: health.subsystems.clickhouse === "ok",
    kafkaHealthy: health.subsystems.kafka === "ok",
    dlqFiles: health.subsystems.dlqFiles,
  });
});

relayApp.get("/admin/replay", async (c) => {
  const auth = c.req.header("x-admin-key");
  if (auth !== process.env.RELAY_ADMIN_KEY) {
    return c.json({ error: "unauthorized" }, 401);
  }

  try {
    const result = await replayAllDLQ();
    metrics.replays += 1;
    logger.info("DLQ replay completed", { result });
    return c.json({ status: "ok", ...result });
  } catch (err) {
    logger.error("DLQ replay failed", { error: (err as Error).message });

    return c.json(
      {
        error: "replay_failed",
        detail: (err as Error).message,
      },
      500
    );
  }
});

relayApp.get("/ping", (c) => c.text("pong 🏓"));

relayApp.post("/", async (c) => {
  metrics.requests++;
  metrics.lastRequestAt = new Date().toISOString();

  try {
    const traceId = createTraceId();
    const rawBody = await c.req.text();

    const json = decodeFlexible(rawBody);

    const ip = c.req.header("x-forwarded-for") ?? "unknown";

    if (!json || typeof json !== "object") {
      metrics.httpErrors5xx++;
      return c.json(
        { ok: false, error: "Invalid or undecodable payload" },
        400
      );
    }

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
    if (!apiKeyRecord) throw new Error("API key not found");

    const projectRecord = await db.query.project.findFirst({
      where: eq(schema.project.id, apiKeyRecord.projectId),
    });
    if (!projectRecord) throw new Error("Project not found for API key");

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
          return {
            ok: true,
            remaining: 99,
            resetMs: Date.now() + 60000,
          };
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
    metrics.httpErrors5xx++;

    logger.error("Ingress error", { error: (err as Error).message });

    const { status, body } = toHttp(err);
    return c.json(body, status);
  }
});

relayApp.route("/admin", adminRouter);

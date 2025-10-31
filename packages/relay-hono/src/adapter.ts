import {
  assertActiveProject,
  enforceRateLimitOrThrow,
  handleIngestRequest,
  makeIngestBatchSchema,
  verifyIngressRequest,
  getLimitsFromEnv,
  toHttp,
  getSecretForKey as getSecretForKeyById,
} from "@otm/relay-core";
import { Hono } from "hono";
import { adminRouter } from "./admin";
import { db, schema } from "@otm/db";
import { eq } from "drizzle-orm";

const metrics = {
  requests: 0,
  lastRequestAt: null as string | null,
  acceptedBatches: 0,
  acceptedEvents: 0,
  lastAcceptedAt: null as string | null,
};

const LIMITS = getLimitsFromEnv();

export const relayApp = new Hono();

relayApp.get("/health", (c) => c.text("ok"));

relayApp.get("/metrics", (c) =>
  c.json({
    uptimeSeconds: process.uptime(),
    requests: metrics.requests,
    acceptedBatches: metrics.acceptedBatches,
    acceptedEvents: metrics.acceptedEvents,
    lastRequestAt: metrics.lastRequestAt,
    lastAcceptedAt: metrics.lastAcceptedAt,
  })
);

relayApp.get("/ping", (c) => c.text("pong 🏓"));

relayApp.post("/", async (c) => {
  try {
    const rawBody = await c.req.text();
    const json = JSON.parse(rawBody);
    const ip = c.req.header("x-forwarded-for") ?? "unknown";

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
    console.error("Ingress error:", err);
    const { status, body } = toHttp(err);
    return c.json(body, status);
  }
});

relayApp.route("/admin", adminRouter);

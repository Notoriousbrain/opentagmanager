import {
  assertActiveProject,
  createInMemoryResolver,
  enforceRateLimitOrThrow,
  handleIngestRequest,
  makeIngestBatchSchema,
  verifyIngressRequest,
  getLimitsFromEnv,
  toHttp,
} from "@otm/relay-core";
import { Hono } from "hono";
import { adminRouter } from "./admin";

const LIMITS = getLimitsFromEnv();

export const relayApp = new Hono();

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
      getSecretForKey: async () => "test_secret",
    });

    const projectResolution = await createInMemoryResolver([
      {
        id: "demo123",
        info: { projectId: "demo123", status: "active" },
      },
    ])(verifyResult.key);
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

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

const LIMITS = getLimitsFromEnv();

export const relayApp = new Hono();

relayApp.get("/ping", (c) => c.text("pong 🏓"));

relayApp.post("/", async (c) => {
  try {
    const rawBody = await c.req.text();
    console.log("📥 Raw body:", rawBody);
    const json = JSON.parse(rawBody);
    const ip = c.req.header("x-forwarded-for") ?? "unknown";
    console.log("🌐 IP:", ip);

    console.log("🔍 Headers:", Object.fromEntries(c.req.raw.headers));
    const verifyResult = await verifyIngressRequest({
      method: c.req.method,
      path: c.req.path,
      body: rawBody,
      headers: Object.fromEntries(c.req.raw.headers),
      skewMs: LIMITS.maxSkewMs,
      getSecretForKey: (key) => getSecretForKeyById(key.id),
    });

    console.log("✅ verifyResult:", verifyResult);

    const apiKeyRecord = await db.query.apiKey.findFirst({
      where: eq(schema.apiKey.id, verifyResult.key.raw),
    });
    console.log("🔑 apiKeyRecord:", apiKeyRecord);
    if (!apiKeyRecord) {
      console.error("❌ API key not found for:", verifyResult.key.raw);
      throw new Error("API key not found");
    }

    const projectRecord = await db.query.project.findFirst({
      where: eq(schema.project.id, apiKeyRecord.projectId),
    });
    console.log("🏗️ projectRecord:", projectRecord);
    if (!projectRecord) {
      console.error(
        "❌ Project not found for API key:",
        apiKeyRecord.projectId
      );
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

    console.log("✅ projectResolution:", projectResolution);

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
    console.log("📦 batch:", batch);

    const result = await handleIngestRequest(batch, projectResolution.project);

    console.log("✅ Final result:", result);

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

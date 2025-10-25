import { Hono } from "hono";
import {
  verifyIngressRequest,
  createInMemoryResolver,
  assertActiveProject,
  enforceRateLimitOrThrow,
  makeIngestBatchSchema,
} from "@otm/relay-core";

export const relayApp = new Hono();

const resolveProject = createInMemoryResolver([
  {
    id: "demo123",
    info: {
      projectId: "demo123",
      status: "active",
    },
  },
]);

const limiter = {
  async take({ publicKeyId }: { publicKeyId: string }) {
    return {
      ok: true,
      remaining: 99,
      resetMs: Date.now() + 60_000,
    };
  },
};

relayApp.post("/api/ingest", async (c) => {
  try {
    const rawBody = await c.req.text();
    const ip = c.req.header("x-forwarded-for") ?? "unknown";

    const verifyResult = await verifyIngressRequest({
      method: c.req.method,
      path: c.req.path,
      body: rawBody,
      headers: Object.fromEntries(c.req.raw.headers),
      skewMs: 5_000,
      getSecretForKey: async () => "test_secret", 
    });

    const projectResolution = await resolveProject(verifyResult.key);
    assertActiveProject(projectResolution);
    const project = projectResolution.project;

    await enforceRateLimitOrThrow({
      limiter,
      publicKeyId: verifyResult.key.id,
      ip,
    });

    const json = JSON.parse(rawBody);
    const batchSchema = makeIngestBatchSchema({
      maxEventsPerBatch: 100,
      maxBodyKB: 512,
      maxSkewMs: 5000,
    });
    batchSchema.parse(json);

    return c.json({ status: "accepted", projectId: project.projectId }, 200);
  } catch (err) {
    console.error("Ingress error:", err);
    return c.json(
      { error: err instanceof Error ? err.message : String(err) },
      400
    );
  }
});

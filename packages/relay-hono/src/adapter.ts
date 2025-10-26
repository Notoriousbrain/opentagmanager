// import {
//   assertActiveProject,
//   createInMemoryResolver,
//   enforceRateLimitOrThrow,
//   handleIngestRequest,
//   makeIngestBatchSchema,
//   verifyIngressRequest,
// } from "@otm/relay-core";
// import { Hono } from "hono";

// export const relayApp = new Hono();

// const resolveProject = createInMemoryResolver([
//   {
//     id: "demo123",
//     info: {
//       projectId: "demo123",
//       status: "active",
//     },
//   },
// ]);

// const limiter = {
//   async take({ publicKeyId }: { publicKeyId: string }) {
//     return {
//       ok: true,
//       remaining: 99,
//       resetMs: Date.now() + 60_000,
//     };
//   },
// };

// relayApp.post("/api/ingest", async (c) => {
//   try {
//     const json = await c.req.json();
//     const rawBody = JSON.stringify(json);
//     const ip = c.req.header("x-forwarded-for") ?? "unknown";

//     const verifyResult = await verifyIngressRequest({
//       method: c.req.method,
//       path: c.req.path,
//       body: rawBody,
//       headers: Object.fromEntries(c.req.raw.headers),
//       skewMs: 5_000,
//       getSecretForKey: async () => "test_secret",
//     });

//     const projectResolution = await resolveProject(verifyResult.key);
//     assertActiveProject(projectResolution);
//     const project = projectResolution.project;

//     await enforceRateLimitOrThrow({
//       limiter,
//       publicKeyId: verifyResult.key.id,
//       ip,
//     });

//     const batchSchema = makeIngestBatchSchema({
//       maxEventsPerBatch: 100,
//       maxBodyKB: 512,
//       maxSkewMs: 5000,
//     });
//     const batch = batchSchema.parse(json);

//     const result = await handleIngestRequest(batch, project);
//     return c.json(
//       {
//         status: "accepted",
//         accepted: result.accepted,
//         rejected: result.rejected,
//       },
//       200
//     );
//   } catch (err) {
//     console.error("Ingress error:", err);
//     return c.json(
//       { error: err instanceof Error ? err.message : String(err) },
//       400
//     );
//   }
// });

import {
  assertActiveProject,
  createInMemoryResolver,
  enforceRateLimitOrThrow,
  handleIngestRequest,
  makeIngestBatchSchema,
  verifyIngressRequest,
} from "@otm/relay-core";
import { Hono } from "hono";

export const relayApp = new Hono();

// ✅ health check
relayApp.get("/ping", (c) => c.text("pong 🏓"));

// ✅ main ingest route
relayApp.post("/", async (c) => {
  try {
    const json = await c.req.json();
    const rawBody = JSON.stringify(json);
    const ip = c.req.header("x-forwarded-for") ?? "unknown";

    const verifyResult = await verifyIngressRequest({
      method: c.req.method,
      path: c.req.path,
      body: rawBody,
      headers: Object.fromEntries(c.req.raw.headers),
      skewMs: 5_000,
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
      maxEventsPerBatch: 100,
      maxBodyKB: 512,
      maxSkewMs: 5000,
    });
    const batch = batchSchema.parse(json);

    const result = await handleIngestRequest(batch, projectResolution.project);

    return c.json(
      {
        status: "accepted",
        accepted: result.accepted,
        rejected: result.rejected,
      },
      200
    );
  } catch (err) {
    console.error("Ingress error:", err);
    return c.json(
      { error: err instanceof Error ? err.message : String(err) },
      400
    );
  }
});

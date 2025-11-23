# OSSTag Node.js SDK (`@otm/sdk/node`)

The Node SDK provides a universal server-side analytics client for:

- Node.js 18+
- Bun
- Deno
- Workers (with small tweaks)
- Hono / Express / Fastify / Koa / NestJS
- Background workers (BullMQ, Temporal, etc.)
- CRON jobs
- CLI tools

It does not depend on window or React — fully server-safe.

---

# 📦 Installation

```bash
bun add @otm/sdk
```

Everything is exported as a subpath:

```ts
import { createNodeClient } from "@otm/sdk/node";
```

---

# 🚀 Quick Start

```ts
import { createNodeClient } from "@otm/sdk/node";

const otm = createNodeClient({
  projectId: process.env.OTM_PROJECT_ID!,
  ingestUrl: process.env.OTM_RELAY_URL!,
  secret: process.env.OTM_SECRET!, // optional HMAC signing
});
```

---

# 🧭 Track an Event

```ts
await otm.track("task_completed", {
  taskId: "abc123",
  durationMs: 2100,
});
```

This produces a **server-safe event** with:

```json
{
  "url": "server",
  "viewport": { "width": 0, "height": 0 },
  "context": { "framework": "node" }
}
```

No browser assumptions.

---

# 📤 Send a Raw Batch (advanced)

Useful for queue workers or backfills:

```ts
await otm.send({
  projectId: "abc",
  clientId: "server",
  sessionId: "server",
  sentAt: new Date().toISOString(),
  events: [
    /* events */
  ],
});
```

---

# 🔐 HMAC Signature (optional)

Server-side signing can protect ingestion endpoints:

```ts
createNodeClient({
  projectId,
  ingestUrl,
  secret: process.env.OTM_SECRET!,
});
```

This attaches:

```
x-osstag-signature: <hex>
```

Relay validates and rejects tampered payloads.

---

# 🏗 Example: Fastify Route

```ts
import Fastify from "fastify";
import { createNodeClient } from "@otm/sdk/node";

const fastify = Fastify();
const otm = createNodeClient({
  projectId: "...",
  ingestUrl: "...",
  secret: "...",
});

fastify.get("/ping", async () => {
  await otm.track("ping_route");
  return { ok: true };
});

fastify.listen({ port: 3000 });
```

---

# 🧵 Example: CRON Job

```ts
import { createNodeClient } from "@otm/sdk/node";

const otm = createNodeClient({
  projectId: "...",
  ingestUrl: "...",
  secret: "...",
});

async function runJob() {
  await otm.track("cron_ran", { timestamp: Date.now() });
}

runJob();
```

---

# 🎯 Summary

| Feature                         | Supported |
| ------------------------------- | --------- |
| Server-only environment         | ✅        |
| Node / Bun / Deno               | ✅        |
| HMAC signature                  | ✅        |
| Batch sending                   | ✅        |
| Canonical JSON                  | ✅        |
| Works with any server framework | ✅        |

The Node SDK is the easiest way to emit backend analytics into OSSTag.

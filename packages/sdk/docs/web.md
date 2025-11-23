# OSSTag Web SDK (`@otm/sdk`)

The Web SDK is the universal, framework-agnostic analytics client.  
React, Next.js, and Node SDKs are all built on top of this layer.

It is ideal for:

- Vanilla JS websites  
- Browser apps  
- Frameworks with custom pipelines  
- Embedding inside your own SDKs

---

# 📦 Installation

```bash
bun add @otm/sdk
````

---

# 🚀 Quick Start

```ts
import { createClient } from "@otm/sdk";

const otm = createClient({
  projectId: "my_project_id",
  send: async (batch, meta) => {
    await fetch("/api/ingest", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(meta?.signature && {
          [meta.headerName!]: meta.signature
        })
      },
      body: JSON.stringify(batch)
    });
  }
});
```

---

# 🧭 Tracking Events

```ts
otm.track("page_view");
```

With properties:

```ts
otm.track("product_view", {
  productId: "123",
  price: 1299
});
```

---

# 👤 Identify User

```ts
otm.identify("user_123");
```

This automatically attaches:

```json
{ "userId": "user_123" }
```

to all future events.

---

# 📤 Manual Flush

```ts
await otm.flush();
```

Usually not required — the SDK auto flushes every 10s and on batch limits.

---

# 🗄 Custom Storage (optional)

You can override how clientId/sessionId are persisted.

### Memory-only storage:

```ts
import { MemoryStorageAdapter } from "@otm/sdk";

const otm = createClient({
  projectId: "...",
  storage: new MemoryStorageAdapter()
});
```

### Your own adapter:

```ts
const myStorage = {
  get(key) { /* ... */ },
  set(key, val) { /* ... */ }
};

createClient({ projectId: "...", storage: myStorage });
```

---

# ⚙️ Optional: Custom Batching

```ts
createClient({
  projectId: "...",
  batching: {
    maxBatchEvents: 30,
    maxRetries: 5,
    baseBackoffMs: 200
  }
});
```

---

# 🔐 Optional: Signing (HMAC SHA256)

To enable payload signing:

```ts
createClient({
  projectId: "...",
  send: mySend,
  signature: {
    secret: "mysecret",
    headerName: "x-osstag-signature"
  }
});
```

This protects against tampering and spoofing.

---

# 🧪 Raw Event → Final Event

Raw event from Web SDK:

```ts
{
  name: "page_view",
  properties: {},
  timestamp: "...",
  clientId: "...",
  sessionId: "...",
  userId?: string
}
```

Relay transforms this to Final Event:

```ts
{
  id: "...",
  name: "...",
  props: { ... },
  timestamp: "...",
  clientId: "...",
  sessionId: "...",
  url: "...",
  referrer: "...",
  viewport: { width, height },
  region: null,
  context: {
    framework: "web",
    ...custom
  }
}
```

---

# 🧵 Works Everywhere

* Browser
* React
* Next.js
* Svelte
* Vue
* Solid
* Astro
* Any JS environment with `fetch()`

The Web SDK is the heart of OSSTag — simple, small, unblockable, universal.

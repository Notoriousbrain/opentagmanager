# OSSTag Next.js SDK (`@otm/sdk/next`)

The Next.js SDK provides first-class analytics support for the App Router:

- Client-side tracking
- Server Actions & RSC tracking
- Secure proxy route (`proxy.ts`)
- Automatic HMAC verification
- Edge runtime compatible
- Built on top of the universal Web SDK

This is the **recommended production integration**.

---

# 📦 Installation

```bash
bun add @otm/sdk
```

Everything is exported via the subpath:

```ts
import {
  createNextClient,
  createNextServerClient,
  otmProxy,
} from "@otm/sdk/next";
```

---

# ⚛️ 1. Client-Side Tracking (CSR)

Use inside **Client Components**:

```tsx
"use client";

import { createNextClient } from "@otm/sdk/next";

const otm = createNextClient({
  projectId: process.env.NEXT_PUBLIC_OTM_PROJECT_ID!,
  ingestUrl: "/api/ingest/proxy",
});

export default function Page() {
  otm.track("page_view");

  return <h1>Home</h1>;
}
```

### Track events

```ts
otm.track("button_click", { id: "cta" });
```

### Identify user

```ts
otm.identify("user_123");
```

---

# 🟩 2. Server-Side Tracking (RSC + Server Actions)

Use inside **Server Components**, **Server Actions**, or **route handlers**:

```ts
import { createNextServerClient } from "@otm/sdk/next";

const otm = createNextServerClient({
  projectId: process.env.OTM_PROJECT_ID!,
  ingestUrl: process.env.OTM_RELAY_URL!,
  secret: process.env.OTM_SECRET!, // enables signing
});
```

### Track server-side event

```ts
await otm.track("server_action_executed", { step: 1 });
```

This produces a fully valid OSSTag event with:

- `framework: "next-server"`
- no URL/viewport dependencies
- no browser context

---

# 🔥 3. Proxy Route (Next.js 15/16 App Router)

To securely forward events to OSSTag Relay, create:

`app/api/ingest/proxy.ts`

```ts
import { otmProxy } from "@otm/sdk/next";

export const { GET, POST } = otmProxy({
  target: process.env.OTM_RELAY_URL!,
  projectId: process.env.OTM_PROJECT_ID!,
  secret: process.env.OTM_SECRET!, // required for verification
  enrich: true, // add extra context fields server-side
});
```

### What the proxy does:

- Validates `x-osstag-signature`
- Rejects tampered payloads
- Enriches events with:

  ```json
  { "server": "next-proxy" }
  ```

- Forwards events to the relay URL
- Works in Edge runtime
- Compatible with Next.js 15/16 proxy conventions

---

# 🧪 4. End-to-End Diagram

```
Browser SDK → Next Client → /api/ingest/proxy
                              ↓
                   Signature verified
                              ↓
                     forwarded to Relay
                              ↓
                       Kafka → S3 → CH
```

---

# 📤 5. Using Client + Server Together

You can use:

- `createNextClient()` inside client components
- `createNextServerClient()` inside server components

Both safely merge analytics events into the same project stream.

---

# 🔐 6. HMAC Signing

To enable request signing from client → proxy:

```ts
const otm = createNextClient({
  projectId: "...",
  ingestUrl: "/api/ingest/proxy",
  signature: {
    secret: process.env.NEXT_PUBLIC_OTM_SECRET!,
    headerName: "x-osstag-signature",
  },
});
```

To validate signing on the server:

```ts
otmProxy({
  target: "...",
  projectId: "...",
  secret: process.env.OTM_SECRET!,
});
```

---

# 🏗️ 7. When to Use Next SDK?

Use when:

- You're on Next.js 13/14/15/16 App Router
- You want SSR + CSR tracking
- You want secure proxy ingestion
- You want to validate signatures
- You want consistent data from both browser + server

---

# 🎯 8. Summary

| Feature              | Supported |
| -------------------- | --------- |
| Client-side tracking | ✅        |
| Server Actions       | ✅        |
| RSC                  | ✅        |
| Edge runtime         | ✅        |
| Proxy route          | ✅        |
| HMAC signature       | ✅        |
| Canonical JSON       | ✅        |

The Next.js SDK is the most powerful OSSTag integration.

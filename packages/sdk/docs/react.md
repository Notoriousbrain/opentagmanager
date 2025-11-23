# OSSTag React SDK (`@otm/sdk/react`)

The React SDK provides a lightweight client with React-friendly behavior:
- Works in Client Components
- SSR-compatible (client methods only run in the browser)
- Auto flush
- Built on top of the universal Web SDK

---

# 📦 Installation

```bash
bun add @otm/sdk
````

There is **no separate package** — React SDK is a subpath export of `@otm/sdk`.

---

# 🚀 Quick Start (Client Component)

```tsx
"use client";

import { createReactClient } from "@otm/sdk/react";
import { useEffect } from "react";

const otm = createReactClient({
  projectId: process.env.NEXT_PUBLIC_OTM_PROJECT_ID!,
  ingestUrl: "/api/ingest/proxy"
});

export default function Page() {
  useEffect(() => {
    otm.track("page_view");
  }, []);

  return <h1>Hello React</h1>;
}
```

---

# 🧭 Tracking Events

```tsx
otm.track("button_click", { id: "signup-btn" });
```

---

# 👤 Identify User

```tsx
otm.identify("user_123");
```

---

# 🧼 Manual Flush

```tsx
await otm.flush();
```

Not usually required — batching and auto-flush are enabled by default.

---

# 🧩 Usage in Larger Apps

## Using inside custom hooks

```tsx
"use client";

import { useEffect } from "react";
import { createReactClient } from "@otm/sdk/react";

const otm = createReactClient({
  projectId: "abc",
  ingestUrl: "/api/ingest/proxy"
});

export function useTrackView(name: string) {
  useEffect(() => {
    otm.track(name);
  }, [name]);
}
```

---

# 🔐 Enabling HMAC Signing

```tsx
const otm = createReactClient({
  projectId: "...",
  ingestUrl: "/api/ingest/proxy",
  signature: {
    secret: process.env.NEXT_PUBLIC_OTM_SECRET!,
    headerName: "x-osstag-signature"
  }
});
```

> Note: In real apps, signing keys should be used server-side only.
> Use client-side secrets only if you're protecting **server-side proxies**, not the relay directly.

---

# 🏗 When to Use the React SDK?

Use it inside:

* Next.js Client Components
* React SPA apps
* React Router projects
* Any frontend using React

Don’t use it in:

* Server Actions or RSC → use `@otm/sdk/next` server client
* Backend servers → use `@otm/sdk/node`

---

# 🧁 React SDK = Web SDK + React sugar

The React client wraps the Web client and:

* Handles auto-initialization in React environments
* Avoids running on the server during SSR
* Exposes the same API:

  * `track`
  * `identify`
  * `flush`
  * `getClientId`
  * `getSessionId`

There is no React context or provider required — **intentionally minimal**.

# 🔐 OSSTag Request Signing (HMAC SHA256)

OSSTag supports optional **HMAC SHA256 request signing** for all SDKs.  
This protects ingestion endpoints from:

- spoofed events
- tampered payloads
- unauthorized clients
- replay attacks (relay compares timestamps)

Signing is highly recommended in production setups — especially when using the Next.js proxy or Node SDK.

---

# 🌍 Why Signing Matters

Without signing:

- Anyone could POST events to your ingest endpoint
- Payloads could be modified client-side
- User IDs could be forged
- Malicious actors could inject fake data

**HMAC ensures only your real SDK clients can send valid events.**

---

# 🔐 How Signing Works

### 1. SDK serializes the batch using _canonical JSON_

```json
{...} → canonicalString
```

### 2. SDK computes:

```
HMAC_SHA256(secret, canonicalString)
```

### 3. SDK sends header:

```
x-osstag-signature: <hex>
```

### 4. Proxy / Relay recomputes signature

If mismatch → **reject request**.

---

# 🛠 Enabling Signing in Client SDKs

## Browser / React / Web / Next Client

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

> ⚠️ If you're exposing secrets to the browser, make sure
> **you only send signed events to your Next proxy**,
> NEVER directly to the OSSTag Relay.

---

# 🖥 Server-Side Signing (Node + Next Server)

```ts
import { createNodeClient } from "@otm/sdk/node";

const otm = createNodeClient({
  projectId,
  ingestUrl,
  secret: process.env.OTM_SECRET!,
});
```

---

# 🧩 Next.js Proxy Verification

The proxy route validates signatures automatically.

`app/api/ingest/proxy.ts`:

```ts
import { otmProxy } from "@otm/sdk/next";

export const { GET, POST } = otmProxy({
  target: process.env.OTM_RELAY_URL!,
  projectId: process.env.OTM_PROJECT_ID!,
  secret: process.env.OTM_SECRET!,
  enrich: true,
});
```

If the signature is invalid, the proxy returns:

```json
{ "ok": false, "error": "Invalid signature" }
```

---

# 🔍 Example Signature Header

```
x-osstag-signature: 4f8d5068f05cb58f2e203f7d0b85b9c2c77c1f9b59559e2c6c9f9ab7ea7fb02e
```

---

# 🧪 Best Practices

### ✔ Always validate signatures on the server

Next.js proxy & relay do this automatically.

### ✔ Rotate secrets periodically

Recommended every 90–180 days.

### ✔ Never expose private secrets directly to the browser

Use a **Next proxy** if you need client-side signing.

### ✔ Store secrets securely

Environment variable or secret manager.

---

# 🎯 Summary

| Feature          | Purpose                    |
| ---------------- | -------------------------- |
| Canonical JSON   | Ensures consistent hashing |
| HMAC SHA256      | Prevents tampering         |
| Signature header | Allows server verification |
| Proxy validation | Protects ingestion         |
| Secret rotation  | Improves security          |

Signing transforms OSSTag ingestion from “open analytics” to **secure, tamper-proof tracking**.

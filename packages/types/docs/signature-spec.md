
# OSSTag — Signature Format Specification

This document defines how the OSSTag Client SDKs generate request signatures and
how the Relay Node verifies them. This guarantees:
- payload integrity
- replay protection
- client authenticity
- cross-runtime consistency

---

## 1. Canonical JSON Serialization

Before hashing, the SDK must canonicalize the signature input.

Rules:

1. All object keys must be sorted lexicographically.
2. Properties with `undefined` values must be removed.
3. No pretty printing — serialization must be single-line.
4. Arrays preserve original order.
5. Numbers, strings, booleans, null: unchanged.

The result is then passed into:

```

JSON.stringify(canonicalObject)

````

This ensures that:
- browser JS
- Node
- Bun
- edge runtimes

all produce identical byte sequences.

---

## 2. Signature Input Structure

The payload to sign matches the `SignatureInput` type defined in `src/event.ts`:

```json
{
  "batch": { ...BatchPayload },
  "timestamp": "2025-11-21T12:00:33.820Z"
}
````

The `timestamp` represents the moment when the client created the signature.

---

## 3. HMAC Algorithm

* Algorithm: **HMAC SHA256**
* Input: canonical JSON string
* Secret: the project's **API key secret**
* Output encoding: **hex string**

---

## 4. Required HTTP Headers

Clients must send:

```
x-osstag-signature: <hex-encoded hmac>
x-osstag-timestamp: <iso timestamp used during signing>
```

Relay validates both.

Example:

```
x-osstag-signature: 8fcf7eed4377185d2b0e9483de764e...
x-osstag-timestamp: 2025-11-21T12:00:33.820Z
```

---

## 5. Verification Rules (Relay)

Relay performs the following checks:

1. **Timestamp freshness**

   * Reject if timestamp is > 2 minutes in future.
   * Reject if timestamp is older than 5 minutes.
2. **Signature match**

   * Canonicalize the input using the same rules.
   * Compute HMAC using stored project secret.
   * Reject on mismatch.
3. **Replay protection**

   * Use event-level idempotency (`projectId + event.id`).
   * Duplicate events do not pass ingestion.

---

## 6. Security Benefits

* Prevents tampering of event data.
* Prevents replay attacks.
* Prevents forged batches.
* Ensures trust across runtimes (browser, Node, edge, Bun).

# OSSTag — Event Idempotency & Delivery Rules

This document defines the idempotency, batching, and retry guarantees for all
OSSTag clients (script, web, SDKs, server) and the Relay Node ingestion layer.

---

## 1. Event Identity

Every event is uniquely identified by the tuple:

{ projectId, event.id }


### Requirements
- `event.id` **must be a UUID v4** generated client-side.
- The SDK **must never reuse** event IDs.
- Relay will treat `{projectId, event.id}` as a **primary key**.
- If a duplicate event arrives, it is silently ignored.
- Relay increments an internal dedupe counter for monitoring.

---

## 2. Batch Delivery

Clients send batches described by `BatchPayload`.

### Important characteristics
- Batches may be delivered **multiple times**.
- Ordering is **not guaranteed**.
- Batches may be delayed (network / background tab).
- Batches may arrive out of order or after session end.

Relay must treat every batch as *potentially duplicated*.

---

## 3. Idempotent Storage (Relay)

Relay applies **one upsert per event ID**:
- The **first** occurrence of an event is stored.
- Any further occurrences are dropped.
- Events are never merged, patched, or updated.

This guarantees compatibility with:
- Offline mode
- Retries
- Background processing
- Beacon fallbacks

---

## 4. Client Retry Rules

Clients may retry the same batch if:
- `navigator.sendBeacon` fails
- `fetch()` throws
- Network is offline
- Page unload interrupts send

Clients should apply:
- **Exponential backoff**
- **Max retry window** (configurable)
- **Fail-open** behavior — do not block UI

---

## 5. Signature Verification

Later PRs will add signature generation.

Rules:
- Relay validates a timestamp attached to the batch.
- Validity window example: `±2 minutes`.
- Prevents replay attacks & long-delayed requests.
- Clients must attach:
  - `timestamp`
  - HMAC signature for `(batch + timestamp)`

---

## 6. Maximum Batch Size

Relay may enforce:
- Maximum events per batch (e.g. 100)
- Maximum body size (KB)

Clients will implement chunking later in PR **B7**.

---

## Summary

This document establishes the cross-runtime contract for how:
- Events are identified
- Batches may be retried
- Relay stores events idempotently
- Signatures will be validated
- Clients should implement retry behavior

This ensures safe, loss-tolerant analytics with minimal overhead.

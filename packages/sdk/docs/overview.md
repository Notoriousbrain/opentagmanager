# OSSTag SDK — Overview

The `@otm/sdk` package provides a unified analytics client designed for modern
frameworks and runtimes:

- Browser apps (vanilla JS)
- React applications
- Next.js App Router (client + server + proxy)
- Node.js / Bun / Deno servers
- Background workers and CRON tasks

All SDK layers share the same core architecture:

- Canonical JSON serialization
- HMAC SHA256 request signing
- Raw event schema (`RawEvent`)
- Final event schema (`Event`)
- Batch sending with retries
- Storage adapter API (localStorage, KV, Memory)
- Fully extendable context metadata
- Framework-neutral transport function

This documentation folder contains all usage examples and framework-specific guides:
- `web.md` — Universal JS client
- `react.md` — React SDK
- `next.md` — Next.js (App Router)
- `node.md` — Node / Bun SDK
- `signing.md` — HMAC signature guide

OSSTag’s SDK is designed to be:
- lightweight
- unblockable
- self-hostable
- tamper-proof (via signing)
- framework-agnostic

Use the SDK that best matches your environment, or mix multiple SDKs in the same app
(e.g., Next client + Next server + proxy).

# OSSTag SDK Overview

The `@otm/sdk` package provides a unified, framework-agnostic analytics client
for modern applications:

- Browser apps (vanilla JS)
- React (CSR/SSR)
- Next.js (App Router + Proxy)
- Node/Bun servers
- CRON jobs and background workers

All SDKs share:
- Canonical JSON serialization
- HMAC SHA256 signing
- Consistent event schema
- Batch transport
- Automatic retries
- Extendable metadata (`context`, `viewport`, etc.)

This folder contains usage examples and framework-specific guides.

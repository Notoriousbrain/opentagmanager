# 🏷️ **OSSTag — The Open-Source Tag Manager**

**OSSTag** is a **privacy-first, unblockable, and developer-friendly tag manager**.
It lets you **collect, route, and analyze events** across your product — **without ads scripts, cookies, or trackers**.

It’s an **open alternative to Google Tag Manager**, rebuilt from the ground up for transparency, simplicity, and speed.

---

## 💡 **What It Does**

OSSTag helps you:

* 📦 **Manage tracking & analytics tags** without editing your production code
* 🔒 **Respect privacy laws (GDPR, CCPA)** — no personal data or cookies required
* ⚡ **Send and process events** in real-time using a fast, server-side relay
* 🚫 **Bypass ad-blockers** — works at the network level, not via third-party scripts
* 🧩 **Integrate anywhere** — SDKs for web, React, and server environments
* 🪶 **Stay lightweight** — no heavy dashboards or hidden analytics vendors

You control your data, your tags, and your infrastructure.

---

## 🌍 **Why OSSTag**

| Feature              | OSSTag               | Google Tag Manager   |
| -------------------- | -------------------- | -------------------- |
| Open Source          | ✅ Yes                | ❌ No                 |
| Privacy-First        | ✅ Built-in           | ⚠️ Ad-centric        |
| Server-Side Tags     | ✅ Native             | ⚙️ Complex setup     |
| Unblockable          | ✅ Works via relay    | ❌ Script-based       |
| Self-Hosted          | ✅ You own it         | ❌ Google Cloud       |
| Developer Experience | ❤️ Type-safe, modern | 😩 UI-driven, legacy |

---

## 🧠 **Core Principles**

* **Transparency** → Open code, clear data flows
* **Privacy** → No fingerprinting, no PII
* **Control** → You decide where events go
* **Simplicity** → One command to run, one UI to manage
* **Speed** → Built for modern edge runtimes (Vercel Fluid, Bun, AWS)

---

## 🚀 **Tech Stack**

| Area             | Stack                                          |
| ---------------- | ---------------------------------------------- |
| Monorepo         | Turborepo + Bun                                |
| Framework        | Next.js 15 (App Router + Turbopack)            |
| Backend          | tRPC + Drizzle ORM + PostgreSQL                |
| Auth             | Better Auth (Email/Password + Google + GitHub) |
| State            | Zustand                                        |
| Styling          | Tailwind CSS v4 + shadcn/ui                    |
| Cache            | Upstash Redis (optional)                       |
| Mail             | SMTP + Resend                                  |
| Linting / Format | Biome                                          |

---

## 🧩 **Monorepo Structure**

```
apps/
 dashboard/ → Main app (Next.js + tRPC)
 docs/ → Developer documentation site

packages/
 @osstag/core → Core logic + cache provider (memory / Upstash)
 @osstag/env → Environment schema & validation
 @osstag/db → Drizzle ORM schema & migrations
 @osstag/ui → Shared shadcn + Tailwind v4 UI system
 @osstag/auth → Central Better Auth instance
```

---

## 🧱 **Current Progress — v0.1**

### ✅ Core

* Feature-flagged cache with memory + Upstash support
* Environment schema with validated keys
* Upstash auto-detect (no manual flags)

### ✅ Auth (v0.1)

* Better Auth (Email/Password + Google + GitHub)
* JWT sessions (stateless)
* SMTP + Resend adapters
* Secure cookies + session limiting
* Centralized auth package with Next.js + tRPC integration

### ✅ Dashboard

* Organization & Project management
* Role-based access (owner, admin, editor, viewer)
* API key creation, reveal, and revocation
* One-time token display with masked UI
* Zustand stores for org/project/session state

---

## 🔮 **Upcoming**

* Audit logs for org/project actions
* Real-time ingestion pipeline (Relay Node)
* Event replay + analytics dashboard
* Public API documentation
* Cron cleanup for expired sessions/verifications

---

## 🛠️ **Setup**

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Copy and edit env file**

   ```bash
   cp .env.example .env
   ```

3. **Run migrations**

   ```bash
   bun run db:migrate
   ```

4. **Start apps**

   ```bash
   bun run dev
   ```

Dashboard → [http://localhost:3000](http://localhost:3000)
Docs → [http://localhost:3001](http://localhost:3001)

---

## 💬 **Philosophy**

> “Tag management should be open, transparent, and privacy-first.”

OSSTag gives teams **full control** of analytics and tracking,
without relying on third-party scripts or hidden data flows.

---

## 🌐 **Links**

* Website (coming soon)
* Docs → `/apps/docs`
* Dashboard → `/apps/dashboard`
* Repo → [github.com/opentagmanager/osstag](https://github.com/opentagmanager/osstag)

---

© 2025 **OSSTag** — Open Source under the **MIT License**

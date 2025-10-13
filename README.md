# 🏷️ OSS Tag — The Open-Source Tag Manager

**OSS Tag** is an open-source, privacy-first alternative to Google Tag Manager.
It lets you manage tracking code (tags) securely and dynamically and without touching your production codebase.

Built for transparency, developer control, and speed.

## 🚀 Tech Stack

| Area             | Stack                                          |
| ---------------- | ---------------------------------------------- |
| Monorepo         | Turborepo + Bun                                |
| Framework        | Next.js 15 (App Router + Turbopack)            |
| Backend          | tRPC + Drizzle ORM + PostgreSQL                |
| Auth             | Better Auth (Email/Password + Google + GitHub) |
| State            | Zustand                                        |
| Styling          | Tailwind CSS v4 + shadcn/ui                    |
| Cache            | Upstash Redis (optional, REST API)             |
| Mail             | SMTP + Resend                                  |
| Linting / Format | Biome                                          |

---

## 🧩 Monorepo Structure

```
apps/
 dashboard/ → Main app (Next.js + tRPC)
 docs/ → Developer documentation site

packages/
 @osstag/core → Core logic + cache provider (memory / Upstash)
 @osstag/env → Environment schema & validation (Zod + @t3-oss/env-nextjs)
 @osstag/db → Drizzle ORM schema & migrations
 @osstag/ui → Shared shadcn + Tailwind v4 UI system
 @osstag/auth → Central Better Auth instance
```

---

## 📦 Current Progress — v0.1

### ✅ Core

- Feature-flagged cache with memory + Upstash support
- Environment schema with all project/env keys
- Upstash auto-detect (no manual flags)

### ✅ Auth (v0.1)

- Better Auth with Email/Password, Google, GitHub
- JWT sessions (stateless)
- SMTP + Resend adapters
- Secure cookies + hooks to limit session count
- Centralized auth package with Next.js handler and tRPC bridge

### ✅ Projects & API Keys (v0.1)

- Organization & Project schema with Drizzle
- Org membership roles: owner, admin, editor, viewer
- Role-based dashboard rendering
- Create/select organization flow
- Create/manage projects
- API key management (create, revoke, reveal, copy)
- One-time token display with masked UI

### 🧠 State Management

- Zustand store for orgs, projects, and active session
- Fast local navigation without refetch delay

---

## 🔮 Upcoming

- Audit logs for key/project/org actions
- Tag manager runtime (event ingestion & execution engine)
- Workspace-level analytics
- Public API docs
- Cron cleanup for expired sessions/verifications

---

## 🛠️ Setup

1. Install dependencies
    bun install

2. Copy `.env.example` and fill required keys
    cp .env.example .env

3. Run database migrations
    bun run db:migrate

4. Start all apps
    bun run dev

Dashboard → [http://localhost:3000](http://localhost:3000)
Docs → [http://localhost:3001](http://localhost:3001)

---

## 💡 Philosophy

"Tag management should be open, transparent, and privacy-first."

OSSTag empowers developers and teams to self-host a tag manager that’s
faster, safer, and more auditable than any black-box alternative.

---

## 🌐 Links

- Website (coming soon)
- Docs: /apps/docs
- Dashboard: /apps/dashboard
- Repo: github.com/opentagmanager/osstag

---

© 2025 OSS Tag. Open Source under the MIT License.

---

# 🏷️ OTM (Open Tag Manager)

> **An open-source, self-hosted alternative to Google Tag Manager**, built with modern TypeScript tooling and designed for speed, reliability, and transparency.

---

## ⚡️ Status

**Version:** `v0.1.0 (Functional Core — In Progress)`  
**Goal:** Collect → Persist → Inspect  
Core event pipeline under construction.

---

## 🧱 Monorepo Structure

| Package / App                | Purpose                                           |
| ---------------------------- | ------------------------------------------------- |
| `apps/docs`                  | Public documentation & landing page               |
| `apps/dashboard`             | Admin UI (Next.js + tRPC + Better Auth)           |
| `apps/relay-node`            | Ingest API (Bun + Hono + Drizzle + Postgres)      |
| `packages/core`              | Shared types, Zod schemas, utilities              |
| `packages/env`               | Zod-validated environment loader                  |
| `packages/db`                | Drizzle ORM schema + Postgres integration         |
| `packages/ui`                | Shadcn-based component library                    |
| `packages/api`               | tRPC routers (shared between dashboard/backend)   |
| `packages/cli`               | Developer CLI (`otm init`, `otm dev:relay`, etc.) |
| `packages/web`               | Lightweight browser runtime (`window.otm.push()`) |
| `packages/typescript-config` | Shared TypeScript configs                         |
| `packages/eslint-config`     | Shared ESLint configs                             |

---

## 🧩 v0.1 Build Roadmap

1. **Repo hygiene** – consistent TS + Bun + Turbo setup
2. **Env package** – validated `.env` handling
3. **DB** – Drizzle + Postgres + `events` table
4. **Relay service** – `/healthz`, `/collect` → DB insert
5. **Optional Upstash** – rate limit & dedupe
6. **Core types** – shared `CollectEvent` schema
7. **Browser snippet** – `window.otm.push()` → sendBeacon
8. **Dashboard stub** – event count view
9. **CLI** – `init`, `dev:relay` commands
10. **Preview/debug header**
11. **CI smoke build**

> v0.1 focuses purely on _data collection and reliability_.  
> Tag rules and execution come in v0.2.

---

## 🧰 Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Runtime / API  | **Bun**, **Hono**                                   |
| Database       | **Postgres**, **Drizzle ORM**                       |
| Cache / Queue  | **Upstash Redis** (optional)                        |
| Frontend / UI  | **Next.js (App Router)**, **Shadcn/UI**, **Lucide** |
| API Contracts  | **tRPC v11**, **Zod**                               |
| Auth           | **Better Auth**                                     |
| CLI            | **Commander**, **Esbuild**                          |
| Testing        | **Vitest**, **Playwright**                          |
| CI/CD          | **GitHub Actions**                                  |
| Infrastructure | **Docker Compose + Caddy (self-host)**              |

---

## 🚀 Local Development

### 1. Install dependencies

```bash
bun install
```

### 2. Start Postgres via Docker

```bash
bun run docker:up
```

### 3. Run the Docs app

```bash
bun run docs
```

### 4. Run the Dashboard

```bash
bun run dashboard
```

### 5. Run the Relay Node (Bun API)

```bash
cd apps/relay-node
bun run dev
```

---

## 🧠 Project Purpose

OTM is designed to:

- Provide a **self-hosted, transparent alternative** to Google Tag Manager
- Enable **developer-first analytics & tag management**
- Use **modern TypeScript + Bun DX** for speed and maintainability
- Be modular: **Core**, **Relay**, **Dashboard**, and **Web Runtime**

---

## 🧩 Contributing

Contributions are welcome!  
See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, style, and PR guidelines.

---

## 📜 License

[MIT](./LICENSE)

---

## 💬 Community

- 🧠 Discussions: Coming soon on GitHub Discussions
- 🐞 Issues: [GitHub Issues](https://github.com/opentagmanager/opentagmanager/issues)

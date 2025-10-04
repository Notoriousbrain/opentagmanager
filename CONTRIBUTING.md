# 🤝 Contributing to OTM

Thanks for your interest in improving **Open Tag Manager (OTM)**!  
We’re building this project in **tiny, high-quality steps** — your help makes that possible.

---

## 🧱 Project Structure

```
apps/
  ├── docs/          # Docs & landing page
  ├── dashboard/     # Admin dashboard (Next.js)
  └── relay-node/    # API ingest service (Hono + Bun)

packages/
  ├── api/           # Shared tRPC routers
  ├── core/          # Shared types, Zod schemas
  ├── db/            # Drizzle schema & migrations
  ├── env/           # Environment config (Zod)
  ├── ui/            # Component library
  ├── cli/           # CLI utilities
  ├── web/           # Browser snippet
  ├── typescript-config/  # Shared TS configs
  └── eslint-config/      # Shared ESLint configs
```

---

## 🧩 Development Workflow

### 1. Clone & Install

```bash
git clone https://github.com/opentagmanager/opentagmanager.git
cd opentagmanager
bun install
```

### 2. Start Local Postgres

```bash
bun run docker:up
```

### 3. Build All Packages

```bash
bun run build
```

### 4. Run a Specific App

```bash
bun run docs
# or
bun run dashboard
# or
cd apps/relay-node && bun run dev
```

---

## 🧠 Coding Standards

- **Language:** TypeScript (ESM only)
- **Runtime:** Bun (no Node APIs unless Bun supports them)
- **Formatting:** Prettier → `bun run format`
- **Linting:** ESLint (shared config in `@otm/eslint-config`)
- **Type safety:** Always use **Zod** for runtime validation
- **Commits:** Conventional style → e.g.
  - `feat: add relay endpoint`
  - `fix: handle invalid event schema`
  - `chore: update dependencies`

---

## 🧪 Testing

- **Unit Tests:** [Vitest](https://vitest.dev)
- **E2E Tests:** [Playwright](https://playwright.dev)

Run all tests:

```bash
bun test
```

---

## 🧱 Pull Request Guidelines

- Fork → branch from `staging` → open a PR.
- Keep PRs **small and focused** (prefer under 300 lines).
- Link related issue or roadmap item.
- Include before/after behavior if visual or API-related.
- CI must pass: build, lint, type check, and test.

---

## 🔄 Versioning & Roadmap

- Each **minor release (v0.x)** adds one major functional slice.
- `staging` always represents the latest working state.
- Roadmap is tracked in `/docs/roadmap` and GitHub milestones.

---

## 🧡 Thank You

Your contribution — even a single typo fix — helps make OTM a better open-source tool for everyone.  
We’re excited to build this with you 🚀

"use client";

import Navbar from "@/components/navbar/page";
import { MoveLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

/* =======================
   Types
======================= */
type Task = {
  label: string;
  done?: boolean;
  note?: string;
};

type PricingTier = {
  name: "Free" | "Pro" | "Business" | "Enterprise" | string;
  price: string;
  highlight?: boolean;
  notes?: string;
};

type GrowthTargets = {
  starsGoal: number; // expected GitHub stars
  activeSites: number; // active sites using OTM
  monthlyEvents?: string; // e.g. "10M events/mo"
};

type Monetization = {
  summary: string;
  levers: string[]; // e.g. ["SaaS", "Consulting"]
};

type Phase = {
  version: string; // e.g. "v0.5"
  title: string; // Phase name
  focus: string; // short focus sentence
  items: Task[]; // tasks in this phase
  monetization: Monetization;
  growth: GrowthTargets;
  pricing: PricingTier[];
};

/* =======================
   Roadmap Data (2025-10)
======================= */
const phases: Phase[] = [
  {
    version: "v0.1",
    title: "Phase 1 — MVP (Functional Core)",
    focus:
      "Ship a usable, privacy-first core with minimal GTM parity (bootstrap, data layer, consent, basic tags).",
    items: [
      { label: "ESM Bootstrap (async, ≤6 KB, non-blocking)" },
      { label: "Data Layer: window.otm.push() + context payloads" },
      {
        label: "Consent Categories & Per-Tag Gating (analytics/ads/functional)",
      },
      { label: "Rule Engine (JSON DSL → predicates)" },
      { label: "Built-in Tags: GA4, Meta, Webhook" },
      { label: "Preview Mode + Event Log" },
      { label: "CLI: init / dev / build / deploy" },
      { label: "Self-hosting via NPM + Docker" },
    ],
    monetization: {
      summary:
        "Open-source launch; bootstrap revenue via paid onboarding & support.",
      levers: ["Consulting", "GitHub Sponsors"],
    },
    growth: {
      starsGoal: 250,
      activeSites: 50,
      monthlyEvents: "1M+ events/mo (aggregate)",
    },
    pricing: [
      { name: "Free", price: "$0", notes: "Repo + self-host" },
      { name: "Pro", price: "—", notes: "Planned for v0.5" },
      { name: "Business", price: "—", notes: "Planned for v1.0" },
      { name: "Enterprise", price: "—", notes: "Early pilots (custom)" },
    ],
  },
  {
    version: "v0.5",
    title: "Phase 2 — Developer Delight",
    focus:
      "Reliability, typing, SPA support, CI pipelines; minimal admin UI to manage containers/tags.",
    items: [
      { label: "Offline Queue (IndexedDB) + Retry + Idempotency" },
      { label: "Type-Safe Event Schemas (codegen + validation)" },
      { label: "Trigger Expression Compiler (safe DSL → pure functions)" },
      { label: "Next.js/React bindings (route/view tracking)" },
      { label: "Secure Template Sandbox (no eval)" },
      { label: "CI/CD Recipes (GitHub Actions) + signed builds (SRI-ready)" },
      { label: "Minimal Admin UI (local)" },
    ],
    monetization: {
      summary:
        "Launch OTM Cloud (Beta): hosted convenience with usage telemetry (opt-in).",
      levers: ["SaaS (Cloud Beta)", "Consulting"],
    },
    growth: {
      starsGoal: 800,
      activeSites: 200,
      monthlyEvents: "10M+ events/mo",
    },
    pricing: [
      { name: "Free", price: "$0", notes: "1 container • 100k events/mo" },
      {
        name: "Pro",
        price: "$29/mo",
        highlight: true,
        notes: "3 containers • 1M events/mo",
      },
      {
        name: "Business",
        price: "$99/mo",
        notes: "10 containers • 10M events/mo",
      },
      { name: "Enterprise", price: "Custom", notes: "Pilots only" },
    ],
  },
  {
    version: "v1.0",
    title: "Phase 3 — Full Replacement",
    focus:
      "Reach GTM-replacement parity plus reliability & security edge; ship Studio UI + server/edge relay.",
    items: [
      { label: "Studio Web App (Visual Builder: tags/triggers/variables)" },
      { label: "Plugin API for Destinations (npm adapters)" },
      { label: "Server/Edge Relay (Node, Cloudflare, Vercel)" },
      { label: "Audit Log, Environments, Rollback" },
      { label: "Advanced Debug Overlay (trigger decisions, network, consent)" },
      { label: "PII Redaction Rules (client + relay)" },
      { label: "Code-signed Containers + CSP/Nonce helpers" },
      { label: "First-party Proxy Domain Configuration" },
    ],
    monetization: {
      summary:
        "OTM Cloud 1.0 GA with usage-based metering; begin private enterprise contracts.",
      levers: ["SaaS (GA)", "Usage-based", "Enterprise"],
    },
    growth: {
      starsGoal: 2000,
      activeSites: 1000,
      monthlyEvents: "50M+ events/mo",
    },
    pricing: [
      { name: "Free", price: "$0", notes: "1 container • 250k events/mo" },
      {
        name: "Pro",
        price: "$39/mo",
        highlight: true,
        notes: "3 containers • 2M events/mo",
      },
      {
        name: "Business",
        price: "$129/mo",
        notes: "10 containers • 20M events/mo • RBAC & audit",
      },
      {
        name: "Enterprise",
        price: "Custom",
        notes: "SLA • private cloud • SSO",
      },
    ],
  },
  {
    version: "v1.5",
    title: "Phase 3.5 — AI Foundations",
    focus:
      "Prompt-based tag creation; accelerate mapping & trigger authoring with AI guardrails.",
    items: [
      { label: "AI Prompt Builder: NL → tag + trigger + variables" },
      { label: "Smart Variable Hints from Data Layer & DOM" },
      { label: "Mapping Suggestions (GA4/Meta params)" },
      { label: "Prompt Templates (purchase/sign-up/lead)" },
      { label: "Guardrails: explain, confirm, and diff AI changes" },
    ],
    monetization: {
      summary: "Introduce AI add-on & prompt credits.",
      levers: ["SaaS", "AI Credits"],
    },
    growth: {
      starsGoal: 4000,
      activeSites: 2000,
      monthlyEvents: "100M+ events/mo",
    },
    pricing: [
      { name: "Free", price: "$0", notes: "AI not included" },
      {
        name: "Pro",
        price: "$59/mo",
        highlight: true,
        notes: "+ AI Add-on $20/mo or $0.10/prompt",
      },
      {
        name: "Business",
        price: "$159/mo",
        notes: "Includes AI • higher limits",
      },
      {
        name: "Enterprise",
        price: "Custom",
        notes: "AI credits pooled • volume rates",
      },
    ],
  },
  {
    version: "v2.0",
    title: "Phase 4 — Innovation",
    focus:
      "Time-travel diffs, deterministic ‘Why didn’t it fire?’ analyzer, CMP integrations, SDKs.",
    items: [
      { label: "Time-Travel Diffs across container versions" },
      { label: "Rule Replay (‘Why didn’t it fire?’) with explanations" },
      { label: "CMP Integrations (TCF v2, OneTrust, Cookiebot)" },
      { label: "Event Simulator + Replay Sandbox" },
      { label: "SDKs: JS, Node, Deno, Go, Python" },
      { label: "AI Debug Assistant (causes & fixes)" },
      { label: "Auto Tag Audit (redundancy, conflicts, orphans)" },
    ],
    monetization: {
      summary:
        "Enterprise plan GA; edge relay hosting & SLA; partner integrations.",
      levers: ["Enterprise", "Edge Hosting", "Partnerships"],
    },
    growth: {
      starsGoal: 8000,
      activeSites: 5000,
      monthlyEvents: "250M+ events/mo",
    },
    pricing: [
      { name: "Free", price: "$0", notes: "Community support" },
      { name: "Pro", price: "$59/mo", notes: "SMB • AI optional" },
      {
        name: "Business",
        price: "$159/mo",
        highlight: true,
        notes: "RBAC • audit • AI included",
      },
      {
        name: "Enterprise",
        price: "$2k–$10k/mo",
        notes: "SLA • private cloud • data residency",
      },
    ],
  },
  {
    version: "v2.5",
    title: "Phase 4.5 — AI Optimization",
    focus:
      "Continuous performance & privacy improvements with AI insights & automation.",
    items: [
      { label: "AI Performance Optimizer (defer/lazy-load recommendations)" },
      { label: "Privacy Analyzer (PII & consent gap detection)" },
      { label: "Smart Batching & Network Coalescing suggestions" },
      { label: "Tag Efficiency Scoring & Health Reports" },
      { label: "Auto-generated Release Notes & Change Summaries" },
    ],
    monetization: {
      summary:
        "Performance & privacy analytics as paid add-ons; agency white-label.",
      levers: ["Add-ons", "White-label"],
    },
    growth: {
      starsGoal: 10000,
      activeSites: 10000,
      monthlyEvents: "500M+ events/mo",
    },
    pricing: [
      { name: "Free", price: "$0" },
      { name: "Pro", price: "$59/mo" },
      {
        name: "Business",
        price: "$159/mo",
        highlight: true,
        notes: "Add-on: Perf Dashboard $15–30/mo",
      },
      {
        name: "Enterprise",
        price: "Custom",
        notes: "Bundled add-ons • volume",
      },
    ],
  },
  {
    version: "v3.0",
    title: "Phase 5 — Enterprise & Edge",
    focus:
      "Governance, scale, compliance; edge-native performance; marketplace & certification.",
    items: [
      { label: "RBAC, Approval Workflows, Multi-tenant" },
      {
        label: "Multi-Environment Deploys (dev/stage/prod, canary + % rollout)",
      },
      { label: "Edge-Native Relay (Workers/Fastly) + Data Residency Controls" },
      { label: "Cryptographically Signed Audit Trail" },
      { label: "SSO (SAML/OIDC), API Keys, Policy Templates" },
      { label: "Open Template Marketplace (verification & trust scores)" },
    ],
    monetization: {
      summary:
        "Enterprise Suite GA; plugin marketplace revenue share; education & certification.",
      levers: ["Enterprise", "Marketplace (10–20%)", "Certification"],
    },
    growth: {
      starsGoal: 15000,
      activeSites: 25000,
      monthlyEvents: "1B+ events/mo",
    },
    pricing: [
      { name: "Free", price: "$0" },
      { name: "Pro", price: "$59/mo" },
      { name: "Business", price: "$159/mo" },
      {
        name: "Enterprise",
        price: "Custom",
        highlight: true,
        notes: "SLA • SSO • residency • marketplace access",
      },
    ],
  },
];

/* =======================
   Helpers
======================= */
function summarize(phases: Phase[]) {
  const totals = phases.reduce(
    (acc, p) => {
      acc.total += p.items.length;
      acc.done += p.items.filter((i) => i.done).length;
      return acc;
    },
    { total: 0, done: 0 }
  );
  const percent = totals.total
    ? Math.round((totals.done / totals.total) * 100)
    : 0;
  return { ...totals, percent };
}

const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const EmptyIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    aria-hidden
  >
    <rect x="4" y="4" width="16" height="16" rx="3" ry="3" />
  </svg>
);

/* =======================
   Page
======================= */
export default function RoadmapPage() {
  const { total, done, percent } = summarize(phases);
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0F0F0F] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10 mt-24">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 px-4 py-2 text-white/90 hover:border-white/40 hover:bg-white/5"
          >
            <MoveLeftIcon className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Open Tag Manager — Unified Roadmap
          </h1>
          <p className="mt-3 text-sm text-zinc-300">
            Product, AI, <span className="font-semibold">monetization</span>,
            community growth targets, and pricing per phase.
          </p>
        </header>

        {/* Progress Summary */}
        <section aria-label="Overall progress" className="mb-10">
          <div className="flex items-end justify-between gap-4">
            <div className="w-full">
              <p className="text-sm text-zinc-300">Overall Progress</p>
              <div className="mt-2 h-3 w-full rounded-full bg-zinc-800">
                <div
                  className="h-3 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-semibold">{percent}%</div>
              <div className="text-xs text-zinc-400">
                {done} / {total} tasks
              </div>
            </div>
          </div>
        </section>

        {/* Legend */}
        <div className="mb-8 flex flex-wrap items-center gap-6 text-sm text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center bg-emerald-900/50 text-emerald-400 ring-1 ring-emerald-600/50">
              <CheckIcon className="h-3.5 w-3.5" />
            </span>
            <span>Done</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center bg-zinc-900 text-zinc-400 ring-1 ring-zinc-600/50">
              <EmptyIcon className="h-3.5 w-3.5" />
            </span>
            <span>Pending</span>
          </div>
        </div>

        {/* Phases */}
        <div className="space-y-12">
          {phases.map((phase, idx) => (
            <section key={idx} aria-labelledby={`phase-${idx}`}>
              <div className="mb-4 flex flex-col gap-2">
                <h2
                  id={`phase-${idx}`}
                  className="text-xl md:text-2xl font-semibold"
                >
                  {phase.title}{" "}
                  <span className="text-sm text-zinc-400">
                    ({phase.version})
                  </span>
                </h2>
                <p className="text-sm text-zinc-400">{phase.focus}</p>
              </div>

              {/* KPI + Monetization row */}
              <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-md border border-zinc-700 bg-zinc-900 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    Monetization
                  </p>
                  <p className="mt-1 text-sm text-zinc-200">
                    {phase.monetization.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {phase.monetization.levers.map((lever, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-300"
                      >
                        {lever}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border border-zinc-700 bg-zinc-900 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    Growth Targets
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-lg font-semibold">
                        {phase.growth.starsGoal.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        GitHub ⭐ Goal
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {phase.growth.activeSites.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Active Sites
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {phase.growth.monthlyEvents ?? "—"}
                      </div>
                      <div className="text-[11px] text-zinc-400">Volume</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-zinc-700 bg-zinc-900 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">
                    Pricing (at this phase)
                  </p>
                  <ul className="mt-2 grid gap-2">
                    {phase.pricing.map((tier, i) => (
                      <li
                        key={i}
                        className={[
                          "flex items-center justify-between rounded border px-3 py-2 text-sm",
                          tier.highlight
                            ? "border-emerald-600/60 bg-emerald-950/30"
                            : "border-zinc-700 bg-zinc-900",
                        ].join(" ")}
                      >
                        <span className="font-medium">{tier.name}</span>
                        <span className="text-zinc-300">{tier.price}</span>
                        {tier.notes && (
                          <span className="ml-3 text-[11px] text-zinc-400">
                            {tier.notes}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tasks */}
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {phase.items.map((task, i) => (
                  <li
                    key={i}
                    className={[
                      "group rounded-md border p-4 transition-colors",
                      task.done
                        ? "border-emerald-600/60 bg-emerald-950/30 hover:border-emerald-400/80"
                        : "border-zinc-700 bg-zinc-900 hover:border-zinc-500",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium leading-snug">{task.label}</p>
                        <p className="mt-1 text-xs text-zinc-400">
                          {task.done ? "Completed" : "Planned"}
                          {task.note ? ` • ${task.note}` : ""}
                        </p>
                      </div>
                      <span
                        className={[
                          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1",
                          task.done
                            ? "bg-emerald-900/50 text-emerald-400 ring-emerald-600/50"
                            : "bg-zinc-900 text-zinc-400 ring-zinc-600/50",
                        ].join(" ")}
                        aria-label={
                          task.done ? "Task complete" : "Task pending"
                        }
                        title={task.done ? "Task complete" : "Task pending"}
                      >
                        {task.done ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <EmptyIcon className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

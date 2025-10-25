"use client";

import React from "react";
import NavbarLanding from "@/components/landing/navbar";
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
  starsGoal: number;
  activeSites: number;
  monthlyEvents?: string;
};

type Monetization = {
  summary: string;
  levers: string[];
};

type Phase = {
  version: string;
  title: string;
  focus: string;
  items: Task[];
  monetization: Monetization;
  growth: GrowthTargets;
  pricing: PricingTier[];
};

const phases: Phase[] = [
  {
    version: "v0.1",
    title: "Core Tracking Layer",
    focus:
      "Make tracking accurate and hard to block by running tags from your own domain with privacy by default.",
    items: [
      {
        label: "Tiny ESM snippet (async, ≤6 KB, non-blocking)",
        done: true,
        note: "core SDK scaffolded",
      },
      {
        label: "First-party delivery (custom domain) to reduce blocking",
        done: true,
        note: "relay @ Fluid groundwork",
      },
      {
        label: "Simple event capture + clean data layer (no jargon)",
        done: true,
        note: "relay-core schema & types",
      },
      { label: "Consent handling built in (opt-in / opt-out)", done: false },
      {
        label: "Self-host via NPM or Docker",
        done: true,
        note: "monorepo + Bun/Turbo base",
      },
      { label: "Early block detection signals (basic)", done: false },
    ],
    monetization: {
      summary:
        "Open-source launch focused on trust and adoption; paid onboarding available.",
      levers: ["Consulting", "GitHub Sponsors"],
    },
    growth: {
      starsGoal: 250,
      activeSites: 50,
      monthlyEvents: "1M+ events/mo (aggregate)",
    },
    pricing: [
      { name: "Free", price: "$0", notes: "Repo + self-host" },
      { name: "Pro", price: "—", notes: "Planned for Cloud Beta" },
      { name: "Business", price: "—", notes: "Planned for GA" },
      { name: "Enterprise", price: "—", notes: "Early pilots (custom)" },
    ],
  },
  {
    version: "v0.3",
    title: "Marketer Dashboard",
    focus:
      "Give non-technical teams a simple place to add, pause, and trust tags without code changes.",
    items: [
      {
        label: "Clean dashboard to add/pause tags quickly",
        done: true,
        note: "Projects + API Keys UI complete",
      },
      {
        label: "Prebuilt integrations: GA4, Meta, LinkedIn (simple presets)",
        done: false,
      },
      {
        label: "Tag status and validation (did it load, is it blocked)",
        done: false,
      },
      { label: "Consent settings made simple (plain language)", done: false },
      { label: "Lightweight activity log for changes", done: false },
    ],
    monetization: {
      summary:
        "Launch OSSTag Cloud Beta for teams that don’t want to self-host.",
      levers: ["SaaS (Cloud Beta)", "Consulting"],
    },
    growth: {
      starsGoal: 500,
      activeSites: 150,
      monthlyEvents: "5M+ events/mo",
    },
    pricing: [
      { name: "Free", price: "$0", notes: "1 site • 100k events/mo" },
      {
        name: "Pro",
        price: "$29/mo",
        highlight: true,
        notes: "5 sites • 1M events/mo • block reports",
      },
      {
        name: "Business",
        price: "$99/mo",
        notes: "25 sites • 10M events/mo • consent reports",
      },
      { name: "Enterprise", price: "Custom", notes: "Pilots only" },
    ],
  },
  {
    version: "v0.5",
    title: "Reliability & Insights",
    focus:
      "Keep data flowing even when offline and surface where tracking is blocked or broken.",
    items: [
      { label: "Offline queue + retry + idempotency", done: false },
      {
        label: "Block detection and recovery paths (first-party fallback)",
        done: false,
      },
      {
        label: "Simple insights panel: conversions, reliability score",
        done: false,
      },
      { label: "Weekly Tracking Health Report (email)", done: false },
      { label: "SDK & API for advanced teams (optional)", done: false },
    ],
    monetization: {
      summary:
        "Cloud subscriptions (Pro/Business) + reliability add-ons for agencies.",
      levers: ["SaaS", "Add-ons"],
    },
    growth: {
      starsGoal: 1000,
      activeSites: 300,
      monthlyEvents: "10M+ events/mo",
    },
    pricing: [
      { name: "Free", price: "$0", notes: "Community tier" },
      {
        name: "Pro",
        price: "$39/mo",
        highlight: true,
        notes: "5 sites • 2M events/mo • health reports",
      },
      {
        name: "Business",
        price: "$129/mo",
        notes: "25 sites • 20M events/mo • advanced insights",
      },
      { name: "Enterprise", price: "Custom", notes: "SLA • private cloud" },
    ],
  },
  {
    version: "v1.0",
    title: "Simplicity & Expansion",
    focus:
      "Become the daily control center for tracking with first-party delivery guaranteed and faster websites.",
    items: [
      { label: "Full visual dashboard (no code editing)", done: false },
      { label: "Template library for common events and pixels", done: false },
      { label: "First-party domain setup wizard", done: false },
      { label: "Custom event builder with plain-language labels", done: false },
      {
        label: "Roles for marketers and developers (collaboration)",
        done: false,
      },
      {
        label: "Performance-friendly loading (only what’s needed)",
        done: false,
      },
    ],
    monetization: {
      summary:
        "OSSTag Cloud GA with usage-based pricing; agency accounts and white-label options.",
      levers: ["SaaS (GA)", "Agency", "White-label"],
    },
    growth: {
      starsGoal: 2000,
      activeSites: 800,
      monthlyEvents: "25M+ events/mo",
    },
    pricing: [
      { name: "Free", price: "$0", notes: "1 site • 250k events/mo" },
      {
        name: "Pro",
        price: "$49/mo",
        highlight: true,
        notes: "5 sites • 3M events/mo",
      },
      {
        name: "Business",
        price: "$159/mo",
        notes: "25 sites • 20M events/mo • audit & roles",
      },
      { name: "Enterprise", price: "Custom", notes: "SSO • residency • SLA" },
    ],
  },
  {
    version: "v1.5",
    title: "AI Assist & Automation",
    focus:
      "Let marketers describe what to track in simple words and automate the setup safely.",
    items: [
      {
        label: "Prompt-based tag setup: “Track sign-ups and purchases”",
        done: false,
      },
      { label: "Auto-mapping for common events and platforms", done: false },
      {
        label: "Change explanations and approvals (human in the loop)",
        done: false,
      },
      { label: "Auto-generated weekly summaries", done: false },
    ],
    monetization: {
      summary: "AI add-on via monthly fee or credits; bundled in higher tiers.",
      levers: ["AI Add-on", "Credits"],
    },
    growth: {
      starsGoal: 4000,
      activeSites: 1500,
      monthlyEvents: "50M+ events/mo",
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
        price: "$179/mo",
        notes: "Includes AI • higher limits",
      },
      { name: "Enterprise", price: "Custom", notes: "Pooled AI credits" },
    ],
  },
  {
    version: "v2.0+",
    title: "Enterprise & Privacy Edge",
    focus:
      "Scale with governance, data residency, and advanced compliance while staying first-party and fast.",
    items: [
      { label: "Advanced permissions, audit trails, approvals", done: false },
      { label: "Data residency controls and edge relays", done: false },
      { label: "Custom domain certificates and policy templates", done: false },
      { label: "Partner integrations and agency tooling", done: false },
      { label: "Marketplace for verified templates", done: false },
    ],
    monetization: {
      summary:
        "Enterprise contracts, compliance features, marketplace revenue share, and certifications.",
      levers: ["Enterprise", "Marketplace", "Certification"],
    },
    growth: {
      starsGoal: 10000,
      activeSites: 5000,
      monthlyEvents: "250M+ events/mo",
    },
    pricing: [
      { name: "Free", price: "$0", notes: "Community support" },
      { name: "Pro", price: "$59/mo", notes: "SMB • optional AI" },
      {
        name: "Business",
        price: "$179/mo",
        highlight: true,
        notes: "RBAC • audit • AI included",
      },
      {
        name: "Enterprise",
        price: "Custom",
        notes: "SSO • SLA • residency • private cloud",
      },
    ],
  },
];

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

export default function RoadmapPage() {
  const { total, done, percent } = summarize(phases);

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="relative">
          <NavbarLanding />
        </div>
      </header>

      <div className="px-6">
        <div className="mx-auto max-w-6xl pt-[12dvh] pb-20">
          <header className="mb-10 text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              OSSTag — Unified Roadmap
            </h1>
            <p className="mt-4 text-sm md:text-base text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
              Built for marketers first: unblockable tracking, privacy by
              design, and a simple control center for reliable data.
            </p>
          </header>

          <section aria-label="Overall progress" className="mb-12">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-end justify-between gap-4">
                <div className="w-full">
                  <p className="text-xs md:text-sm text-gray-300">
                    Overall Progress
                  </p>
                  <div
                    className="mt-2 h-3 w-full rounded-full bg-gray-800/70"
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Overall progress"
                  >
                    <div
                      className="h-3 rounded-full bg-white transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-semibold">{percent}%</div>
                  <div className="text-xs text-gray-400">
                    {done} / {total} tasks
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-3xl mb-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center bg-emerald-900/40 text-emerald-300 ring-1 ring-emerald-700/50">
                <CheckIcon className="h-3.5 w-3.5" />
              </span>
              <span>Done</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center bg-black/40 text-gray-400 ring-1 ring-gray-600/60">
                <EmptyIcon className="h-3.5 w-3.5" />
              </span>
              <span>Pending</span>
            </div>
          </div>

          <div className="space-y-12">
            {phases.map((phase, idx) => (
              <section
                key={idx}
                aria-labelledby={`phase-${idx}`}
                className="rounded-md border border-gray-700/80 bg-black/40 backdrop-blur-[1px] p-5 md:p-6"
              >
                <div className="mb-5">
                  <h2
                    id={`phase-${idx}`}
                    className="text-xl md:text-2xl font-semibold"
                  >
                    {phase.title}{" "}
                    <span className="text-sm text-gray-400">
                      ({phase.version})
                    </span>
                  </h2>
                  <p className="mt-2 text-sm text-gray-300 font-light leading-relaxed">
                    {phase.focus}
                  </p>
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-sm border border-gray-600 bg-black/50 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                      Monetization
                    </p>
                    <p className="mt-1 text-sm text-gray-200">
                      {phase.monetization.summary}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {phase.monetization.levers.map((lever, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-gray-600 px-2 py-1 text-xs text-gray-300"
                        >
                          {lever}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-sm border border-gray-600 bg-black/50 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                      Growth Targets
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-lg font-semibold">
                          {phase.growth.starsGoal.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          GitHub ⭐ Goal
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {phase.growth.activeSites.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Active Sites
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {phase.growth.monthlyEvents ?? "—"}
                        </div>
                        <div className="text-[11px] text-gray-400">Volume</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-sm border border-gray-600 bg-black/50 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                      Pricing (at this phase)
                    </p>
                    <ul className="mt-2 grid gap-2">
                      {phase.pricing.map((tier, i) => (
                        <li
                          key={i}
                          className={[
                            "flex items-center justify-between rounded-sm border px-3 py-2 text-sm",
                            tier.highlight
                              ? "border-white bg-white/5 text-white"
                              : "border-gray-600 bg-black/40 text-gray-200",
                          ].join(" ")}
                        >
                          <span className="font-medium">{tier.name}</span>
                          <span className="text-gray-300">{tier.price}</span>
                          {tier.notes && (
                            <span className="ml-3 text-[11px] text-gray-400">
                              {tier.notes}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {phase.items.map((task, i) => (
                    <li
                      key={i}
                      className={[
                        "group rounded-sm border p-4 transition-colors",
                        task.done
                          ? "border-white bg-white/5 hover:border-white/80"
                          : "border-gray-600 bg-black/40 hover:border-gray-400",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium leading-snug">
                            {task.label}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {task.done ? "Completed" : "Planned"}
                            {task.note ? ` • ${task.note}` : ""}
                          </p>
                        </div>
                        <span
                          className={[
                            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm ring-1",
                            task.done
                              ? "bg-white/10 text-white ring-white/50"
                              : "bg-black/40 text-gray-400 ring-gray-600/60",
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
      </div>
    </main>
  );
}

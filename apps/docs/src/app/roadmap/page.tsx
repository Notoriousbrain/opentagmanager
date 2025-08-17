"use client";

import Navbar from "@/components/navbar/page";
import { MoveLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

// Simple types for roadmap data
type Task = {
  label: string;
  done?: boolean;
};

type Phase = {
  title: string;
  items: Task[];
};

const phases: Phase[] = [
  {
    title: "Phase 1 - MVP (Get it Working)",
    items: [
      { label: "tRPC & TanStack Query Setup", done: true },
      { label: "Container Script Loader" },
      { label: "Basic Tag Types (HTML, GA4, Pixel)" },
      { label: "UI Dashboard (Tags/Triggers/Variables)" },
      { label: "Triggers (Pageview, Click, Timer, Custom Event)" },
      { label: "Variables (Page URL, Referrer, Data Layer)" },
      { label: "Preview & Debug Mode" },
      { label: "Versioning & Rollback" },
    ],
  },
  {
    title: "Phase 2 - Advanced (Beyond Basics)",
    items: [
      { label: "Drag-drop Flow Builder" },
      { label: "Advanced Search & Filter" },
      { label: "Dark Mode & Responsive Polishing" },
      { label: "Tag Execution Timeline" },
      { label: "Performance Dashboard" },
      { label: "Lazy/Conditional Loading" },
      { label: "Consent Manager + Per-tag Enforcement" },
      { label: "Audit Logs & RBAC" },
      { label: "Git Integration & API-first" },
      { label: "Multi-environment Support" },
    ],
  },
  {
    title: "Phase 3 - Creative Differentiators",
    items: [
      { label: "Sandbox Inspector (Console/Network/DOM/Storage/Data Layer)" },
      { label: "Event Simulator + Consent Toggles" },
      { label: "Record & Replay Sessions" },
      { label: "AI Tag Recommendations" },
      { label: "Auto Event Detection" },
      { label: "Anomaly Detection & Alerts" },
      { label: "Open Template Marketplace" },
      { label: "Tag Trust Scores + PII Scanner" },
      { label: "Visual Journey Mapping + Data Layer Viewer" },
      { label: "Safe-mode Publishing (% Rollout)" },
    ],
  },
];

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
            className="mb-6 border border-transparent hover:border-white/50 inline-flex cursor-pointer items-center gap-4 pl-8 pr-10 py-2 font-medium text-white text-lg"
          >
            <MoveLeftIcon/> Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Open Tag Manager - MVP Roadmap
          </h1>
          <p className="mt-3 text-sm text-zinc-300">
            A living view of upcoming tasks towards the MVP and beyond. Boxes
            show completion; green = done.
          </p>
        </header>

        {/* Progress Summary */}
        <section aria-label="Overall progress" className="mb-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Overall Progress</p>
              <div className="mt-2 h-3 w-full rounded-full bg-zinc-800">
                <div
                  className="h-3 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">{percent}%</div>
              <div className="text-xs text-zinc-400">
                {done} / {total} tasks
              </div>
            </div>
          </div>
        </section>

        {/* Legend */}
        <div className="mb-8 flex items-center gap-6 text-sm text-zinc-300">
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
        <div className="space-y-10">
          {phases.map((phase, idx) => (
            <section key={idx} aria-labelledby={`phase-${idx}`}>
              <h2
                id={`phase-${idx}`}
                className="mb-4 text-xl md:text-2xl font-semibold"
              >
                {phase.title}
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {phase.items.map((task, i) => (
                  <li
                    key={i}
                    className={[
                      "group p-4 border transition-colors",
                      task.done
                        ? "border-emerald-600/60 bg-emerald-950/30 hover:border-emerald-400/80"
                        : "border-zinc-700 bg-zinc-900 hover:border-zinc-500",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium leading-snug">{task.label}</p>
                        <p className="mt-1 text-xs text-zinc-400">
                          {task.done ? "Completed" : "Queued for MVP"}
                        </p>
                      </div>
                      <span
                        className={[
                          "inline-flex h-7 w-7 shrink-0 items-center justify-center ring-1",
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

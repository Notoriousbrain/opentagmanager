"use client";

import { notFound } from "next/navigation";
import { useActiveOrg } from "@/hooks/use-active-org";
import Link from "next/link";
import { EventsTable } from "@/components/events/events-table";
import { use, useState } from "react";
import { EventsStateBar } from "@/components/events/events-state";
import { usePolling } from "@/hooks/use-polling";

export default function ProjectEventsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { org, isLoading } = useActiveOrg();
  const [count, setCount] = useState(0);
  usePolling(() => setCount((c) => c + 1), 3000);
  const [mockState, setMockState] = useState<
    "loading" | "error" | "empty" | "ok"
  >("ok");

  if (isLoading) return <div>Loading...</div>;
  if (!org) return notFound();

  return (
    <main className="flex flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Recent Events</h1>
        <div className="flex items-center gap-2">
          <select
            className="rounded border bg-transparent p-1 text-sm"
            value={mockState}
            onChange={(e) =>
              setMockState(
                e.target.value as "loading" | "error" | "empty" | "ok"
              )
            }
          >
            <option value="ok">OK</option>
            <option value="loading">Loading</option>
            <option value="error">Error</option>
            <option value="empty">Empty</option>
          </select>
          <Link
            href={`/dashboard/projects/${id}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back
          </Link>
        </div>
      </header>

      <section className="rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Recent Events (mock)</h2>

        <EventsStateBar state={mockState} onRetry={() => setMockState("ok")} />

        {mockState === "ok" && <EventsTable />}
      </section>
    </main>
  );
}

"use client";

import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { useActiveOrg } from "@/hooks/use-active-org";
import Link from "next/link";
import { EventsTable } from "@/components/events/events-table";
import { use, useState } from "react";
import { EventsStateBar } from "@/components/events/events-state";
import { useProjectName } from "@/hooks/use-project-name";
import { trpc } from "@/lib/trpc/react";
import { EventRow } from "@otm/types";
import { EventsFilterBar } from "@/components/events/events-filter-bar";
import { Button, Label, Switch } from "@otm/ui";
import { EventsSkeleton } from "@/components/events/events-skeleton";
import { EventsStats } from "@/components/events/events-stats";

export default function ProjectEventsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { org, isLoading: orgLoading } = useActiveOrg();
  const { name: projectName, isLoading: projectLoading } = useProjectName(id);
  const [cursor, setCursor] = useState<string | undefined>();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [filters, setFilters] = useState<{
    type?: string;
    region?: string;
    since?: string;
  }>({});

  const eventsQuery = trpc.relay.getEventsByProject.useQuery(
    { projectId: id, ...filters, cursor },
    {
      refetchInterval: autoRefresh ? 3000 : false,
      refetchOnWindowFocus: false,
      enabled: !!org && !orgLoading,
      retry: false,
    }
  );

  function downloadEventsAsJson(items: unknown[]) {
    if (!items?.length) return;

    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `events-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  const state: "loading" | "error" | "empty" | "ok" = eventsQuery.isLoading
    ? "loading"
    : eventsQuery.isError
      ? "error"
      : (eventsQuery.data?.items.length ?? 0) === 0
        ? "empty"
        : "ok";

  if (orgLoading) return <div>Loading organization…</div>;
  if (!org) return notFound();
  if (!projectLoading && !projectName) return notFound();

  const events: EventRow[] = eventsQuery.data?.items ?? [];
  const nextCursor: string | null = eventsQuery.data?.nextCursor ?? null;

  return (
    <main className="flex flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div className="flex flex-col">
          <nav className="text-sm text-muted-foreground mb-1">
            <Link href="/dashboard" className="hover:underline">
              Projects
            </Link>
            {" › "}
            {projectLoading ? (
              <span>Loading…</span>
            ) : (
              <Link
                href={`/dashboard/projects/${id}`}
                className="hover:underline"
              >
                {projectName || "Unknown"}
              </Link>
            )}
            {" › "}
            <span className="text-foreground">Events</span>
          </nav>

          <h1 className="text-2xl font-semibold tracking-tight">
            Recent Events
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Auto-Refresh Toggle */}
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh">Auto Refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={(v) => setAutoRefresh(v)}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => downloadEventsAsJson(events)}
          >
            Download JSON
          </Button>

          <Link
            href={`/dashboard/projects/${id}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back
          </Link>
        </div>
      </header>

      {!autoRefresh && (
        <div className="rounded-md bg-yellow-500/10 border border-yellow-500/20 p-3 text-yellow-600 text-sm">
          ⚠ Live updates paused — Auto-refresh is off
        </div>
      )}

      <section className="rounded-xl border border-white/10 p-6 space-y-4">
        <EventsStats
          projectId={id}
          filters={{
            since: filters.since ?? null,
            type: filters.type ?? null,
            region: filters.region ?? null,
            search: null,
          }}
        />

        <EventsFilterBar onChange={setFilters} />
        <EventsStateBar state={state} onRetry={() => eventsQuery.refetch()} />

        {eventsQuery.isLoading ? (
          <EventsSkeleton />
        ) : state === "ok" ? (
          <motion.div
            key={cursor ?? "page"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <EventsTable data={events} />
          </motion.div>
        ) : null}

        {state === "ok" && nextCursor && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setCursor(nextCursor)}
              disabled={eventsQuery.isFetching}
            >
              {eventsQuery.isFetching ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}

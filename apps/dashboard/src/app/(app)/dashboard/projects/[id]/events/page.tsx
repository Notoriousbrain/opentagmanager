"use client";

import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { useActiveOrg } from "@/hooks/use-active-org";
import Link from "next/link";
import { EventsTable } from "@/components/events/events-table";
import { use, useState } from "react";
import { EventsStateBar } from "@/components/events/events-state";
import { useProjectName } from "@/hooks/use-project-nme";
import { trpc } from "@/lib/trpc/react";
import { EventRow } from "@otm/types";
import { EventsFilterBar } from "@/components/events/events-filter-bar";
import { Button } from "@otm/ui";
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
  const [filters, setFilters] = useState<{
    type?: string;
    region?: string;
    since?: string;
  }>({});

  const eventsQuery = trpc.relay.getEventsByProject.useQuery(
    { projectId: id, ...filters, cursor },
    {
      refetchInterval: 3000,
      refetchOnWindowFocus: false,
      enabled: !!org && !orgLoading,
      retry: false,
    }
  );

  const state: "loading" | "error" | "empty" | "ok" = eventsQuery.isLoading
    ? "loading"
    : eventsQuery.isError
      ? "error"
      : (eventsQuery.data?.items.length ?? 0) === 0
        ? "empty"
        : "ok";

  const [mockState, setMockState] = useState<
    "loading" | "error" | "empty" | "ok"
  >("ok");

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
        <EventsStats
          projectId={id}
          filters={{
            range: filters.since ?? "1d",
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

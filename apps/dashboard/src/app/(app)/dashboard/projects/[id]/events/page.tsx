"use client";

import { notFound, useSearchParams } from "next/navigation";
import { useActiveOrg } from "@/hooks/use-active-org";
import Link from "next/link";
import { EventsTable } from "@/components/events/events-table";
import { use, useEffect, useRef, useState } from "react";
import { EventsStateBar } from "@/components/events/events-state";
import { useProjectName } from "@/hooks/use-project-name";
import type { FilterValues } from "@/components/events/events-filter-bar";
import { EventsFilterBar } from "@/components/events/events-filter-bar";
import { Button, Switch, useDebounce } from "@otm/ui";
import { EventsSkeleton } from "@/components/events/events-skeleton";
import { EventsStats } from "@/components/events/events-stats";
import { fetchAllEvents } from "@/lib/events/fetch-all-events";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { trpc } from "@/lib/trpc/react";
import { useQuerySync } from "@/lib/url/use-query-sync";
import { EventsSearchBar } from "@/components/events/events-search-bar";

export default function ProjectEventsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { org, isLoading: orgLoading } = useActiveOrg();
  const { name: projectName, isLoading: projectLoading } = useProjectName(id);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const search = useSearchParams();

  const [filters, setFilters] = useState<FilterValues>({
    type: search.get("type") ?? undefined,
    region: search.get("region") ?? undefined,
    since: search.get("since") ?? undefined,
    search: search.get("search") ?? undefined,
  });

  const debouncedFilters = useDebounce(filters, 350);
  const { syncToUrl } = useQuerySync(debouncedFilters);

  useEffect(() => {
    syncToUrl();
  }, [debouncedFilters, syncToUrl]);

  const eventsInfinite = trpc.events.list.useInfiniteQuery(
    {
      projectId: id,
      limit: 50,

      since: debouncedFilters.since ?? null,
      type: debouncedFilters.type ?? null,
      region: debouncedFilters.region ?? null,
      search: filters.search ?? null,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      refetchOnWindowFocus: false,
      retry: false,
      enabled: !!org && !orgLoading,
    }
  );

  const liveStatsQuery = trpc.events.live.useQuery(
    {
      projectId: id,
      windowMinutes: 5,
    },
    {
      refetchInterval: autoRefresh ? 5000 : false,
      enabled: !!org && !orgLoading,
    }
  );

  function downloadEventsAsJson(events: unknown[]) {
    if (!events?.length) return;

    const blob = new Blob([JSON.stringify(events, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `events-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const events = eventsInfinite.data?.pages.flatMap((p) => p.items) ?? [];
  const nextCursor = eventsInfinite.data?.pages.at(-1)?.nextCursor ?? null;

  useIntersectionObserver({
    target: sentinelRef,
    enabled: !!nextCursor,
    onIntersect: () => {
      if (
        !eventsInfinite.isFetching &&
        !eventsInfinite.isFetchingNextPage &&
        eventsInfinite.hasNextPage
      ) {
        eventsInfinite.fetchNextPage();
      }
    },
  });

  const state = eventsInfinite.isLoading
    ? "loading"
    : eventsInfinite.isError
      ? "error"
      : events.length === 0
        ? "empty"
        : "ok";

  if (orgLoading) return <div>Loading organization…</div>;
  if (!org) return notFound();
  if (!projectLoading && projectName === null) return notFound();

  return (
    <main className="flex flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div className="flex flex-col">
          <nav className="text-sm text-muted-foreground mb-1">
            <Link href="/dashboard" className="hover:underline">
              Projects
            </Link>

            {" > "}

            {projectLoading ? (
              <span className="inline-block h-4 w-28 bg-white/20 rounded animate-pulse" />
            ) : (
              <Link
                href={`/dashboard/projects/${id}`}
                className="hover:underline"
              >
                {projectName || "Unknown"}
              </Link>
            )}

            {" > "}
            <span className="text-foreground">Events</span>
          </nav>

          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            Recent Events
            {projectLoading && (
              <span className="inline-block h-5 w-5 bg-white/20 rounded animate-pulse" />
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={(v) => setAutoRefresh(v)}
              id="auto-refresh-toggle bg-white"
            />
            <label
              htmlFor="auto-refresh-toggle"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Auto-Refresh
            </label>
          </div>

          <Button
            variant="outline"
            disabled={downloading || state !== "ok"}
            onClick={async () => {
              setDownloading(true);
              const all = await fetchAllEvents(id, filters);
              setDownloading(false);
              downloadEventsAsJson(all);
            }}
          >
            {downloading ? "Generating…" : "Download JSON"}
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
        <EventsSearchBar
          value={filters.search ?? ""}
          onChange={(v) =>
            setFilters((f) => ({ ...f, search: v || undefined }))
          }
        />

        <EventsStats
          projectId={id}
          filters={{
            since: filters.since ?? null,
            type: filters.type ?? null,
            region: filters.region ?? null,
            search: filters.search ?? null, 
          }}
          lastEventAt={events[0]?.occurred_at ?? null}
        />

        <EventsFilterBar onChange={setFilters} />

        <EventsStateBar
          state={state}
          onRetry={() => {
            eventsInfinite.refetch();
            liveStatsQuery.refetch();
          }}
          liveStats={liveStatsQuery.data ?? null}
          liveLoading={liveStatsQuery.isLoading}
          liveError={!!liveStatsQuery.error}
        />

        {eventsInfinite.isLoading ? (
          <EventsSkeleton />
        ) : state === "ok" ? (
          <EventsTable data={events} />
        ) : null}

        {events.length > 0 && nextCursor && (
          <div ref={sentinelRef} className="h-16 w-full" />
        )}
      </section>
    </main>
  );
}

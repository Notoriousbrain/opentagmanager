"use client";

import { trpc } from "@/lib/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@otm/ui";
import { MetricsFilters } from "./metrics-filter-bar";
import { rangeToLabel } from "./range-label";

export function EventTypeSummary({ filters }: { filters: MetricsFilters }) {
  const { projectId, range } = filters;
  const { data, isLoading, isError } = trpc.relay.countByType.useQuery(
    { projectId, range },
    {
      refetchInterval: 15000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <Card className="col-span-full border-white/10">
        <CardHeader>
          <CardTitle>
            <div className="h-4 w-48 bg-white/40 animate-pulse rounded" />
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-white/10 flex flex-col gap-3"
              >
                <div className="h-4 w-28 bg-white/40 rounded animate-pulse" />
                <div className="h-9 w-20 bg-white/40 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data?.length) {
    return (
      <Card className="col-span-full border-white/10">
        <CardHeader>
          <CardTitle>Event Type Summary — {rangeToLabel(range)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-medium">No events found</p>
            <p className="text-sm">Try adjusting your filters.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full border-white/10">
      <CardHeader>
        <CardTitle>Event Type Summary — {rangeToLabel(range)}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((row) => (
            <div
              key={row.type}
              className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
            >
              <p className="text-sm text-muted-foreground capitalize">
                {row.type.replace(/_/g, " ")}
              </p>
              <p className="text-3xl font-semibold mt-1">
                {Number(row.total).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

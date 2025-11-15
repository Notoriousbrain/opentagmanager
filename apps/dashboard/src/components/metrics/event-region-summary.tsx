"use client";

import { trpc } from "@/lib/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@otm/ui";
import { MetricsFilters } from "./metrics-filter-bar";
import { rangeToLabel } from "./range-label";

export function EventRegionSummary({ filters }: { filters: MetricsFilters }) {
  const { projectId, range } = filters;
  const { data, isLoading, isError } = trpc.relay.countByRegion.useQuery(
    { projectId, range },
    {
      refetchInterval: 15000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-primary/20 animate-pulse">
            <CardHeader>
              <div className="h-4 w-20 bg-white rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-16 bg-white rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data?.length) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Region Summary — {rangeToLabel(filters.range)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-medium">No region data found</p>
            <p className="text-sm">Try adjusting the filters.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((row) => (
        <Card key={row.region || "unknown"} className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium capitalize">
              {row.region || "Unknown"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {Number(row.total).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

"use client";

import { trpc } from "@/lib/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@otm/ui";
import { Loader2 } from "lucide-react";
import { MetricsFilters } from "./metrics-filter-bar";

export function EventTypeSummary({ filters }: { filters: MetricsFilters }) {
  const { data, isLoading, isError } = trpc.relay.countByType.useQuery(filters);

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Event Type Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading event breakdown…</span>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data?.length) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Event Type Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No event data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((row) => (
        <Card key={row.type} className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium capitalize">
              {row.type.replace("_", " ")}
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

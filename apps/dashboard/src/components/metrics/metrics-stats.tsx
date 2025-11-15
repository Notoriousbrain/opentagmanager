"use client";

import { trpc } from "@/lib/trpc/react";
import { Card, CardContent } from "@otm/ui";
import { MetricsFilters } from "./metrics-filter-bar";
import { rangeToLabel } from "./range-label";

export function MetricsStats({ filters }: { filters: MetricsFilters }) {
  const { projectId, range } = filters;

  const typeQ = trpc.relay.countByType.useQuery({ projectId, range });
  const regionQ = trpc.relay.countByRegion.useQuery({ projectId, range });
  const dayQ = trpc.relay.countByDay.useQuery({ projectId, range });

  const isLoading = typeQ.isLoading || regionQ.isLoading || dayQ.isLoading;
  const isError = typeQ.isError || regionQ.isError || dayQ.isError;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-primary/20 animate-pulse">
            <CardContent className="py-6 space-y-2">
              <div className="h-3 w-24 bg-white rounded" />
              <div className="h-7 w-16 bg-white rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !dayQ.data) {
    return (
      <p className="text-sm text-muted-foreground">
        No metrics available for {rangeToLabel(range)}.
      </p>
    );
  }

  const totalEvents = dayQ.data.reduce((sum, r) => sum + Number(r.total), 0);

  const distinctTypes =
    typeQ.data?.map((t) => t.type).filter(Boolean).length ?? 0;

  const distinctRegions =
    regionQ.data?.map((r) => r.region).filter(Boolean).length ?? 0;

  const daysCount = dayQ.data.length || 1;
  const avgPerDay = Math.round(totalEvents / daysCount);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Events" value={totalEvents.toLocaleString()} />
      <StatCard label="Unique Types" value={distinctTypes.toLocaleString()} />
      <StatCard
        label="Unique Regions"
        value={distinctRegions.toLocaleString()}
      />
      <StatCard label="Avg / Day" value={avgPerDay.toLocaleString()} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-primary/20">
      <CardContent className="py-6">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

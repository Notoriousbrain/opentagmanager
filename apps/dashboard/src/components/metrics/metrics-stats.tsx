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
          <Card
            key={i}
            className="p-4 border-white/10 animate-pulse rounded-lg"
          >
            <CardContent className="space-y-3 py-4">
              <div className="h-4 w-28 bg-white/40 rounded" />
              <div className="h-8 w-20 bg-white/40 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !dayQ.data?.length) {
    return (
      <Card className="col-span-full border-white/10">
        <CardContent className="py-10 text-center text-muted-foreground">
          <p className="font-medium">No metrics available</p>
          <p className="text-sm">Try changing filters: {rangeToLabel(range)}</p>
        </CardContent>
      </Card>
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
    <Card className="border cursor-pointer border-white/10 hover:border-white/20 transition-colors rounded-lg">
      <CardContent className="py-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

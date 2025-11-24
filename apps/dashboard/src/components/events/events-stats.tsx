"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@otm/ui";
import { trpc } from "@/lib/trpc/react";
import { format } from "date-fns";

type EventsStatsProps = {
  projectId: string;
  filters: {
    since: string | null;
    type?: string | null;
    region?: string | null;
    search?: string | null;
  };
};

export function EventsStats({ projectId, filters }: EventsStatsProps) {
  const { data, isLoading } = trpc.events.stats.useQuery({
    projectId,
    since: filters.since ?? null,
    type: filters.type ?? null,
    region: filters.region ?? null,
    search: filters.search ?? null,
  });

  const skeleton = (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="border-white/10 animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-4 w-20 bg-white/10 rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-6 w-16 bg-white/20 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const lastEventDate =
    data?.lastEventAt != null ? format(new Date(data?.lastEventAt), "PP") : null;

  const lastEventTime =
    data?.lastEventAt != null ? format(new Date(data?.lastEventAt), "p") : null;

  if (isLoading || !data) return skeleton;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
      <StatCard label="Total Events" value={data.totalEvents} />
      <StatCard label="Unique Users" value={data.uniqueUsers} />
      <StatCard label="Top Event Type" value={data.topEventType ?? "—"} />
      <StatCard label="Top Region" value={data.topRegion ?? "—"} />

      <Card className="border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-white/70">
            Last Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lastEventDate && lastEventTime ? (
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-semibold">{lastEventDate}</span>
              <span className="text-sm text-white/70 mt-1">
                {lastEventTime}
              </span>
            </div>
          ) : (
            <div className="text-xl font-semibold">—</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-white/70">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

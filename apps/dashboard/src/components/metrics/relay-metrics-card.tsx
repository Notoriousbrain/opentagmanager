"use client";

import { trpc } from "@/lib/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@otm/ui";

export function RelayMetricsCard() {
  const { data, isLoading, isError } = trpc.relay.getMetrics.useQuery(
    undefined,
    {
      refetchInterval: 5000,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    }
  );

  if (isLoading) {
    return (
      <Card className="col-span-full border-white/10 animate-pulse">
        <CardHeader>
          <CardTitle>
            <div className="h-4 w-32 bg-white/40 rounded" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded bg-white/20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="col-span-full border-destructive/40">
        <CardHeader>
          <CardTitle>Relay Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">
            Failed to load relay metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const uptimeMinutes = (data.uptimeSeconds / 60).toFixed(1);

  return (
    <Card className="col-span-full border-white/10">
      <CardHeader>
        <CardTitle>Relay Metrics</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Metric label="Uptime (min)" value={uptimeMinutes} />
          <Metric label="Events Accepted" value={data.acceptedEvents} />
          <Metric label="Batches" value={data.acceptedBatches} />
          <Metric label="DLQ Writes" value={data.dlqWrites} />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}

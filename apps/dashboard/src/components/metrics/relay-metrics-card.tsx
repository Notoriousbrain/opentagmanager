"use client";

import { trpc } from "@/lib/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@otm/ui";
import { Loader2 } from "lucide-react";

export function RelayMetricsCard() {
  const { data, isLoading, isError } = trpc.relay.getMetrics.useQuery();

  if (isLoading) {
    return (
      <Card className="min-w-[320px]">
        <CardHeader>
          <CardTitle>Relay Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading metrics…</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="min-w-[320px] border-destructive/40">
        <CardHeader>
          <CardTitle>Relay Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">Failed to load metrics.</p>
        </CardContent>
      </Card>
    );
  }

  const uptimeMinutes = (data.uptimeSeconds / 60).toFixed(1);

  return (
    <Card className="min-w-[320px]">
      <CardHeader>
        <CardTitle>Relay Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
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
    <div className="flex flex-col">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

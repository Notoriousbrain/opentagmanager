"use client";

import { trpc } from "@/lib/trpc/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@otm/ui";
import { Loader2 } from "lucide-react";

export function EventTrendChart() {
  const { data, isLoading, isError } = trpc.relay.countByDay.useQuery();

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Event Trend (14 Days)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading event data…</span>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data?.length) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Event Trend (14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No event data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Transform: group rows by project_id
  const grouped: Record<string, { day: string; total: number }[]> = {};
  for (const row of data) {
    const key = row.project_id;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      day: row.day,
      total: Number(row.total),
    });
  }

  const firstProject = Object.keys(grouped)[0];
  const chartData = grouped[firstProject] || [];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Event Trend (14 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted/30"
              />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorEvents)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

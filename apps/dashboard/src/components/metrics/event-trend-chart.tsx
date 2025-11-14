"use client";

import { trpc } from "@/lib/trpc/react";
import {
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@otm/ui";
import { MetricsFilters } from "./metrics-filter-bar";

export function EventTrendChart({ filters }: { filters: MetricsFilters }) {
  const { data, isLoading, isError } = trpc.relay.countByDay.useQuery(filters, {
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Card className="col-span-full animate-pulse">
        <CardHeader>
          <CardTitle>
            Event Trend (
            {filters.range === "7d"
              ? "7"
              : filters.range === "30d"
                ? "30"
                : "14"}{" "}
            Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full bg-muted/30 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data?.length) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Event Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-medium">No trend data available</p>
            <p className="text-sm">Try selecting a different time range.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const grouped: Record<string, { day: string; total: number }[]> = {};

  for (const row of data) {
    const name = row.project_name ?? "Unnamed Project";
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push({ day: row.day, total: Number(row.total) });
  }

  const allDays = Array.from(new Set(data.map((r) => r.day))).sort();

  const chartData = allDays.map((day) => {
    const entry: Record<string, number | string> = { day };

    for (const [projectName, values] of Object.entries(grouped)) {
      const point = values.find((v) => v.day === day);
      entry[projectName] = point ? point.total : 0;
    }

    return entry;
  });

  const colors = [
    "#60a5fa",
    "#34d399",
    "#f472b6",
    "#facc15",
    "#a78bfa",
    "#fb923c",
  ];

  const projectNames = Object.keys(grouped);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Event Trend (14 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
              <Legend />

              {projectNames.map((projectName, i) => (
                <Line
                  key={projectName}
                  type="monotone"
                  dataKey={projectName}
                  name={projectName.replace(/_/g, " ")}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

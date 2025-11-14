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
import { Loader2 } from "lucide-react";
import { MetricsFilters } from "./metrics-filter-bar";

export function EventTrendChart({ filters }: { filters: MetricsFilters }) {
  const { data, isLoading, isError } = trpc.relay.countByDay.useQuery(filters);

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

  // -------------------------------------------------------------------
  // 🔥 Group by project_name instead of project_id
  // -------------------------------------------------------------------
  const grouped: Record<string, { day: string; total: number }[]> = {};

  for (const row of data) {
    const name = row.project_name ?? "Unknown Project";
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push({ day: row.day, total: Number(row.total) });
  }

  // -------------------------------------------------------------------
  // 🔥 Build combined dataset for recharts
  // -------------------------------------------------------------------
  const allDays = Array.from(new Set(data.map((r) => r.day))).sort();

  const chartData = allDays.map((day) => {
    const entry: Record<string, number | string> = { day };

    for (const [projectName, values] of Object.entries(grouped)) {
      const point = values.find((v) => v.day === day);
      entry[projectName] = point ? point.total : 0;
    }

    return entry;
  });

  // -------------------------------------------------------------------
  // 🔥 Colors
  // -------------------------------------------------------------------
  const colors = [
    "#60a5fa", // blue-400
    "#34d399", // emerald-400
    "#f472b6", // pink-400
    "#facc15", // yellow-400
    "#a78bfa", // violet-400
    "#fb923c", // orange-400
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
                  name={projectName}
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

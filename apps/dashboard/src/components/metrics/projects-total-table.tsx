"use client";

import { trpc } from "@/lib/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@otm/ui";
import { Loader2 } from "lucide-react";
import { MetricsFilters } from "./metrics-filter-bar";

export function ProjectTotalsTable({ filters }: { filters: MetricsFilters }) {
  const { data, isLoading, isError } =
    trpc.relay.countByProject.useQuery(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Totals</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading project totals…</span>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available.</p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...data].sort((a, b) => Number(b.total) - Number(a.total));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Totals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Total Events</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => (
                <TableRow
                  key={
                    row.project_id ??
                    row.project_name ??
                    Math.random().toString()
                  }
                >
                  <TableCell className="font-medium">
                    {row.project_name ?? "Unknown"}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(row.total).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

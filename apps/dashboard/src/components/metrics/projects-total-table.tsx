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
import { MetricsFilters } from "./metrics-filter-bar";

export function ProjectTotalsTable({ filters }: { filters: MetricsFilters }) {
  const { data, isLoading, isError } = trpc.relay.countByProject.useQuery(
    filters,
    {
      refetchInterval: 15000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-full bg-muted/80 rounded" />
            <div className="h-4 w-full bg-muted/70 rounded" />
            <div className="h-4 w-3/4 bg-muted/60 rounded" />
          </div>
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
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-medium">No events found</p>
            <p className="text-sm">
              Try adjusting filters or selecting a different project.
            </p>
          </div>
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
                    {row.project_name ?? "Unnamed Project"}
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

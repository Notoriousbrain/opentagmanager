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
import { rangeToLabel } from "./range-label";

export function ProjectTotalsTable({ filters }: { filters: MetricsFilters }) {
  const { projectId, range } = filters;
  const { data, isLoading, isError } = trpc.relay.countByProject.useQuery(
    { projectId, range },
    {
      refetchInterval: 15000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            <div className="h-5 w-48 bg-white rounded animate-pulse" />
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="h-4 w-28 bg-white rounded animate-pulse" />
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="h-4 w-20 bg-white rounded animate-pulse" />
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i} className="h-12">
                    <TableCell>
                      <div className="h-4 w-48 bg-white rounded animate-pulse" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-4 w-16 bg-white rounded animate-pulse" />
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

  if (isError || !data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Totals — {rangeToLabel(range)}</CardTitle>
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
      <CardHeader className="pb-3">
        <CardTitle>Project Totals — {rangeToLabel(filters.range)}</CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium text-sm">Project</TableHead>
                <TableHead className="text-right font-medium text-sm">
                  Total Events
                </TableHead>
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
                  className="h-12 hover:bg-white/5 transition-colors"
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

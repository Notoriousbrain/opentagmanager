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
      <Card className="col-span-full border-white/10">
        <CardHeader>
          <CardTitle>
            <div className="h-4 w-48 bg-white/40 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead>
                    <div className="h-3 w-28 bg-white/40 rounded animate-pulse" />
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="h-3 w-20 bg-white/40 rounded animate-pulse" />
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i} className="h-12 border-white/10">
                    <TableCell>
                      <div className="h-4 w-40 bg-white/40 rounded animate-pulse" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-4 w-16 bg-white/40 rounded animate-pulse" />
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
      <Card className="col-span-full border-white/10">
        <CardHeader>
          <CardTitle>Project Totals — {rangeToLabel(range)}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p className="font-medium">No events found</p>
            <p className="text-sm">
              Try changing filters or selecting another project.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...data].sort((a, b) => Number(b.total) - Number(a.total));

  return (
    <Card className="col-span-full border-white/10">
      <CardHeader>
        <CardTitle>Project Totals — {rangeToLabel(range)}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-sm font-medium">Project</TableHead>
                <TableHead className="text-right text-sm font-medium">
                  Total Events
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sorted.map((row) => (
                <TableRow
                  key={`${row.project_id}`}
                  className="h-12 hover:bg-white/5 border-white/10 transition-colors"
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

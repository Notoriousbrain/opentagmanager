"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { trpc } from "@/lib/trpc/react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@otm/ui";
import { Card, CardContent } from "@otm/ui";
import { useActiveOrg } from "@/hooks/use-active-org";
import { skipToken } from "@tanstack/react-query";

export type MetricsFilters = {
  projectId: string | "all";
  range: "7d" | "14d" | "30d";
};

export function MetricsFilterBar({
  projectId,
  range,
  onChange,
}: {
  projectId: string | "all";
  range: "7d" | "14d" | "30d";
  onChange: (filters: MetricsFilters) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const { org } = useActiveOrg();
  const orgId = org?.id;

  const { data: projects } = trpc.projects.list.useQuery(
    orgId ? { orgId } : skipToken,
    { enabled: !!orgId }
  );

  // Writes values back to the URL
  const updateQueryParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(search.toString());
      params.set(key, value);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, search]
  );

  const handleProjectChange = (value: string) => {
    onChange({ projectId: value as MetricsFilters["projectId"], range });
    updateQueryParam("project", value);
  };

  const handleRangeChange = (value: string) => {
    onChange({ projectId, range: value as MetricsFilters["range"] });
    updateQueryParam("range", value);
  };

  return (
    <Card className="mb-4 border-white/10">
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Project</span>
          <Select value={projectId} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-40 border-white/10">
              <SelectValue
                placeholder="All Projects"
                className="border-white/10"
              />
            </SelectTrigger>
            <SelectContent className="border-white/10">
              <SelectItem value="all">All Projects</SelectItem>
              {projects?.map((p) => (
                <SelectItem key={p.id} value={p.id} className="border-white/10">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Date Range</span>
          <Select value={range} onValueChange={handleRangeChange}>
            <SelectTrigger className="w-40 border-white/10">
              <SelectValue
                placeholder="Last 14 days"
                className="border-white/10"
              />
            </SelectTrigger>
            <SelectContent className="border-white/10">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="14d">Last 14 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

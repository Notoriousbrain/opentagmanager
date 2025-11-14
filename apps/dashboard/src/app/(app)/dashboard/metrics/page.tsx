"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import {
  MetricsFilterBar,
  MetricsFilters,
} from "@/components/metrics/metrics-filter-bar";

import { EventTypeSummary } from "@/components/metrics/event-type-summary";
import { EventRegionSummary } from "@/components/metrics/event-region-summary";
import { EventTrendChart } from "@/components/metrics/event-trend-chart";
import { RelayMetricsCard } from "@/components/metrics/relay-metrics-card";
import { ProjectTotalsTable } from "@/components/metrics/projects-total-table";
import { useDebounce } from "@otm/ui";

export default function MetricsPage() {
  const search = useSearchParams();

  const initialFilters: MetricsFilters = {
    projectId: (search.get("project") as "all" | string) ?? "all",
    range: (search.get("range") as "7d" | "14d" | "30d") ?? "14d",
  };

  const [filters, setFilters] = useState<MetricsFilters>(initialFilters);
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    setFilters({
      projectId: (search.get("project") as "all" | string) ?? "all",
      range: (search.get("range") as "7d" | "14d" | "30d") ?? "14d",
    });
  }, [search]);

  return (
    <div className="grid gap-6">
      <MetricsFilterBar
        projectId={filters.projectId}
        range={filters.range}
        onChange={(f) => setFilters(f)}
      />

      <ProjectTotalsTable filters={debouncedFilters} />
      <EventTypeSummary filters={debouncedFilters} />
      <EventRegionSummary filters={debouncedFilters} />
      <EventTrendChart filters={debouncedFilters} />
      <RelayMetricsCard />
    </div>
  );
}

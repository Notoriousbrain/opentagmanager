import { EventTrendChart } from "@/components/metrics/event-trend-chart";
import { MetricsHeader } from "@/components/metrics/metrics-header";
import { ProjectTotalsTable } from "@/components/metrics/projects-total-table";
import { RelayMetricsCard } from "@/components/metrics/relay-metrics-card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Metrics – OSSTag Dashboard",
};

export default function MetricsPage() {
  return (
    <main className="flex flex-col gap-8 p-6 bg-subtle rounded-xl">
      <MetricsHeader />

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <RelayMetricsCard />
      </section>

      <section className="grid gap-6">
        <EventTrendChart />
      </section>

      <section className="grid gap-6">
        <ProjectTotalsTable />
      </section>
    </main>
  );
}

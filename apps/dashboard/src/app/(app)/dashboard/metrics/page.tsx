import { MetricsHeader } from "@/components/metrics/metrics-header";
import { RelayMetricsCard } from "@/components/metrics/relay-metrics-card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Metrics – OSSTag Dashboard",
};

export default function MetricsPage() {
  return (
    <main className="flex flex-col gap-6 p-6">
      <MetricsHeader />

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <RelayMetricsCard />
      </section>
    </main>
  );
}

import { MetricsHeader } from "@/components/metrics/metrics-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Metrics – OSSTag Dashboard",
};

export default function MetricsPage() {
  return (
    <main className="flex flex-col gap-6 p-6">
      <MetricsHeader />

      <section className="border rounded-xl p-6 bg-card text-card-foreground shadow-sm">
        <p className="text-muted-foreground">
          Metrics data loading will appear here.
        </p>
      </section>
    </main>
  );
}

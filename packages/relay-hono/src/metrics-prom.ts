import { metrics } from "./adapter";

export function formatPrometheusMetrics(): string {
  const lines: string[] = [];

  const now = Date.now();
  const uptimeSec = ((now - metrics.uptimeStart) / 1000).toFixed(1);

  const entries = {
    relay_requests_total: metrics.requests,
    relay_batches_total: metrics.acceptedBatches,
    relay_events_total: metrics.acceptedEvents,
    relay_dlq_writes_total: metrics.dlqWrites,
    relay_replays_total: metrics.replays,
    relay_cleaned_total: metrics.cleaned,
    relay_uptime_seconds: uptimeSec,
  };

  lines.push("# HELP relay_requests_total Total ingestion requests");
  lines.push("# TYPE relay_requests_total counter");

  for (const [key, val] of Object.entries(entries)) {
    lines.push(`# HELP ${key} ${key.replace(/_/g, " ")}`);
    lines.push(`# TYPE ${key} gauge`);
    lines.push(`${key} ${val}`);
  }

  return lines.join("\n") + "\n";
}

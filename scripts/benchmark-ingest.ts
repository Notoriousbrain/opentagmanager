import { performance } from "node:perf_hooks";
import { signIngest } from "../packages/relay-core/src";
import { Header } from "../packages/relay-core/src/types";

const TOTAL_EVENTS = Number(process.env.BENCH_TOTAL ?? 1000);
const CONCURRENCY = Number(process.env.BENCH_CONCURRENCY ?? 20);
const ENDPOINT = process.env.BENCH_URL ?? "http://localhost:4000/";
const API_KEY = process.env.BENCH_KEY ?? "OTM_PK_demo1234567890abcd";
const SECRET = process.env.BENCH_SECRET ?? "test_secret_public";
const METRICS_URL = process.env.METRICS_URL ?? "http://localhost:4101/metrics";

async function sendEvent(i: number) {
  const body = JSON.stringify({
    events: [
      {
        eventId: `evt_${i}`,
        type: "benchmark_event",
        data: { i, t: Date.now() },
      },
    ],
  });

  const ts = Date.now();
  const sig = signIngest({
    method: "POST",
    path: "/",
    body,
    ts,
    secret: SECRET,
  });

  const headers = {
    "content-type": "application/json",
    [Header.Key]: API_KEY,
    [Header.Timestamp]: ts.toString(),
    [Header.Signature]: sig,
  };

  const res = await fetch(ENDPOINT, { method: "POST", headers, body });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

async function fetchMetrics() {
  try {
    const res = await fetch(METRICS_URL);
    if (!res.ok) throw new Error(`metrics ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

async function runBenchmark() {
  console.log(
    `🚀 Benchmark: ${TOTAL_EVENTS} events @ concurrency=${CONCURRENCY}`
  );

  const start = performance.now();
  let completed = 0;
  let failed = 0;

  const workers = Array.from({ length: CONCURRENCY }, async (_, w) => {
    for (let i = w; i < TOTAL_EVENTS; i += CONCURRENCY) {
      try {
        await sendEvent(i);
        completed++;
      } catch {
        failed++;
      }
    }
  });

  await Promise.all(workers);
  const end = performance.now();

  const duration = (end - start) / 1000;
  const rate = (completed / duration).toFixed(1);

  console.log(
    `✅ HTTP layer: ${completed}/${TOTAL_EVENTS} in ${duration.toFixed(
      2
    )}s (${rate} ev/s, failed=${failed})`
  );

  console.log("📊 Waiting 3s for consumer flush...");
  await new Promise((r) => setTimeout(r, 3000));
  const metrics = await fetchMetrics();

  if (metrics) {
    const events = metrics.acceptedEvents ?? metrics.eventsProcessed ?? 0;
    const batches = metrics.acceptedBatches ?? metrics.batchesFlushed ?? 0;
    const avgLatency = metrics.lastFlushDurationMs ?? 0;
    const uptime = metrics.uptimeSeconds ?? metrics.uptimeMs / 1000;
    const eps = (events / uptime).toFixed(1);

    console.log(
      `📈 Consumer: events=${events}, batches=${batches}, avgLatency=${avgLatency}ms`
    );
    console.log(`⚡ Effective throughput ≈ ${eps} events/sec`);
  } else {
    console.warn("⚠️ Consumer metrics unavailable.");
  }
}

runBenchmark().catch((err) => {
  console.error("❌ Benchmark failed:", err);
});

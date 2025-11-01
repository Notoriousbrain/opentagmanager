import { performance } from "node:perf_hooks";

const TOTAL_EVENTS = Number(process.env.BENCH_TOTAL ?? 1000);
const CONCURRENCY = Number(process.env.BENCH_CONCURRENCY ?? 20);
const ENDPOINT = process.env.BENCH_URL ?? "http://localhost:4000/";
const API_KEY = process.env.BENCH_KEY ?? "OTM_PK_demo1234567890abcd";

async function sendEvent(i: number) {
  const body = JSON.stringify([
    {
      type: "benchmark_event",
      eventId: `evt_${i}`,
      data: { i, t: Date.now() },
    },
  ]);

  const headers = {
    "content-type": "application/json",
    "x-otm-key": API_KEY,
    "x-otm-sig": "demo.benchsignature",
    "x-otm-ts": Date.now().toString(),
  };

  const res = await fetch(ENDPOINT, { method: "POST", headers, body });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
}

async function runBenchmark() {
  console.log(
    `🚀 Starting benchmark → ${TOTAL_EVENTS} events @ concurrency=${CONCURRENCY}`
  );

  const start = performance.now();
  let completed = 0;
  let failed = 0;

  const workers = Array.from({ length: CONCURRENCY }, async (_, w) => {
    for (let i = w; i < TOTAL_EVENTS; i += CONCURRENCY) {
      try {
        await sendEvent(i);
        completed++;
      } catch (err) {
        failed++;
      }
    }
  });

  await Promise.all(workers);
  const end = performance.now();

  const duration = (end - start) / 1000;
  const rate = (completed / duration).toFixed(1);
  console.log(
    `✅ Completed ${completed}/${TOTAL_EVENTS} events in ${duration.toFixed(
      2
    )}s (${rate} events/sec, failed=${failed})`
  );
}

runBenchmark().catch((err) => {
  console.error("❌ Benchmark failed:", err);
});

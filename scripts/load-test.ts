import { performance } from "node:perf_hooks";
import { setTimeout } from "node:timers/promises";
import { signIngest } from "../packages/relay-core/src";
import { Header } from "../packages/relay-core/src/types";

const TARGET = process.env.LOAD_URL ?? "http://localhost:4000/";
const SECRET = process.env.LOAD_SECRET ?? "test_secret_public";
const PUBLIC_KEY = process.env.LOAD_KEY ?? "OTM_PK_demo1234567890abcd";
const METHOD = "POST";
const PATH = "/";
const BATCH_SIZE = Number(process.env.LOAD_BATCH_SIZE ?? 50);
const TOTAL_BATCHES = Number(process.env.LOAD_BATCHES ?? 200);
const CONCURRENCY = Number(process.env.LOAD_CONCURRENCY ?? 5);

function makeEvent(i: number) {
  return {
    eventId: `evt_${i}_${Date.now()}`,
    type: "page_view",
    data: { page: `/page-${i % 50}`, duration: Math.random() * 1000 },
    occurredAt: new Date().toISOString(),
  };
}

async function sendBatch(batchNo: number) {
  const events = Array.from({ length: BATCH_SIZE }, (_, i) =>
    makeEvent(batchNo * BATCH_SIZE + i)
  );

  const body = JSON.stringify({ events });
  const ts = Date.now();
  const sig = signIngest({
    method: METHOD,
    path: PATH,
    body,
    ts,
    secret: SECRET,
  });

  const headers = {
    "content-type": "application/json",
    [Header.Key]: PUBLIC_KEY,
    [Header.Timestamp]: ts.toString(),
    [Header.Signature]: sig,
  };

  try {
    const res = await fetch(TARGET, { method: METHOD, headers, body });
    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ Batch ${batchNo} failed: ${res.status} ${text}`);
    } else {
      console.log(`✅ Sent batch ${batchNo}`);
    }
  } catch (err) {
    console.error(`⚠️ Network error in batch ${batchNo}:`, err);
  }
}

async function main() {
  console.log(
    `🚀 Load test: ${TOTAL_BATCHES} batches × ${BATCH_SIZE} events = ${
      TOTAL_BATCHES * BATCH_SIZE
    } events @ concurrency=${CONCURRENCY}`
  );

  const start = performance.now();
  const queue = Array.from({ length: TOTAL_BATCHES }, (_, i) => i);

  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const i = queue.shift();
      if (i === undefined) break;
      await sendBatch(i);
      await setTimeout(25);
    }
  });

  await Promise.all(workers);
  const end = performance.now();

  const duration = ((end - start) / 1000).toFixed(2);
  console.log(`🎉 Load test completed in ${duration}s`);
}

main().catch(console.error);

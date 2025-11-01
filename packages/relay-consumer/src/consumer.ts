import { Kafka } from "kafkajs";
import http from "node:http";
import process from "node:process";
import { insertBatchToClickhouse } from "./insert-batch-to-clickhouse";
import { getMetrics, recordBatchFailure, recordBatchSuccess } from "./metrics";
import { env } from "@otm/env";
import { writeToDLQ } from "@otm/relay-core";

const FLUSH_INTERVAL_MS = 5000;
const MAX_BATCH_SIZE = 1000;
let buffer: any[] = [];
let lastFlush = Date.now();
const PORT = process.env.METRICS_PORT ? Number(process.env.METRICS_PORT) : 4101;

async function flushBatch(force = false) {
  const age = Date.now() - lastFlush;
  if (!force && buffer.length < MAX_BATCH_SIZE && age < FLUSH_INTERVAL_MS)
    return;

  const batch = buffer.splice(0, buffer.length);
  if (batch.length === 0) return;

  const start = Date.now();
  try {
    console.log("🧩 Inserting batch into ClickHouse:", batch.length);
    await insertBatchToClickhouse(batch);
    const duration = Date.now() - start;
    recordBatchSuccess(batch.length, duration);
    console.log(
      `✅ Flushed ${batch.length} events → ClickHouse in ${duration}ms`
    );
  } catch (err) {
    recordBatchFailure();
    console.error(`⚠️ Failed to insert batch (${batch.length} events):`, err);

    try {
      const projectId = batch[0]?.projectId ?? "unknown_project";
      writeToDLQ(projectId, batch, err);
    } catch (dlqErr) {
      console.error("❌ Failed to write batch to DLQ:", dlqErr);
    }
  } finally {
    lastFlush = Date.now();
  }
}

async function startConsumer() {
  const brokersEnv = process.env.KAFKA_BROKERS;
  const brokers = brokersEnv
    ? brokersEnv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : ["localhost:9092"];
  const topic = env.KAFKA_TOPIC_INGEST ?? "osstag.ingest";

  const kafka = new Kafka({ clientId: "osstag-consumer", brokers });
  const consumer = kafka.consumer({ groupId: "osstag-relay-group" });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  console.log(`✅ Consumer connected → ${topic}`);
  setInterval(() => flushBatch(), 1000);

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const payload = message.value?.toString();
        if (!payload) return;
        const event = JSON.parse(payload);
        console.log("📥 Consumed event from Kafka:", event);
        buffer.push(event);
      } catch {
        console.error("⚠️ Invalid JSON payload skipped");
      }
    },
  });
}

startConsumer().catch((err) => {
  console.error("❌ Consumer crashed:", err);
  process.exit(1);
});

async function gracefulShutdown() {
  console.log("\n🛑 Received shutdown signal — flushing remaining buffer...");
  try {
    await flushBatch(true);
    console.log("✅ Graceful shutdown complete. All pending events flushed.");
  } catch (err) {
    console.error("⚠️ Error during graceful shutdown flush:", err);
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

if (import.meta.main) {
  http
    .createServer((req, res) => {
      if (req.url === "/metrics") {
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(getMetrics(), null, 2));
      } else if (req.url === "/health") {
        res.setHeader("content-type", "text/plain");
        res.end("ok");
      } else {
        res.statusCode = 404;
        res.end("not found");
      }
    })
    .listen(PORT, () => {
      console.log(
        `📈 Metrics endpoint listening at http://localhost:${PORT}/metrics`
      );
    });
}

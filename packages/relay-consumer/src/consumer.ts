import { Kafka } from "kafkajs";
import { env } from "@otm/env";
import { insertBatchToClickhouse } from "./insert-batch-to-clickhouse";

const FLUSH_INTERVAL_MS = 5000;
const MAX_BATCH_SIZE = 1000;
let buffer: any[] = [];
let lastFlush = Date.now();

async function flushBatch(force = false) {
  const age = Date.now() - lastFlush;
  if (!force && buffer.length < MAX_BATCH_SIZE && age < FLUSH_INTERVAL_MS) return;

  const batch = buffer.splice(0, buffer.length);
  if (batch.length === 0) return;

  const start = Date.now();
  try {
    await insertBatchToClickhouse(batch);
    const duration = Date.now() - start;
    console.log(`✅ Flushed ${batch.length} events → ClickHouse in ${duration}ms`);
  } catch (err) {
    console.error(`⚠️ Failed to insert batch (${batch.length} events):`, err);
  } finally {
    lastFlush = Date.now();
  }
}

async function startConsumer() {
  const brokers = env.KAFKA_BROKERS ?? ["localhost:9092"];
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

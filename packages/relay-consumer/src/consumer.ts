import { Kafka } from "kafkajs";
import http from "node:http";
import process from "node:process";
import { insertBatchToClickhouse } from "./insert-batch-to-clickhouse";
import { getMetrics, recordBatchFailure, recordBatchSuccess } from "./metrics";
import { env } from "@otm/env";
import {
  emitTelemetryLog,
  logger,
  retryIfRetryable,
  traceScope,
  UpstreamUnavailableError,
  writeToDLQ,
} from "@otm/relay-core";

const FLUSH_INTERVAL_MS = env.RELAY_FLUSH_INTERVAL_MS;
const MAX_BATCH_SIZE = env.RELAY_MAX_BATCH_SIZE;
const MAX_RETRY_ATTEMPTS = env.RELAY_MAX_RETRY_ATTEMPTS;

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
    logger.info("Inserting batch into ClickHouse", { count: batch.length });
    await retryIfRetryable(
      async () => {
        try {
          await insertBatchToClickhouse(batch);
        } catch (err) {
          throw new UpstreamUnavailableError(
            "ClickHouse insert failed during flush",
            {
              cause: err,
              detail: { batchSize: batch.length },
            }
          );
        }
      },
      { attempts: MAX_RETRY_ATTEMPTS, baseDelayMs: 1000 }
    );

    const duration = Date.now() - start;
    recordBatchSuccess(batch.length, duration);
    logger.info(
      "Flushing batch to ClickHouse",
      traceScope("no-trace", {
        batchSize: batch.length,
      })
    );
  } catch (err) {
    recordBatchFailure();
    logger.error("Failed to insert batch", {
      count: batch.length,
      error: (err as Error).message,
    });

    try {
      const projectId = batch[0]?.projectId ?? "unknown_project";
      writeToDLQ(projectId, batch, err);
    } catch (dlqErr) {
      logger.error("Failed to write batch to DLQ", {
        error: (dlqErr as Error).message,
      });
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
  const consumer = kafka.consumer({
    groupId: `osstag-relay-group-${process.pid}`,
    heartbeatInterval: 5000,
    sessionTimeout: 30000,
  });

  logger.info("Relay consumer config", {
    batchSize: MAX_BATCH_SIZE,
    flushInterval: FLUSH_INTERVAL_MS,
    retries: MAX_RETRY_ATTEMPTS,
  });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });
  emitTelemetryLog(30000);

  logger.info("Consumer connected", { topic });
  setInterval(() => flushBatch(), 1000);

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const payload = message.value?.toString();
        if (!payload) return;
        const event = JSON.parse(payload);
        const traceId = event.traceId ?? "no-trace";
        logger.info(
          "Consumed event from Kafka",
          traceScope(traceId, {
            projectId: event.projectId,
            type: event.type,
          })
        );
        buffer.push(event);
      } catch (err) {
        logger.warn("Invalid JSON payload skipped", {
          error: (err as Error).message,
        });
      }
    },
  });
}

startConsumer().catch((err) => {
  logger.error("Consumer crashed", { error: (err as Error).message });
  process.exit(1);
});

async function gracefulShutdown() {
  logger.warn("Received shutdown signal", { action: "flushing buffer" });
  try {
    await flushBatch(true);
    logger.info("Graceful shutdown complete");
  } catch (err) {
    logger.error("Error during graceful shutdown", {
      error: (err as Error).message,
    });
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
      logger.info("Metrics endpoint listening", { port: PORT });
    });
}

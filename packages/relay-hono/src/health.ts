import { getClickhouseClient } from "@otm/relay-db";
import { metrics } from "./adapter";
import { Kafka } from "kafkajs";
import { env } from "@otm/env";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const DLQ_DIR = join(process.cwd(), "dlq");

export async function getRelayHealth() {
  const start = Date.now();

  let kafkaOk = false;
  let clickhouseOk = false;
  let dlqFiles = 0;

  try {
    const brokers = env.KAFKA_BROKERS?.split(",").map((s) => s.trim());
    if (brokers?.length) {
      const kafka = new Kafka({ clientId: "healthcheck", brokers });
      const admin = kafka.admin();
      await admin.connect();
      await admin.listTopics(); 
      await admin.disconnect();
      kafkaOk = true;
    }
  } catch {
    kafkaOk = false;
  }

  try {
    const client = getClickhouseClient();
    await client.query({ query: "SELECT 1" });
    clickhouseOk = true;
  } catch {
    clickhouseOk = false;
  }

  try {
    dlqFiles = readdirSync(DLQ_DIR).length;
  } catch {
    dlqFiles = 0;
  }

  const status =
    kafkaOk && clickhouseOk ? "healthy" : kafkaOk || clickhouseOk ? "degraded" : "down";

  return {
    status,
    uptimeSeconds: (Date.now() - metrics.uptimeStart) / 1000,
    subsystems: {
      kafka: kafkaOk ? "ok" : "fail",
      clickhouse: clickhouseOk ? "ok" : "fail",
      dlqFiles,
    },
    metrics: {
      requests: metrics.requests,
      acceptedEvents: metrics.acceptedEvents,
      acceptedBatches: metrics.acceptedBatches,
      dlqWrites: metrics.dlqWrites,
      replays: metrics.replays,
      cleaned: metrics.cleaned,
    },
    durationMs: Date.now() - start,
    timestamp: new Date().toISOString(),
  };
}

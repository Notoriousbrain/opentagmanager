import { getClickhouseClient } from "@otm/relay-db";
import { Kafka } from "kafkajs";
import { env } from "@otm/env";
import { readdirSync } from "node:fs";
import { join } from "node:path";

export const metrics = {
  requests: 0,
  lastRequestAt: null as string | null,

  acceptedBatches: 0,
  acceptedEvents: 0,
  lastAcceptedAt: null as string | null,

  dlqWrites: 0,
  replays: 0,
  cleaned: 0,

  httpErrors5xx: 0,
  signatureMismatches: 0,

  uptimeStart: Date.now(),
};

const DLQ_DIR = join(process.cwd(), "dlq");

type LastEventRow = {
  last_event: string | null;
};

type CountRow = {
  c: number;
};

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
    kafkaOk && clickhouseOk
      ? "healthy"
      : kafkaOk || clickhouseOk
        ? "degraded"
        : "down";

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

export async function getIngestStats() {
  const client = getClickhouseClient();

  try {
    const last = await client.query({
      query: `
        SELECT max(timestamp) AS last_event
        FROM events
      `,
      format: "JSONEachRow",
    });

    const lastRows = (await last.json()) as LastEventRow[];
    const lastEventAt = lastRows?.[0]?.last_event ?? null;

    const epmRes = await client.query({
      query: `
        SELECT count() AS c
        FROM events
        WHERE timestamp >= now() - INTERVAL 5 MINUTE
      `,
      format: "JSONEachRow",
    });

    const epmRows = (await epmRes.json()) as CountRow[];
    const eventsLast5Min = Number(epmRows?.[0]?.c ?? 0);

    const eventsPerMinute = eventsLast5Min / 5;

    return {
      lastEventAt,
      eventsPerMinute,
      dlqSize: 0, 
    };
  } catch {
    return {
      lastEventAt: null,
      eventsPerMinute: 0,
      dlqSize: 0,
    };
  }
}

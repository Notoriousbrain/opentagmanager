import { Kafka } from "kafkajs";
import { createWriteStream, existsSync, statSync } from "node:fs";
import { rename, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { uploadToS3 } from "./s3";
import { insertBatchFromFile } from "@otm/relay-db";
import { env } from "@otm/env";
import { getRotatedFilename, DEFAULT_FILE_LIMIT_BYTES } from "@otm/relay-core";
import { retryWithBackoff } from "@otm/core";

const OUT_DIR = "/tmp";
const UPLOADED_DIR = join(OUT_DIR, "uploaded");
const BASE_NAME = "osstag-ingest";

let currentFile = join(OUT_DIR, `${BASE_NAME}.ndjson`);
let stream = createWriteStream(currentFile, { flags: "a" });

async function rotateIfNeeded() {
  if (!existsSync(currentFile)) return;

  const stats = statSync(currentFile);
  if (stats.size >= DEFAULT_FILE_LIMIT_BYTES) {
    const rotatedName = getRotatedFilename(BASE_NAME, OUT_DIR);

    stream.end();
    stream = createWriteStream(rotatedName, { flags: "a" });
    console.log(`🌀 Rotated NDJSON file → ${rotatedName}`);

    await retryWithBackoff(async () => {
      await uploadToS3(rotatedName, "demo123");
      const result = await insertBatchFromFile(rotatedName);
      console.log(
        `📊 ClickHouse insert complete: ${result.rowsInserted} rows in ${result.durationMs}ms`
      );
    });

    try {
      await mkdir(UPLOADED_DIR, { recursive: true });
      const destPath = join(UPLOADED_DIR, rotatedName.split("/").pop()!);
      await rename(rotatedName, destPath);
      console.log(`📦 Moved ${rotatedName} → ${destPath}`);
    } catch (err) {
      console.error(`⚠️ Could not move ${rotatedName} after upload:`, err);
    }
  }
}

async function appendToFile(line: string) {
  await rotateIfNeeded();
  stream.write(line + "\n");
}

async function startConsumer() {
  const brokers =
    Array.isArray(env.KAFKA_BROKERS) && env.KAFKA_BROKERS.length > 0
      ? env.KAFKA_BROKERS
      : (env.KAFKA_BROKERS as unknown as string).split(",").filter(Boolean);

  const topic = env.KAFKA_TOPIC_INGEST ?? "osstag.ingest";

  const kafka = new Kafka({ clientId: "osstag-consumer", brokers });
  const consumer = kafka.consumer({ groupId: "osstag-relay-group" });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  console.log(
    `✅ Relay Consumer connected to ${brokers.join(",")} on topic "${topic}"`
  );
  console.log(`📁 Writing NDJSON to ${OUT_DIR}`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = message.value?.toString() ?? "";
      try {
        JSON.parse(payload);
        await appendToFile(payload);
      } catch {
        console.error("⚠️ Skipped invalid JSON message:", payload);
      }
    },
  });
}

startConsumer().catch((err) => {
  console.error("❌ Consumer crashed:", err);
  process.exit(1);
});

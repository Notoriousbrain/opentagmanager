import { Kafka } from "kafkajs";
import { createWriteStream, existsSync, statSync } from "node:fs";
import { rename, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { uploadToS3 } from "./s3"; // 👈 new import

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const OUT_DIR = "/tmp";
const UPLOADED_DIR = join(OUT_DIR, "uploaded");
const BASE_NAME = "osstag-ingest";

let currentFile = join(OUT_DIR, `${BASE_NAME}.ndjson`);
let stream = createWriteStream(currentFile, { flags: "a" });

async function rotateIfNeeded() {
  if (!existsSync(currentFile)) return;

  const stats = statSync(currentFile);
  if (stats.size >= MAX_FILE_BYTES) {
    const rotatedName = join(OUT_DIR, `${BASE_NAME}-${Date.now()}.ndjson`);

    // close and rotate
    stream.end();
    stream = createWriteStream(rotatedName, { flags: "a" });
    console.log(`🌀 Rotated NDJSON file → ${rotatedName}`);

    // async upload
    uploadToS3(rotatedName).then(async () => {
      try {
        // ensure /tmp/uploaded exists
        await mkdir(UPLOADED_DIR, { recursive: true });

        const destPath = join(UPLOADED_DIR, rotatedName.split("/").pop()!);

        await rename(rotatedName, destPath);
        console.log(`📦 Moved ${rotatedName} → ${destPath}`);
      } catch (err) {
        console.error(`⚠️ Could not move ${rotatedName} after upload:`, err);
      }
    });
  }
}

async function appendToFile(line: string) {
  await rotateIfNeeded();
  stream.write(line + "\n");
}

async function startConsumer() {
  const brokers = process.env.KAFKA_BROKERS?.split(",") ?? ["localhost:9092"];
  const topic = process.env.KAFKA_TOPIC_INGEST ?? "osstag.ingest";

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

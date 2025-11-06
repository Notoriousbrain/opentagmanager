#!/usr/bin/env bun
import { Kafka } from "kafkajs";
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";

const DLQ_DIR = path.resolve(".dlq");
const TOPIC = process.env.KAFKA_TOPIC_INGEST ?? "osstag.ingest";
const BROKERS = (process.env.KAFKA_BROKERS ?? "localhost:9092").split(",");
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? Infinity);
const PROJECT = process.argv.find((a) => a.startsWith("--project="))?.split("=")[1];

async function* readNDJSON(filePath: string) {
  const stream = fs.createReadStream(filePath, "utf8");
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.trim().length === 0) continue;
    try {
      const parsed = JSON.parse(line);
      yield parsed;
    } catch (err) {
      console.error(`❌ Invalid JSON in ${filePath}: ${err}`);
    }
  }
}

async function main() {
  if (!fs.existsSync(DLQ_DIR)) {
    console.log("⚠️  No .dlq directory found.");
    process.exit(0);
  }

  const kafka = new Kafka({ brokers: BROKERS });
  const producer = kafka.producer();
  await producer.connect();

  const files = fs
    .readdirSync(DLQ_DIR)
    .filter((f) => f.endsWith(".ndjson"))
    .map((f) => path.join(DLQ_DIR, f));

  if (files.length === 0) {
    console.log("✅ No DLQ files to replay.");
    await producer.disconnect();
    return;
  }

  console.log(`🔁 Replaying ${files.length} DLQ files → ${TOPIC}`);

  let totalSent = 0;

  for (const file of files) {
    console.log(`📂 Reading ${path.basename(file)}`);
    for await (const event of readNDJSON(file)) {
      if (PROJECT && event.project_id !== PROJECT) continue;
      await producer.send({
        topic: TOPIC,
        messages: [{ value: JSON.stringify(event) }],
      });
      totalSent++;
      if (totalSent >= LIMIT) {
        console.log(`⏹️ Reached --limit=${LIMIT}, stopping.`);
        await producer.disconnect();
        return;
      }
    }
  }

  console.log(`✅ Replayed ${totalSent} events from DLQ → Kafka topic ${TOPIC}`);
  await producer.disconnect();
}

main().catch((err) => {
  console.error("💥 Replay failed:", err);
  process.exit(1);
});

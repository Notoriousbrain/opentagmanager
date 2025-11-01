import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { env } from "../../env/src";
import { NormalizedEvent, retryIfRetryable, UpstreamUnavailableError, writeToDLQ } from "../../relay-core/src";
import { insertBatchToClickhouse } from "../../relay-consumer/src/insert-batch-to-clickhouse";
import { parseNDJSONStream } from "../src/utils/ndjson";

const REGION = env.S3_REGION!;
const BUCKET = env.S3_BUCKET!;
const PREFIX = process.argv[2] ?? "ingest/";

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID!,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
  },
});

async function streamToString(stream: Readable): Promise<string> {
  const chunks: any[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function processObject(Key: string) {
  console.log(`📥 Fetching s3://${BUCKET}/${Key}`);
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key });
  const res = await s3.send(cmd);
  const stream = res.Body as Readable;
  if (!stream) {
    console.error(`⚠️ No stream found for ${Key}`);
    return;
  }

  const events: NormalizedEvent[] = [];

  for await (const e of parseNDJSONStream(stream)) {
    events.push(e as NormalizedEvent);
  }

  console.log(`🧩 Parsed ${events.length} events → inserting...`);

  try {
    await retryIfRetryable(
      async () => {
        try {
          await insertBatchToClickhouse(events);
        } catch (err) {
          throw new UpstreamUnavailableError(
            "ClickHouse replay insert failed",
            {
              cause: err,
              detail: { count: events.length, source: Key },
            }
          );
        }
      },
      { attempts: 3, baseDelayMs: 1000 }
    );
  } catch (err) {
    console.error(`⚠️ Failed to insert replay batch from ${Key}:`, err);
    const projectId = events[0]?.projectId ?? "unknown_project";
    writeToDLQ(projectId, events, err);
  }
}

async function replay() {
  const list = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: PREFIX,
    })
  );

  if (!list.Contents || list.Contents.length === 0) {
    console.log(`No files found under ${PREFIX}`);
    return;
  }

  for (const obj of list.Contents) {
    if (!obj.Key?.endsWith(".ndjson")) continue;
    await processObject(obj.Key);
  }

  console.log("✅ Replay complete");
}

replay().catch((err) => {
  console.error("❌ Replay failed:", err);
  process.exit(1);
});

import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@otm/env";
import type { NormalizedEvent } from "@otm/relay-core";
import { retryWithBackoff } from "@otm/core";
import { parseNDJSONStream } from "./utils/ndjson";
import type { Readable } from "node:stream";
import { insertBatchToClickhouse, s3 } from "@otm/relay-consumer";

export async function triggerReplayFromS3(prefix: string) {
  const start = Date.now();
  const bucket = env.S3_BUCKET;
  const listed = await s3.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix })
  );

  const files = listed.Contents?.map((o) => o.Key!) ?? [];
  console.log(`🔁 Found ${files.length} files in s3://${bucket}/${prefix}`);

  let totalEvents = 0;

  for (const key of files) {
    console.log(`📥 Downloading ${key}...`);
    const obj = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    // ✅ Safely convert Body to a Node.js readable stream
    const stream = obj.Body as unknown as Readable;
    if (!stream) {
      console.error(`⚠️ No body stream for ${key}`);
      continue;
    }

    const events: NormalizedEvent[] = [];

    for await (const event of parseNDJSONStream(stream)) {
      events.push(event);
      if (events.length >= 500) {
        await retryWithBackoff(
          () => insertBatchToClickhouse(events.splice(0)),
          {
            attempts: 3,
            baseDelayMs: 1000,
          }
        );
      }
    }

    if (events.length > 0) {
      await insertBatchToClickhouse(events);
    }

    totalEvents += events.length;
  }

  const duration = Date.now() - start;
  console.log(`✅ Replay complete: ${totalEvents} events in ${duration}ms`);

  return { totalFiles: files.length, totalEvents, duration };
}

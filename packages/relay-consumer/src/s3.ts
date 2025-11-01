import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { env } from "@otm/env";
import { retryIfRetryable, UpstreamUnavailableError } from "@otm/relay-core";

const REGION = env.S3_REGION!;
const BUCKET = env.S3_BUCKET!;
const ACCESS_KEY_ID = env.S3_ACCESS_KEY_ID!;
const SECRET_ACCESS_KEY = env.S3_SECRET_ACCESS_KEY!;

export const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

function buildS3Key(filePath: string, projectId?: string) {
  const date = new Date();
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const base = basename(filePath);
  const prefix = projectId
    ? `ingest/${projectId}/${yyyy}/${mm}/${dd}`
    : `ingest/${yyyy}/${mm}/${dd}`;
  return `${prefix}/${base}`;
}

export async function uploadToS3(
  filePath: string,
  projectId?: string,
  maxRetries = 3
): Promise<void> {
  const key = buildS3Key(filePath, projectId);

  await retryIfRetryable(
    async () => {
      try {
        const fileData = await readFile(filePath);
        const command = new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: key,
          Body: fileData,
          ContentType: "application/x-ndjson",
        });

        await s3.send(command);
        console.log(`☁️ Uploaded ${filePath} → s3://${env.S3_BUCKET}/${key}`);
      } catch (err) {
        throw new UpstreamUnavailableError("S3 upload failed", {
          cause: err,
          detail: { key, filePath },
        });
      }
    },
    { attempts: maxRetries, baseDelayMs: 1000 }
  );
}

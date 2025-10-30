import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

const REGION = process.env.S3_REGION!;
const BUCKET = process.env.S3_BUCKET!;
const ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID!;
const SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY!;

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a rotated NDJSON file to S3.
 * @param filePath Local path to NDJSON file (e.g. /tmp/osstag-ingest-<ts>.ndjson)
 * @param prefix Optional prefix (e.g. "raw/2025/10/30/")
 */
export async function uploadToS3(filePath: string, prefix = ""): Promise<void> {
  try {
    const fileData = await readFile(filePath);
    const key = `${prefix}${basename(filePath)}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileData,
      ContentType: "application/x-ndjson",
    });

    await s3.send(command);
    console.log(`☁️ Uploaded ${filePath} → s3://${BUCKET}/${key}`);
  } catch (err) {
    console.error("❌ Failed to upload to S3:", err);
  }
}

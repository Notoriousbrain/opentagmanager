import { canonicalStringify, signHmacSHA256 } from "@otm/sdk";
import type { BatchPayload } from "@otm/types";

export interface SignatureVerificationResult {
  ok: boolean;
  expected?: string;
  received?: string | null;
}

export async function verifySignature(
  batch: BatchPayload,
  secret: string,
  receivedSignature: string | null
): Promise<SignatureVerificationResult> {
  if (!receivedSignature) {
    return { ok: false, received: null };
  }

  const canonical = canonicalStringify(batch);
  const expected = await signHmacSHA256(secret, canonical);

  return {
    ok: receivedSignature === expected,
    expected,
    received: receivedSignature,
  };
}

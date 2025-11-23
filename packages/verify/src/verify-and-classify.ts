import type { BatchPayload, EventProps } from "@otm/types";
import type { DLQErrorCode } from "./dlq";

import { verifyIncomingBatch } from "./verify-incoming";
import { classifyVerificationFailure } from "./classify";

export interface VerifyAndClassifyOptions {
  secret?: string;
  receivedSignature?: string | null;
  maxSkewMs?: number;
  maxBatchEvents?: number;
}

export interface VerifyAndClassifyResult {
  ok: boolean;
  result: Awaited<ReturnType<typeof verifyIncomingBatch>>;
  reason?: DLQErrorCode;
}

export async function verifyAndClassify(
  batch: BatchPayload<EventProps>,
  opts: VerifyAndClassifyOptions = {}
): Promise<VerifyAndClassifyResult> {
  const result = await verifyIncomingBatch(batch, {
    secret: opts.secret,
    receivedSignature: opts.receivedSignature,
    maxSkewMs: opts.maxSkewMs,
    maxBatchEvents: opts.maxBatchEvents,
  });

  if (result.ok) {
    return {
      ok: true,
      result,
    };
  }

  const reason = classifyVerificationFailure(result);

  return {
    ok: false,
    result,
    reason,
  };
}

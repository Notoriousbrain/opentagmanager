import type { BatchPayload, EventProps } from "@otm/types";
import { verifySignature } from "./verify-signature";
import { validateBatchStructure } from "./verify-batch";
import { validateEvents } from "./verify-events";
import { validateTimestampSkew } from "./verify-skew";

export interface IncomingBatchVerificationOptions {
  secret?: string;
  receivedSignature?: string | null;

  maxSkewMs?: number;

  maxBatchEvents?: number;
}

export interface IncomingBatchVerificationResult {
  ok: boolean;
  signatureOk?: boolean;
  structureOk?: boolean;
  eventsOk?: boolean;
  skewOk?: boolean;

  signatureIssues?: {
    expected?: string;
    received?: string | null;
  };

  structureIssues?: { field: string; message: string }[];
  eventIssues?: { index: number; field: string; message: string }[];
  skewMessage?: string;
}

export async function verifyIncomingBatch(
  batch: BatchPayload<EventProps>,
  opts: IncomingBatchVerificationOptions = {}
): Promise<IncomingBatchVerificationResult> {
  const { secret, receivedSignature, maxSkewMs, maxBatchEvents = 50 } = opts;

  const result: IncomingBatchVerificationResult = {
    ok: true,
  };

  if (secret) {
    const sig = await verifySignature(batch, secret, receivedSignature ?? null);

    result.signatureOk = sig.ok;
    result.signatureIssues = {
      expected: sig.expected,
      received: sig.received,
    };

    if (!sig.ok) result.ok = false;
  }

  const struct = validateBatchStructure(batch, maxBatchEvents);
  result.structureOk = struct.ok;
  result.structureIssues = struct.issues;
  if (!struct.ok) result.ok = false;

  const eventCheck = validateEvents(batch);
  result.eventsOk = eventCheck.ok;
  result.eventIssues = eventCheck.issues;
  if (!eventCheck.ok) result.ok = false;

  if (batch.sentAt) {
    const skew = validateTimestampSkew(batch.sentAt, { maxSkewMs });
    result.skewOk = skew.ok;
    result.skewMessage = skew.message;
    if (!skew.ok) result.ok = false;
  } else {
    result.skewOk = false;
    result.skewMessage = "sentAt is required";
    result.ok = false;
  }

  return result;
}

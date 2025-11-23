import type { IncomingBatchVerificationResult } from "./verify-incoming";
import type { DLQErrorCode } from "./dlq";

export function classifyVerificationFailure(
  result: IncomingBatchVerificationResult
): DLQErrorCode {
  if (!result.ok) {
    if (result.signatureOk === false) return "invalid_signature";
    if (result.structureOk === false) return "invalid_structure";
    if (result.eventsOk === false) return "invalid_event";
    if (result.skewOk === false) return "invalid_skew";
  }

  return "internal_error";
}

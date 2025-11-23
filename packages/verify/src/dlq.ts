import type { BatchPayload, EventProps } from "@otm/types";

export type DLQErrorCode =
  | "invalid_signature"
  | "invalid_structure"
  | "invalid_event"
  | "invalid_skew"
  | "internal_error";

export interface DLQRecord {
  id: string;
  receivedAt: string;
  reason: DLQErrorCode;

  batch: BatchPayload<EventProps>;

  meta?: Record<string, unknown>;
}

export function buildDLQRecord(params: {
  reason: DLQErrorCode;
  batch: BatchPayload<EventProps>;
  meta?: Record<string, unknown>;
}): DLQRecord {
  return {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    reason: params.reason,
    batch: params.batch,
    meta: params.meta ?? {},
  };
}

import type { BatchPayload, EventProps } from "@otm/types";

export interface BatchValidationIssue {
  field: string;
  message: string;
}

export interface BatchValidationResult {
  ok: boolean;
  issues: BatchValidationIssue[];
}

export function validateBatchStructure(
  batch: BatchPayload<EventProps>,
  maxBatchEvents: number = 50
): BatchValidationResult {
  const issues: BatchValidationIssue[] = [];

  if (!batch.projectId) {
    issues.push({ field: "projectId", message: "projectId is required" });
  }

  if (!batch.clientId) {
    issues.push({ field: "clientId", message: "clientId is required" });
  }

  if (!batch.sessionId) {
    issues.push({ field: "sessionId", message: "sessionId is required" });
  }

  if (!Array.isArray(batch.events)) {
    issues.push({ field: "events", message: "events must be an array" });
  } else {
    if (batch.events.length === 0) {
      issues.push({
        field: "events",
        message: "batch must contain at least one event",
      });
    }

    if (batch.events.length > maxBatchEvents) {
      issues.push({
        field: "events",
        message: `batch exceeds maxBatchEvents (${maxBatchEvents})`,
      });
    }
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

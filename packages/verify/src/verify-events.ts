import type { EventProps, BatchPayload } from "@otm/types";

export interface EventValidationIssue {
  index: number;
  field: string;
  message: string;
}

export interface EventValidationResult {
  ok: boolean;
  issues: EventValidationIssue[];
}

export function validateEvents(
  batch: BatchPayload<EventProps>
): EventValidationResult {
  const issues: EventValidationIssue[] = [];

  batch.events.forEach((evt, i) => {
    if (!evt.name || typeof evt.name !== "string") {
      issues.push({
        index: i,
        field: "name",
        message: "event name is required",
      });
    }

    const t = new Date(evt.timestamp).getTime();
    if (!evt.timestamp || Number.isNaN(t)) {
      issues.push({
        index: i,
        field: "timestamp",
        message: "invalid ISO timestamp",
      });
    }

    if (typeof evt.props !== "object" || evt.props === null) {
      issues.push({
        index: i,
        field: "props",
        message: "props must be an object",
      });
    }

    if (evt.clientId !== batch.clientId) {
      issues.push({
        index: i,
        field: "clientId",
        message: "event.clientId must match batch.clientId",
      });
    }

    if (evt.sessionId !== batch.sessionId) {
      issues.push({
        index: i,
        field: "sessionId",
        message: "event.sessionId must match batch.sessionId",
      });
    }

    if (typeof evt.context !== "object" || evt.context === null) {
      issues.push({
        index: i,
        field: "context",
        message: "context must be an object",
      });
    }

    if (
      !evt.viewport ||
      typeof evt.viewport.width !== "number" ||
      typeof evt.viewport.height !== "number"
    ) {
      issues.push({
        index: i,
        field: "viewport",
        message: "viewport must contain width and height numbers",
      });
    }
  });

  return {
    ok: issues.length === 0,
    issues,
  };
}

import { randomUUID } from "node:crypto";
import type { IngestBatchInput } from "./schema";
import type { ProjectInfo } from "./resolve";
import type { NormalizedEvent, IngestResponse } from "./types";
import { getLimitsFromEnv } from "./limits";
import { BadRequestError, PayloadTooLargeError } from "./errors";

export async function handleIngestRequest(
  batch: IngestBatchInput,
  project: ProjectInfo
): Promise<IngestResponse & { events: NormalizedEvent[] }> {
  const limits = getLimitsFromEnv();
  const requestId = randomUUID();
  const now = Date.now();

  const bodySizeKB = Buffer.byteLength(JSON.stringify(batch), "utf8") / 1024;
  if (bodySizeKB > limits.maxBodyKB) {
    throw new PayloadTooLargeError("Payload exceeds allowed size", {
      detail: { requestId, bodySizeKB, limitKB: limits.maxBodyKB },
    });
  }

  if (batch.events.length > limits.maxEventsPerBatch) {
    throw new BadRequestError("Too many events in batch", {
      detail: {
        requestId,
        count: batch.events.length,
        limit: limits.maxEventsPerBatch,
      },
    });
  }

  const events: NormalizedEvent[] = [];
  let rejected = 0;

  for (const e of batch.events) {
    try {
      const occurredAt =
        typeof e.timestamp === "string"
          ? Date.parse(e.timestamp)
          : typeof e.timestamp === "number"
            ? e.timestamp
            : now;

      if (!Number.isFinite(occurredAt)) throw new Error("invalid timestamp");

      const normalized: NormalizedEvent = {
        projectId: project.projectId,
        tenantId: project.tenantId ?? null,

        eventId: e.eventId,
        type: e.type,
        data: e.data ?? {},

        occurredAt,
        receivedAt: now,

        ip: null,
        ua: null,
        requestId,
      };

      events.push(normalized);
    } catch {
      rejected++;
    }
  }

  // Align with IngestResponse type
  return {
    requestId,
    eventsAccepted: events.length,
    receivedAt: now,
    ts: now,
    events,
  };
}

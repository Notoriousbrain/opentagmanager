import { randomUUID } from "node:crypto";
import type { IngestBatchInput } from "./schema";
import type { ProjectInfo } from "./resolve";
import type { NormalizedEvent, IngestResponse } from "./types";
import { getLimitsFromEnv } from "./limits";
import { retryIfRetryable } from "./retry";
import {
  BadRequestError,
  KafkaUnavailableError,
  PayloadTooLargeError,
} from "./errors";
import { sendBatchToKafka } from "./producer";

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
  const receivedAt = now;

  for (const e of batch.events) {
    try {
      const occurredAt =
        typeof e.timestamp === "string"
          ? Date.parse(e.timestamp)
          : typeof e.timestamp === "number"
            ? e.timestamp
            : receivedAt;

      if (!Number.isFinite(occurredAt)) throw new Error("invalid timestamp");

      const normalized: NormalizedEvent = {
        projectId: project.projectId,
        tenantId: project.tenantId ?? null,

        eventId: e.eventId,
        type: e.type,

        props: (e as any).props ?? {},
        userId: (e as any).userId ?? null,

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

  await retryIfRetryable(
    async () => {
      try {
        await sendBatchToKafka(events);
      } catch (error) {
        throw new KafkaUnavailableError("Failed to enqueue Kafka batch", {
          cause: error,
          detail: { requestId, count: events.length },
        });
      }
    },
    { attempts: 3, baseDelayMs: 500 }
  );

  return {
    requestId,
    eventsAccepted: events.length,
    receivedAt: now,
    ts: now,
    events,
  };
}

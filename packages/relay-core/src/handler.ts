import type { IngestBatchInput } from "./schema";
import type { ProjectInfo } from "./resolve";
import type { NormalizedEvent } from "./types";
import { randomUUID } from "node:crypto";

export async function handleIngestRequest(
  batch: IngestBatchInput,
  project: ProjectInfo
): Promise<{ accepted: number; rejected: number; events: NormalizedEvent[] }> {
  const events: NormalizedEvent[] = [];
  let rejected = 0;

  const now = Date.now();

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
        requestId: randomUUID(),
      };

      events.push(normalized);
    } catch {
      rejected++;
    }
  }

  return { accepted: events.length, rejected, events };
}

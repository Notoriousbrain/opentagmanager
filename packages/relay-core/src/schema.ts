import { z } from "zod";
import type { RelayLimits } from "./limits.js";

export const ingestEventSchema = z.object({
  eventId: z.string().min(1, "eventId is required"),
  type: z.string().min(1, "type is required"),
  data: z.unknown().optional(),
  timestamp: z.union([z.string(), z.number()]).optional(),
});

export type IngestEventInput = z.infer<typeof ingestEventSchema>;

export function makeIngestBatchSchema(limits: RelayLimits) {
  return z.object({
    sdk: z.string().optional(),
    events: z
      .array(ingestEventSchema)
      .min(1, "at least one event required")
      .max(limits.maxEventsPerBatch, `too many events (max ${limits.maxEventsPerBatch})`),
  });
}

export type IngestBatchInput = z.infer<ReturnType<typeof makeIngestBatchSchema>>;

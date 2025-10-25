import { describe, it, expect } from "bun:test";
import { DEFAULT_LIMITS } from "../src/limits";
import { ingestEventSchema, makeIngestBatchSchema } from "../src/schema";

describe("ingestEventSchema", () => {
  it("accepts minimal valid event", () => {
    const parsed = ingestEventSchema.parse({ eventId: "e1", type: "page_view" });
    expect(parsed.eventId).toBe("e1");
  });

  it("rejects empty type", () => {
    expect(() => ingestEventSchema.parse({ eventId: "e1", type: "" }))
      .toThrow();
  });

  it("accepts number timestamp", () => {
    const parsed = ingestEventSchema.parse({
      eventId: "e1",
      type: "click",
      timestamp: Date.now(),
    });
    expect(typeof parsed.timestamp === "number" || typeof parsed.timestamp === "string").toBe(true);
  });
});

describe("makeIngestBatchSchema", () => {
  const Batch = makeIngestBatchSchema(DEFAULT_LIMITS);

  it("accepts 1..max events", () => {
    const ok = Batch.parse({ events: [{ eventId: "e1", type: "t" }] });
    expect(ok.events.length).toBe(1);
  });

  it("rejects empty events", () => {
    expect(() => Batch.parse({ events: [] })).toThrow();
  });

  it("enforces maxEventsPerBatch", () => {
    const many = Array.from({ length: DEFAULT_LIMITS.maxEventsPerBatch + 1 }, (_, i) => ({
      eventId: `e${i}`,
      type: "t",
    }));
    expect(() => Batch.parse({ events: many })).toThrow();
  });
});

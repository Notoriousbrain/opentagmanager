import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

const RelayHealthSchema = z.object({
  relay: z.enum(["online", "offline"]),
  version: z.string(),

  dependencies: z.object({
    kafka: z.enum(["online", "offline"]),
    clickhouse: z.enum(["online", "offline"]),
    s3: z.enum(["online", "offline"]),
  }),

  ingest: z.object({
    lastEventAt: z.string().nullable(),
    eventsPerMinute: z.number(),
    dlqSize: z.number(),
  }),

  errors: z.object({
    http5xxRate: z.number(),
    signatureMismatchRate: z.number(),
  }),
});
export const systemRouter = createTRPCRouter({
  relayHealth: publicProcedure.query(async () => {
    try {
      const url = process.env.RELAY_URL;
      if (!url) throw new Error("RELAY_URL missing");

      const res = await fetch(`${url}/health`);
      const json = await res.json();

      return RelayHealthSchema.parse(json);
    } catch (err) {
      return {
        relay: "offline",
        version: "unknown",
        dependencies: {
          kafka: "offline",
          clickhouse: "offline",
          s3: "offline",
        },
        ingest: {
          lastEventAt: null,
          eventsPerMinute: 0,
          dlqSize: 0,
        },
        errors: {
          http5xxRate: 1,
          signatureMismatchRate: 1,
        },
      } satisfies z.infer<typeof RelayHealthSchema>;
    }
  }),
});

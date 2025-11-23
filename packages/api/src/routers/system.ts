import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../trpc";

async function checkRelayHealth() {
  try {
    const res = await fetch(
      `${process.env.OSSTAG_PROJECT_URL}/api/ingest/ping`
    );
    if (!res.ok) return { online: false };
    return { online: true };
  } catch {
    return { online: false };
  }
}

const RelayStatusSchema = z.object({
  relay: z.enum(["online", "offline"]),
});

const RelayVersionSchema = z.object({
  version: z.string(),
});

const RELAY_VERSION = "v0.1.0";

export const systemRouter = createTRPCRouter({
  relayStatus: publicProcedure.output(RelayStatusSchema).query(async () => {
    const status = await checkRelayHealth();
    return {
      relay: status.online ? "online" : "offline",
    };
  }),

  relayVersion: publicProcedure.output(RelayVersionSchema).query(() => {
    return { version: RELAY_VERSION };
  }),
});

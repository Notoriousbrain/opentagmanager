import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db, schema } from "@otm/db";
import { bumpInterestCounter, getInterestCount } from "../services/interest";

const memoryLimiter = new Map<string, number>();
const WINDOW_MS = 60_000;

function memoryRateLimit(key: string) {
  const now = Date.now();
  const entry = memoryLimiter.get(key);

  if (!entry) {
    memoryLimiter.set(key, now);
    return true;
  }

  if (now - entry < WINDOW_MS) {
    return false;
  }

  memoryLimiter.set(key, now);
  return true;
}

function getClientInfoFromCtx(ctx: {
  session?: {
    session?: { ipAddress?: string | null; userAgent?: string | null };
  } | null;
}) {
  const ip = ctx?.session?.session?.ipAddress ?? "";
  const ua = ctx?.session?.session?.userAgent ?? "";
  return {
    ip: ip.slice(0, 64),
    ua: ua.slice(0, 512),
  };
}

export const interestRouter = createTRPCRouter({
  count: publicProcedure.query(async () => {
    const count = await getInterestCount();
    return { count };
  }),

  register: publicProcedure
    .input(z.object({ email: z.string().trim().email() }))
    .mutation(async ({ ctx, input }) => {
      const { ip, ua } = getClientInfoFromCtx(ctx);

      const key = ip ? `ip:${ip}` : ua ? `ua:${ua}` : "anon";
      const allowed = memoryRateLimit(key);

      if (!allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limited",
        });
      }

      const email = input.email.toLowerCase();

      try {
        await db.insert(schema.interest).values({
          id: crypto.randomUUID(),
          email,
          ip,
          userAgent: ua,
        });
      } catch (err: any) {
        const pgCode =
          err?.code ||
          err?.cause?.code ||
          err?.originalError?.code ||
          err?.error?.code;

        if (pgCode === "23505") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Already in list",
          });
        }

        console.error("interest.register insert error:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Insert failed",
        });
      }

      await bumpInterestCounter();
      return { ok: true };
    }),
});

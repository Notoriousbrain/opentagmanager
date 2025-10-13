import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db, schema } from "@otm/db";
import { createIpRateLimiter } from "@otm/core";
import { bumpInterestCounter } from "../services/interest";

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

const limiter = createIpRateLimiter({
  prefix: "interest",
  windowSeconds: 60,
  max: 1,
});

export const interestRouter = createTRPCRouter({
  register: publicProcedure
    .input(z.object({ email: z.string().trim().email() }))
    .mutation(async ({ ctx, input }) => {
      const { ip, ua } = getClientInfoFromCtx(ctx);
      await limiter(ip);

      const email = input.email.toLowerCase();

      try {
        await db.insert(schema.interest).values({
          id: crypto.randomUUID(),
          email,
          ip,
          userAgent: ua,
        });
      } catch (e: any) {
        const msg = String(e?.message || "").toLowerCase();
        if (!msg.includes("duplicate") && !msg.includes("unique")) {
          throw e;
        }
      }

      await bumpInterestCounter();

      return { ok: true };
    }),
});

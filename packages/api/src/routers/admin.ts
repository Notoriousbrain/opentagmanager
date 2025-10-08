import { createTRPCRouter } from "../trpc";
import { protectedProcedure, requireRole } from "../trpc";

export const adminRouter = createTRPCRouter({
  stats: protectedProcedure
    .use(requireRole("owner", "admin"))
    .query(async () => {
      return { ok: true, ts: Date.now() };
    }),
});

import { router } from "../trpc";
import { protectedProcedure, requireRole } from "../trpc";

export const adminRouter = router({
  stats: protectedProcedure
    .use(requireRole("owner", "admin"))
    .query(async () => {
      return { ok: true, ts: Date.now() };
    }),
});

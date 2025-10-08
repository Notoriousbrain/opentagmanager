import { router } from "./trpc";
import { meRouter } from "./routers/me";
import { adminRouter } from "./routers/admin";

export const appRouter = router({
  account: meRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

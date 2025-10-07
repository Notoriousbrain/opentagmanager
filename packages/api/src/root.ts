import { router } from "./trpc";
import { meRouter } from "./routers/me";

export const appRouter = router({
  account: meRouter,
});

export type AppRouter = typeof appRouter;

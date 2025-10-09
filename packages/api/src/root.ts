import { createTRPCRouter } from "./trpc";
import { meRouter } from "./routers/me";
import { adminRouter } from "./routers/admin";
import { projectsRouter } from "./routers/projects";

export const appRouter = createTRPCRouter({
  account: meRouter,
  admin: adminRouter,
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;

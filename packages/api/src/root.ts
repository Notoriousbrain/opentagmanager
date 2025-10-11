import { createTRPCRouter } from "./trpc";
import { meRouter } from "./routers/me";
import { adminRouter } from "./routers/admin";
import { projectsRouter } from "./routers/projects";
import { orgsRouter } from "./routers/orgs";

export const appRouter = createTRPCRouter({
  account: meRouter,
  admin: adminRouter,
  projects: projectsRouter,
  orgs: orgsRouter,
});

export type AppRouter = typeof appRouter;

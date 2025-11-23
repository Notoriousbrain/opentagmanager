import { createTRPCRouter } from "./trpc";
import { meRouter } from "./routers/me";
import { adminRouter } from "./routers/admin";
import { projectsRouter } from "./routers/projects";
import { orgsRouter } from "./routers/orgs";
import { interestRouter } from "./routers/interest";
import { relayRouter } from "./routers/relay";
import { eventsRouter } from "./routers/events";
import { systemRouter } from "./routers/system";

export const appRouter = createTRPCRouter({
  account: meRouter,
  admin: adminRouter,
  projects: projectsRouter,
  orgs: orgsRouter,
  interest: interestRouter,
  relay: relayRouter,
  events: eventsRouter,
  system: systemRouter,
});

export type AppRouter = typeof appRouter;

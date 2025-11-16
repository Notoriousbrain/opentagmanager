import { createTRPCRouter } from "./trpc";
import { meRouter } from "./routers/me";
import { adminRouter } from "./routers/admin";
import { projectsRouter } from "./routers/projects";
import { orgsRouter } from "./routers/orgs";
import { interestRouter } from "./routers/interest";
import { relayRouter } from "./routers/relay";
import { eventsRouter } from "./routers/events";

export const appRouter = createTRPCRouter({
  account: meRouter,
  admin: adminRouter,
  projects: projectsRouter,
  orgs: orgsRouter,
  interest: interestRouter,
  relay: relayRouter,
  events: eventsRouter,
});

export type AppRouter = typeof appRouter;

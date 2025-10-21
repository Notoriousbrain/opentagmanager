import { appRouter, createTRPCContext, withCors } from "@otm/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export const runtime = "nodejs";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: async () => createTRPCContext({ headers: req.headers }),
  });

export default withCors(handler);

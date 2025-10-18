import { appRouter, createTRPCContext } from "@otm/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export const runtime = "nodejs";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => createTRPCContext({ headers: req.headers }),
  });

export { handler as GET, handler as POST };

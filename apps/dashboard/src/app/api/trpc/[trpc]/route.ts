import { appRouter, createTRPCContext } from "@otm/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export const runtime = "nodejs";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: async () => {
      return createTRPCContext({ headers: req.headers, req });
    },
  });

export { handler as GET, handler as POST, handler as OPTIONS };

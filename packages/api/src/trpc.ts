import { initTRPC, TRPCError } from "@trpc/server";
import type { inferAsyncReturnType } from "@trpc/server";
import { auth } from "@otm/auth";

export async function createContext(opts: { headers: Headers }) {
  const session = await auth.api.getSession({ headers: opts.headers });
  return { session };
}
export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const authed = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { session: ctx.session } });
});

export const protectedProcedure = t.procedure.use(authed);

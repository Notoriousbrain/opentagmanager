import { initTRPC, TRPCError } from "@trpc/server";
import type { inferAsyncReturnType } from "@trpc/server";
import type { IncomingHttpHeaders } from "http";
import { auth } from "@otm/auth";
import superjson from "superjson";
import { queryClickHouse } from "../../core/src/lib/clickhouse-client";

function toWebHeaders(h: Headers | IncomingHttpHeaders): Headers {
  if (typeof (h as any)?.get === "function") return h as Headers;

  const out = new Headers();
  const obj = h as IncomingHttpHeaders;
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      for (const vv of v) out.append(k, vv);
    } else if (typeof v === "string") {
      out.set(k, v);
    }
  }
  return out;
}

export async function createTRPCContext(opts: {
  headers: Headers | IncomingHttpHeaders;
  req?: Request;
}) {
  const headers = toWebHeaders(opts.headers);

  const forwardedFor =
    headers.get("x-forwarded-for") ||
    headers.get("x-real-ip") ||
    headers.get("x-vercel-forwarded-for");

  let ip = forwardedFor?.split(",")[0]?.trim();

  if (!ip || ip === "unknown" || ip === "") {
    const ua = headers.get("user-agent") ?? "unknown";
    ip = `ua:${ua.slice(0, 50)}`;
  }

  const session = await auth.api.getSession({ headers });

  return { session, ip, queryClickHouse };
}

export type Context = inferAsyncReturnType<typeof createTRPCContext>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const authed = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { session: ctx.session } });
});

export const protectedProcedure = t.procedure.use(authed);

export function requireRole(
  ...roles: Array<"owner" | "admin" | "editor" | "viewer">
) {
  return t.middleware(({ ctx, next }) => {
    const role = ctx.session!.user.role as (typeof roles)[number] | undefined;
    if (!role || !roles.includes(role)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next();
  });
}

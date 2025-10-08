import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "@otm/env";
import { db, schema } from "@otm/db";
import { createAuthMiddleware } from "better-auth/api";
import { desc, eq, inArray } from "drizzle-orm";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.OTM_PROJECT_URL,

  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  advanced: {
    cookiePrefix: "otm",
    cookieSecure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
  user: {
    additionalFields: {
      role: { type: "string", required: true },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const s = ctx.context.newSession;
      if (!s) return;

      const userId = s.user.id;

      const all = await db
        .select({
          id: schema.session.id,
          createdAt: schema.session.createdAt,
          ip: schema.session.ipAddress,
          ua: schema.session.userAgent,
        })
        .from(schema.session)
        .where(eq(schema.session.userId, userId))
        .orderBy(desc(schema.session.createdAt));

      const seen = new Set<string>();
      const dupIds: string[] = [];
      for (const r of all) {
        const key = `${r.ip ?? ""}|${r.ua ?? ""}`;
        if (seen.has(key)) dupIds.push(r.id);
        else seen.add(key);
      }
      if (dupIds.length) {
        await db
          .delete(schema.session)
          .where(inArray(schema.session.id, dupIds));
      }

      const remaining = await db
        .select({ id: schema.session.id })
        .from(schema.session)
        .where(eq(schema.session.userId, userId))
        .orderBy(desc(schema.session.createdAt));

      const toDelete = remaining.slice(3).map((r) => r.id);
      if (toDelete.length) {
        await db
          .delete(schema.session)
          .where(inArray(schema.session.id, toDelete));
      }
    }),
  },
});

export type Auth = typeof auth;
export type Session = Auth["$Infer"]["Session"];

export const getAuth = () => auth;

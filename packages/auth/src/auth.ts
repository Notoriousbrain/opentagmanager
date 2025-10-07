import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "@otm/env";
import { db, schema } from "@otm/db";

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
  },
});

export type Auth = typeof auth;
export type Session = Auth["$Infer"]["Session"];

export const getAuth = () => auth;

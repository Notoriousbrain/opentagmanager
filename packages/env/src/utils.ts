import { clientEnv } from "./client";
import { env } from "./server";

export const getServerUrl = () => {
  const base = env.OTM_PROJECT_URL.replace(/^https?:\/\//, "");
  const scheme = env.NODE_ENV === "production" ? "https" : "http";
  return `${scheme}://${base}`;
};

export const getClientUrl = () => {
  const base = clientEnv.NEXT_PUBLIC_OTM_RELAY_URL ?? getServerUrl();
  return base;
};

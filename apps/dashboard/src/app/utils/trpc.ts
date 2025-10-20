"use client";

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@otm/api";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "") ||
  "http://localhost:3001";

export function getTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${API_URL}/api/trpc`,
        transformer: superjson,
      }),
    ],
  });
}

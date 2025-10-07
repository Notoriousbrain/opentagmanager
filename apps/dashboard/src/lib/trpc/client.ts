"use client";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { QueryClient } from "@tanstack/react-query";
import { trpc } from "./react";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5_000, refetchOnWindowFocus: false },
    },
  });
}

export function makeTrpcClient() {
  return trpc.createClient({
    links: [
      loggerLink({ enabled: () => process.env.NODE_ENV === "development" }),
      httpBatchLink({ url: "/api/trpc" }),
    ],
  });
}

"use client";
import { ReactNode, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc/react";
import { makeQueryClient, makeTrpcClient } from "@/lib/trpc/client";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  const [trpcClient] = useState(() => makeTrpcClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
